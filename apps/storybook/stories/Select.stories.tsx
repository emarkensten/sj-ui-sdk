import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import KbSelect from "@sj-ab/component-library.ui.select";
import KbMenuItem from "@sj-ab/component-library.ui.menu-item";
import { Search } from "@sj-ab/component-library.ui.icons";
import SjSelect from "@sj-ui-sdk/sj-ui/legacy/select";
import SjMenuItem from "@sj-ui-sdk/sj-ui/legacy/menu-item";
import { Compare, useLog } from "./Compare";

/*
 * Every variant of KB's Select and its MenuItem rows, KB on the left and sj-ui on the right with the
 * same props. The log shows what onChange received. Below 600 px both open the list as a sheet.
 */

type SelectProps = Partial<ComponentProps<typeof KbSelect>>;
type ItemProps = Partial<ComponentProps<typeof KbMenuItem>>;
type Args = {
  select?: SelectProps;
  /** The rows: label, value and MenuItem props. */
  items?: { label: string; value: unknown; props?: ItemProps }[];
  initial?: unknown;
  note?: string;
};

const travellers = ["1 resenär", "2 resenärer", "3 resenärer", "4 resenärer"].map((label, i) => ({ label, value: String(i + 1), props: i === 3 ? { disabled: true } : undefined }));

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const items = args.items ?? travellers;
  const [value, setValue] = useState<unknown>("initial" in args ? args.initial : "2");
  const S = (kb ? KbSelect : SjSelect) as typeof KbSelect;
  const M = (kb ? KbMenuItem : SjMenuItem) as typeof KbMenuItem;
  return (
    <S
      labelId={kb ? "kb-select" : "sj-select"}
      labelText="Antal resenärer"
      fullWidth
      value={value as string}
      onChange={(e, child) => {
        setValue(e.target.value);
        log("onChange", { value: e.target.value, type: Array.isArray(e.target.value) ? "array" : typeof e.target.value, child: (child as { props?: { children?: unknown } } | undefined)?.props?.children });
      }}
      {...args.select}
    >
      {items.map((o) => (
        <M key={o.label} value={o.value as string} {...o.props}>
          {o.label}
        </M>
      ))}
    </S>
  );
}

function SelectCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return <Compare kb={<Side kb args={args} log={kbOn} />} sj={<Side kb={false} args={args} log={sjOn} />} kbLog={kbLog} sjLog={sjLog} note={args.note} />;
}

const meta = {
  title: "Jämförelse/Select",
  component: SelectCompare,
  args: {},
} satisfies Meta<typeof SelectCompare>;

export default meta;
type Story = StoryObj<typeof meta>;
const v = (name: string, args: Args): Story => ({ name, args });

const seats = ["Fönster", "Gång", "Mittemot", "Bord"];
const extras = ["Frukost", "Wifi", "Extra benutrymme"];

export const Standard: Story = { args: { note: "Samma kod: MenuItem-barn och onChange med event.target.value. Prova piltangenter, Home/End och första bokstaven. Under 600 px öppnas listan som ett ark." } };
export const MedHjalptext = v("Med hjälptext", { select: { helperText: "Barn under 7 år reser gratis" } });
export const ExternEtikett = v("Extern etikett", { select: { hasExternalLabel: true } });
export const Fel = v("Fel", { select: { error: true, helperText: "Välj antal resenärer" } });
export const Inaktiverad = v("Inaktiverad", { select: { disabled: true } });
export const Laddar = v("Laddar (isLoading)", { select: { isLoading: true } });
export const Laddar2 = v("Laddar, extern etikett", { select: { isLoading: true, hasExternalLabel: true } });
export const Rundad = v("Rundad (rounded)", { select: { rounded: true } });
export const HornradieMd = v("Hörnradie md", { select: { borderRadiusOverride: "md" } as SelectProps });
export const TathetCompact = v("Täthet compact", { select: { density: "compact" } as SelectProps });
export const TathetDense = v("Täthet dense", { select: { density: "dense" } as SelectProps });
export const TathetTight = v("Täthet tight", { select: { density: "tight" } as SelectProps });
export const MenyTathet = v("Täthet i menyn (menuDensity)", { select: { menuDensity: "dense" } as SelectProps });
export const Startikon = v("Startikon", { select: { startIcon: <Search /> } });
export const Tom = v("Inget valt", { initial: "" });
export const TomMedPlatshallare = v("Inget valt, displayEmpty", { initial: "", select: { displayEmpty: true, renderValue: (val: unknown) => (val ? String(val) : "Välj antal") }, note: "Avsiktlig skillnad. KB lägger etiketten ovanpå texten. sj-ui lyfter upp etiketten i ramen." });
export const EgenVisning = v("renderValue", { select: { renderValue: (val: unknown) => `${val} st` } });
export const Siffror = v("Siffervärden", { items: travellers.map((o, i) => ({ ...o, value: i + 1 })), initial: 2, note: "Värdena är siffror. Loggen visar att onChange ger tillbaka en siffra." });
export const Flerval = v("Flerval (multiple)", { items: extras.map((label) => ({ label, value: label })), initial: ["Wifi"], select: { multiple: true, labelText: "Tillval" } });
export const FlervalKryssrutor = v("Flerval med kryssrutor", { items: extras.map((label) => ({ label, value: label, props: { variant: "checkbox" } })), initial: ["Wifi"], select: { multiple: true, labelText: "Tillval" } });
export const Radioknappar = v("MenuItem radio", { items: seats.map((label) => ({ label, value: label, props: { variant: "radio" } })), initial: "Gång", select: { labelText: "Plats" } });
export const Brytare = v("MenuItem switch", { items: extras.map((label) => ({ label, value: label, props: { variant: "switch" } })), initial: ["Frukost"], select: { multiple: true, labelText: "Tillval" } });
export const UtanAvdelare = v("Utan avdelare", { items: travellers.map((o) => ({ ...o, props: { ...o.props, divider: false } })) });
export const EgenLayout = v("customLayout", { items: seats.map((label) => ({ label, value: label, props: { customLayout: true } })), initial: "Bord", select: { labelText: "Plats" } });
export const Engelska = v("Engelska (lang en)", { select: { lang: "en", labelText: "Travellers" } });
export const InteObligatorisk = v("Inte obligatorisk", { select: { required: false } });
export const Smal = v("Inte fullWidth", { select: { fullWidth: false } });
export const AutoBredd = v("autoWidth", { select: { autoWidth: true, fullWidth: false } });
export const OppnaStang = v("onOpen och onClose", {
  select: { onOpen: () => console.log("onOpen"), onClose: () => console.log("onClose") },
  note: "Avsiktlig skillnad. I KB ersätter en egen onOpen KB:s interna hanterare, så listan öppnas aldrig. sj-ui anropar din onOpen och öppnar listan.",
});
export const LangLista = v("Lång lista", { items: Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1} resenärer`, value: String(i + 1) })), note: "Listan scrollar inom menyn och arket." });
