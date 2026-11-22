// The agent bridge sees sj-ui components and changes them through their own APIs,
// so the app's callbacks run as if a person had made the change.
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { createSjAgent } from "../src/agent";
import { Switch, DepartureCard } from "../src";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("lists sj-ui components and acts on them, and leaves confirm steps to a person", async () => {
  const agent = createSjAgent();
  const changes: boolean[] = [];
  let pressed = 0;

  function App() {
    const [on, setOn] = useState(false);
    return (
      <>
        <Switch label="Visa bara direkttåg" checked={on} onCheckedChange={(v: boolean) => { setOn(v); changes.push(v); }} />
        <DepartureCard
          departureDate="2026-11-24T08:10:00+01:00"
          arrivalDate="2026-11-24T11:05:00+01:00"
          transportations={[{ producer: "SJ", productName: "Snabbtåg", id: "1" }]}
          price={495}
          onClick={() => pressed++}
        />
        <div data-agent-confirm="Betala 495 kr">
          <DepartureCard
            departureDate="2026-11-24T09:10:00+01:00"
            arrivalDate="2026-11-24T12:05:00+01:00"
            transportations={[{ producer: "SJ", productName: "Snabbtåg", id: "2" }]}
            price={595}
            onClick={() => pressed++}
          />
        </div>
      </>
    );
  }

  const el = document.createElement("div");
  document.body.append(el);
  await act(async () => createRoot(el).render(<App />));

  const snap = agent.snapshot();
  const sw = snap.find((c) => c.component === "switch");
  expect(sw?.label).toBe("Visa bara direkttåg");
  expect(snap.filter((c) => c.component === "button").length).toBeGreaterThanOrEqual(2);

  await act(async () => {
    await agent.act({ steps: [{ ref: sw!.ref, action: "setChecked", args: [true] }] });
  });
  expect(changes).toEqual([true]);

  const cards = snap.filter((c) => c.component === "button");
  await act(async () => {
    await agent.act({ steps: [{ ref: cards[0].ref, action: "press" }] });
  });
  expect(pressed).toBe(1);

  let failed = false;
  await act(async () => {
    const r = await agent.act({ steps: [{ ref: cards[1].ref, action: "press" }] });
    failed = JSON.stringify(r).includes("confirm") || JSON.stringify(r).toLowerCase().includes("person");
  });
  expect(pressed).toBe(1);
  expect(failed).toBe(true);
});
