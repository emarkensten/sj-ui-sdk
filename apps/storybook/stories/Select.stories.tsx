import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import KbSelect from "@sj-ab/component-library.ui.select";
import KbMenuItem from "@sj-ab/component-library.ui.menu-item";
import SjSelect from "@sj-ui-sdk/sj-ui/legacy/select";
import SjMenuItem from "@sj-ui-sdk/sj-ui/legacy/menu-item";
import { Compare, useLog } from "./Compare";

type Args = { labelText: string; helperText: string; hasExternalLabel: boolean; error: boolean; disabled: boolean; required: boolean };

const options = ["1 resenär", "2 resenärer", "3 resenärer", "4 resenärer"];

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const [value, setValue] = useState("2");
  const S = kb ? KbSelect : SjSelect;
  const M = kb ? KbMenuItem : SjMenuItem;
  return (
    <S
      labelId={kb ? "kb-travellers" : "sj-travellers"}
      labelText={args.labelText}
      helperText={args.helperText || undefined}
      hasExternalLabel={args.hasExternalLabel}
      error={args.error}
      disabled={args.disabled}
      required={args.required}
      fullWidth
      value={value}
      onChange={(e) => {
        setValue(String(e.target.value));
        log("onChange", e.target.value);
      }}
    >
      {options.map((o, i) => (
        <M key={o} value={String(i + 1)} disabled={i === 3}>
          {o}
        </M>
      ))}
    </S>
  );
}

function SelectCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return (
    <Compare
      kb={<Side kb args={args} log={kbOn} />}
      sj={<Side kb={false} args={args} log={sjOn} />}
      kbLog={kbLog}
      sjLog={sjLog}
      note="Samma kod: MenuItem-barn och onChange med event.target.value. sj-ui visar listan som bottenark på små pekskärmar (presentation auto). Prova piltangenter och att skriva första bokstaven."
    />
  );
}

const meta = {
  title: "Jämförelse/Select",
  component: SelectCompare,
  args: { labelText: "Antal resenärer", helperText: "", hasExternalLabel: false, error: false, disabled: false, required: false },
} satisfies Meta<typeof SelectCompare>;

export default meta;
export const Standard: StoryObj<typeof meta> = {};
export const MedHjalptext: StoryObj<typeof meta> = { name: "Med hjälptext", args: { helperText: "Barn under 7 år reser gratis" } };
export const ExternEtikett: StoryObj<typeof meta> = { name: "Extern etikett", args: { hasExternalLabel: true } };
export const Fel: StoryObj<typeof meta> = { args: { error: true, helperText: "Välj antal resenärer" } };
