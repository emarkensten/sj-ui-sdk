import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import KbDatePicker from "@sj-ab/component-library.ui.date-picker";
import KbLocalizationProvider from "@sj-ab/component-library.ui.localization-provider";
import SjDatePicker from "@sj-ui-sdk/sj-ui/legacy/date-picker";
import SjLocalizationProvider from "@sj-ui-sdk/sj-ui/legacy/localization-provider";
import { Compare, useLog } from "./Compare";

type Args = { label: string; helperText: string; hasExternalLabel: boolean; disablePast: boolean; disabled: boolean; required: boolean; lang: "sv" | "en" };

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(d);
};

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const [value, setValue] = useState(iso(2));
  const D = kb ? KbDatePicker : SjDatePicker;
  const L = kb ? KbLocalizationProvider : SjLocalizationProvider;
  return (
    <L locale={args.lang}>
      <D
        id={kb ? "kb-date" : "sj-date"}
        label={args.label}
        lang={args.lang}
        value={value}
        helperText={args.helperText || undefined}
        hasExternalLabel={args.hasExternalLabel}
        disablePast={args.disablePast}
        disabled={args.disabled}
        required={args.required}
        maxDate={iso(90)}
        timeZone="Europe/Stockholm"
        fullWidth
        autoComplete="off"
        onAccept={(d) => {
          setValue(d);
          log("onAccept", d);
        }}
        onChange={(e) => log("onChange", e.target.value)}
      />
    </L>
  );
}

function DatePickerCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return (
    <Compare
      kb={<Side kb args={args} log={kbOn} />}
      sj={<Side kb={false} args={args} log={sjOn} />}
      kbLog={kbLog}
      sjLog={sjLog}
      note="Samma kod, ISO-datum in och ut. KB drar in MUI X, date-fns och 24 SJ-paket. sj-ui har inget datumbibliotek: UI SDK sköter kalendern, fokus och tangentbord. Prova att skriva datumet, piltangenter i kalendern och PageUp/PageDown."
    />
  );
}

const meta = {
  title: "Jämförelse/DatePicker",
  component: DatePickerCompare,
  args: { label: "Utresa", helperText: "", hasExternalLabel: false, disablePast: true, disabled: false, required: false, lang: "sv" },
  argTypes: { lang: { control: "inline-radio", options: ["sv", "en"] } },
} satisfies Meta<typeof DatePickerCompare>;

export default meta;
export const Standard: StoryObj<typeof meta> = {};
export const Engelska: StoryObj<typeof meta> = { args: { lang: "en", label: "Outbound" } };
