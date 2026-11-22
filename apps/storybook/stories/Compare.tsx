import { useCallback, useState, type ReactNode } from "react";

/** One side of a comparison, with a log of what its callbacks received. */
export function useLog() {
  const [entries, setEntries] = useState<string[]>([]);
  const log = useCallback((name: string, value?: unknown) => {
    const text = value === undefined ? name : `${name}(${typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value)})`;
    setEntries((e) => [text, ...e].slice(0, 3));
  }, []);
  return [entries, log] as const;
}

export function Compare({ kb, sj, kbLog, sjLog, note }: { kb: ReactNode; sj: ReactNode; kbLog?: string[]; sjLog?: string[]; note?: ReactNode }) {
  return (
    <div className="compare">
      <div className="compare__col">
        <span className="compare__tag">KB i dag · MUI + Emotion</span>
        <div className="compare__frame">{kb}</div>
        {kbLog && <span className="compare__log">{kbLog.join(" · ") || "Inga händelser än"}</span>}
      </div>
      <div className="compare__col">
        <span className="compare__tag">sj-ui · UI SDK + CSS, samma props</span>
        <div className="compare__frame">{sj}</div>
        {sjLog && <span className="compare__log">{sjLog.join(" · ") || "Inga händelser än"}</span>}
      </div>
      {note && <p className="compare__meta" style={{ gridColumn: "1 / -1" }}>{note}</p>}
    </div>
  );
}
