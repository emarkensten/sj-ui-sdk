import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import KbDepartureCard from "@sj-ab/component-library.ui.departure-card";
import { DatePicker as KbDatePicker } from "@sj-ab/component-library.ui.date-picker";
import { FlowButton as KbFlowButton } from "@sj-ab/component-library.ui.flow-button";
import KbSelect from "@sj-ab/component-library.ui.select";
import KbMenuItem from "@sj-ab/component-library.ui.menu-item";
import SjDepartureCard from "@sj-ui-sdk/sj-ui/legacy/departure-card";
import { DatePicker as SjDatePicker } from "@sj-ui-sdk/sj-ui/legacy/date-picker";
import { FlowButton as SjFlowButton } from "@sj-ui-sdk/sj-ui/legacy/flow-button";
import { Select as SjSelect } from "@sj-ui-sdk/sj-ui/legacy/select";
import { MenuItem as SjMenuItem } from "@sj-ui-sdk/sj-ui/legacy/menu-item";

/*
 * Render time: mounts many copies of a component with the same KB props, KB and sj-ui in turn,
 * and measures from the click to the next frame after React's commit. Each run alternates the
 * two libraries; the table shows the median. Run it in a production build for real numbers
 * (scripts/perf.mjs does that through Playwright).
 */

const leg = { concept: "", id: "1", producer: "SJ", productName: "Snabbtåg", serviceBrandName: "", transportMethod: "", transportMethodDescription: "" };
const departure = new Date("2026-11-24T07:10:00+01:00");
const arrival = new Date("2026-11-24T10:05:00+01:00");

type Lib = "kb" | "sj";
const cases: Record<string, { count: number; render: (lib: Lib, i: number) => ReactNode }> = {
  DepartureCard: {
    count: 100,
    render: (lib, i) => {
      const C = (lib === "kb" ? KbDepartureCard : SjDepartureCard) as unknown as ComponentType<Record<string, unknown>>;
      return (
        <C key={i} departureDate={departure} arrivalDate={arrival} duration={{ days: "", hours: "2", minutes: "55" }} transportations={[leg]}
          transportInformations={[{ code: "BISTRO" }, { code: "WIFI" }]} showPrice price={495 + i} showPoints={false} timeZone="Europe/Stockholm" lang="sv" onClick={() => {}} />
      );
    },
  },
  Select: {
    count: 100,
    render: (lib, i) => {
      const [S, M] = (lib === "kb" ? [KbSelect, KbMenuItem] : [SjSelect, SjMenuItem]) as unknown as [ComponentType<Record<string, unknown>>, ComponentType<Record<string, unknown>>];
      return (
        <S key={i} labelId={`${lib}-s${i}`} labelText="Antal resenärer" value={2} onChange={() => {}}>
          {[1, 2, 3, 4].map((n) => <M key={n} value={n}>{n} resenärer</M>)}
        </S>
      );
    },
  },
  DatePicker: {
    count: 100,
    render: (lib, i) => {
      const D = (lib === "kb" ? KbDatePicker : SjDatePicker) as unknown as ComponentType<Record<string, unknown>>;
      return <D key={i} id={`${lib}-d${i}`} label="Utresa" value="2026-11-24" onAccept={() => {}} onChange={() => {}} />;
    },
  },
  FlowButton: {
    count: 300,
    render: (lib, i) => {
      const B = (lib === "kb" ? KbFlowButton : SjFlowButton) as unknown as ComponentType<Record<string, unknown>>;
      return <B key={i}>Fortsätt</B>;
    },
  },
};

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;

function Bench() {
  const [mounted, setMounted] = useState<{ name: string; lib: Lib } | null>(null);
  const [results, setResults] = useState<Record<string, Record<Lib, number[]>>>({});
  const started = useRef(0);
  const done = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!mounted) return;
    requestAnimationFrame(() => setTimeout(() => done.current?.(), 0));
  }, [mounted]);

  const measure = (name: string, lib: Lib) =>
    new Promise<number>((resolve) => {
      done.current = () => resolve(performance.now() - started.current);
      started.current = performance.now();
      setMounted({ name, lib });
    });
  const clear = () => new Promise<void>((resolve) => { setMounted(null); setTimeout(resolve, 50); });

  const run = async (rounds = 7) => {
    const out: Record<string, Record<Lib, number[]>> = {};
    for (const name of Object.keys(cases)) {
      out[name] = { kb: [], sj: [] };
      for (let r = 0; r < rounds; r++) {
        for (const lib of (r % 2 ? ["sj", "kb"] : ["kb", "sj"]) as Lib[]) {
          out[name][lib].push(await measure(name, lib));
          await clear();
        }
      }
    }
    setResults(out);
  };

  return (
    <div style={{ font: "16px system-ui", padding: 16 }}>
      <button type="button" id="run" onClick={() => run()}>Mät renderingstid</button>
      {Object.keys(results).length > 0 && (
        <table id="results" style={{ marginTop: 16, borderCollapse: "collapse" }}>
          <thead><tr><th align="left">Komponent</th><th>Antal</th><th>KB, median ms</th><th>sj-ui, median ms</th></tr></thead>
          <tbody>
            {Object.entries(results).map(([name, r]) => (
              <tr key={name} data-name={name} data-kb={median(r.kb).toFixed(1)} data-sj={median(r.sj).toFixed(1)} data-count={cases[name].count}>
                <td>{name}</td><td align="right">{cases[name].count}</td><td align="right">{median(r.kb).toFixed(1)}</td><td align="right">{median(r.sj).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ position: "absolute", left: -10000, top: 0, width: 900 }} aria-hidden="true">
        {mounted && Array.from({ length: cases[mounted.name].count }, (_, i) => cases[mounted.name].render(mounted.lib, i))}
      </div>
    </div>
  );
}

const meta = { title: "Mätning/Prestanda", component: Bench, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Bench>;
export default meta;
export const Renderingstid: StoryObj<typeof meta> = {};
