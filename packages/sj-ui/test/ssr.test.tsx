// @vitest-environment node
// RFC criteria: SSR and Node streaming without a style runtime. Every component renders on the
// server with no `window`, and streams. Styles are static CSS files, so there is nothing to flush.
import { PassThrough } from "node:stream";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import { Button, DatePicker, DepartureCard, Select, Switch, Typography } from "../src";

function Page() {
  return (
    <main>
      <Typography as="h1" variant="largeTitleEmphasized">Sök resa</Typography>
      <Select label="Antal resenärer" options={[{ value: "1", label: "1 resenär" }]} defaultValue="1" />
      <DatePicker label="Utresa" defaultValue="2026-11-24" />
      <Switch label="Visa bara direkttåg" defaultChecked />
      <DepartureCard
        departureDate="2026-11-24T07:10:00+01:00"
        arrivalDate="2026-11-24T10:05:00+01:00"
        transportations={[{ producer: "SJ", productName: "Snabbtåg", id: "1" }]}
        amenities={["BISTRO", "WIFI"]}
        price={495}
      />
      <Button>Fortsätt</Button>
    </main>
  );
}

describe("server rendering", () => {
  it("runs in Node without a DOM", () => {
    expect(typeof (globalThis as { window?: unknown }).window).toBe("undefined");
  });

  it("renders every component to a string", () => {
    const html = renderToString(<Page />);
    expect(html).toContain('data-slot="select-trigger"');
    expect(html).toContain('data-slot="date-picker-input"');
    expect(html).toContain('role="switch"');
    expect(html).toContain("Tisdag 24 november");
    expect(html).toContain("07:10–</span><span>10:05");
    expect(html).toContain("495:-");
    expect(html).not.toMatch(/<style/); // no CSS-in-JS
  });

  it("streams with renderToPipeableStream", async () => {
    const html = await new Promise<string>((resolve, reject) => {
      let out = "";
      const sink = new PassThrough();
      sink.on("data", (c: Buffer) => (out += c.toString()));
      sink.on("end", () => resolve(out));
      const { pipe } = renderToPipeableStream(<Page />, {
        onAllReady: () => pipe(sink),
        onError: reject,
      });
    });
    expect(html).toContain('data-slot="date-picker"');
    expect(html).toContain('aria-pressed="false"');
  });
});
