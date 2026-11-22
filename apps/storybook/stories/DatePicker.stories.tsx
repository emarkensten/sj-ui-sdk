import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import KbDatePicker from "@sj-ab/component-library.ui.date-picker";
import KbLocalizationProvider from "@sj-ab/component-library.ui.localization-provider";
import SjDatePicker from "@sj-ui-sdk/sj-ui/legacy/date-picker";
import SjLocalizationProvider from "@sj-ui-sdk/sj-ui/legacy/localization-provider";
import { Compare, useLog } from "./Compare";

/*
 * Every variant of KB's DatePicker, KB on the left and sj-ui on the right with the same props and the
 * same parent code: onChange keeps what is typed, onAccept takes a finished date. The log shows both.
 */

type PickerProps = Partial<ComponentProps<typeof KbDatePicker>>;
type Args = { picker?: PickerProps; initial?: number | string | null; note?: string };

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(d);
};

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const lang = args.picker?.lang ?? "sv";
  const start = args.initial === undefined ? iso(2) : typeof args.initial === "number" ? iso(args.initial) : (args.initial ?? "");
  const [value, setValue] = useState(start);
  const D = (kb ? KbDatePicker : SjDatePicker) as typeof KbDatePicker;
  const L = kb ? KbLocalizationProvider : SjLocalizationProvider;
  return (
    <L locale={lang}>
      <D
        id={kb ? "kb-date" : "sj-date"}
        label="Utresa"
        lang={lang}
        value={value}
        disablePast
        maxDate={iso(90)}
        timeZone="Europe/Stockholm"
        fullWidth
        autoComplete="off"
        onAccept={(d) => {
          setValue(d);
          log("onAccept", d);
        }}
        onChange={(e) => {
          setValue(e.target.value);
          log("onChange", e.target.value);
        }}
        {...args.picker}
      />
    </L>
  );
}

function DatePickerCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return <Compare kb={<Side kb args={args} log={kbOn} />} sj={<Side kb={false} args={args} log={sjOn} />} kbLog={kbLog} sjLog={sjLog} note={args.note} />;
}

const meta = {
  title: "Jämförelse/DatePicker",
  component: DatePickerCompare,
  args: {},
} satisfies Meta<typeof DatePickerCompare>;

export default meta;
type Story = StoryObj<typeof meta>;
const v = (name: string, args: Args): Story => ({ name, args });

export const Standard: Story = { args: { note: "Samma kod i båda: onChange med det som skrivs, onAccept med ett färdigt datum. Skriv ett datum (2026-12-24), tryck Enter eller lämna fältet, eller välj i kalendern. Under 600 px öppnas kalendern som ett ark." } };
export const Engelska = v("Engelska", { picker: { lang: "en", label: "Outbound" } });
export const Idag = v("Idag", { initial: 0 });
export const Imorgon = v("Imorgon", { initial: 1 });
export const NastaAr = v("Nästa år (visar året)", { initial: 60 });
export const Tom = v("Tomt värde", { initial: null });
export const Platshallare = v("Tomt med placeholder", { initial: null, picker: { placeholder: "ÅÅÅÅ-MM-DD" } });
export const MedHjalptext = v("Med hjälptext", { picker: { helperText: "Du kan resa i 90 dagar framåt" } });
export const Fel = v("Fel (errorHelperText)", { picker: { errorHelperText: "Välj ett datum efter idag" } });
export const ExternEtikett = v("Extern etikett", { picker: { hasExternalLabel: true } });
export const Inaktiverad = v("Inaktiverad", { picker: { disabled: true } });
export const Laddar = v("Laddar (isLoading)", { picker: { isLoading: true } });
export const Veckonummer = v("Veckonummer", { picker: { hasWeekNumbers: true } });
export const Knappar = v("Avbryt och Klar (hasActionButtons)", { picker: { hasActionButtons: true } });
export const ArVy = v("Välj år (secondaryView year)", { picker: { secondaryView: "year", disablePast: false, maxDate: undefined } });
export const EgetFormat = v("Eget format (displayFormat)", { picker: { displayFormat: "yyyy-MM-dd" } });
export const EgetFormat2 = v("Eget format, dd/MM/yyyy", { picker: { displayFormat: "dd/MM/yyyy" } });
export const Utresa = v("journeyDirection outward", { picker: { journeyDirection: "outward" } });
export const MinMax = v("minDate och maxDate", { picker: { disablePast: false, minDate: iso(5), maxDate: iso(20) }, initial: 7 });
export const TathetCompact = v("Täthet compact", { picker: { density: "compact" } as PickerProps });
export const TathetTight = v("Täthet tight", { picker: { density: "tight" } as PickerProps });
export const Hornradie = v("Hörnradie md", { picker: { borderRadiusOverride: "md" } as PickerProps });
export const InteFullBredd = v("Inte fullWidth", { picker: { fullWidth: false } });
export const EgnaTexter = v("customTranslation", { picker: { customTranslation: { sv: { today: "I dag", okText: "Välj" } } } });
export const InteObligatorisk = v("Inte obligatorisk", { picker: { required: false } });
