import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import KbDepartureCard from "@sj-ab/component-library.ui.departure-card";
import SjDepartureCard from "@sj-ui-sdk/sj-ui/legacy/departure-card";
import { Compare, useLog } from "./Compare";

/*
 * Every variant of KB's DepartureCard, KB on the left and sj-ui on the right with the same props.
 * One story per variant, so the parity check can go through them one by one.
 */

type KbProps = ComponentProps<typeof KbDepartureCard>;
type Args = Partial<KbProps> & { toggle?: boolean };

const at = (day: number, h: number, m: number) => {
  const d = new Date();
  d.setDate(d.getDate() + day);
  d.setHours(h, m, 0, 0);
  return d;
};

const leg = (over: Partial<KbProps["transportations"][number]> = {}) => ({
  concept: "",
  id: "1",
  producer: "SJ",
  productName: "Snabbtåg",
  serviceBrandName: "",
  transportMethod: "",
  transportMethodDescription: "",
  ...over,
});

const base: Args = {
  departureDate: at(2, 7, 10),
  arrivalDate: at(2, 10, 5),
  duration: { days: "", hours: "2", minutes: "55" },
  transportations: [leg()],
  transportInformations: [{ code: "BISTRO" }, { code: "WIFI" }],
  showPrice: true,
  price: 495,
  showPoints: false,
  timeZone: "Europe/Stockholm",
  lang: "sv",
  toggle: true,
};

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const [active, setActive] = useState(Boolean(args.active));
  const C = (kb ? KbDepartureCard : SjDepartureCard) as unknown as (p: KbProps) => React.ReactElement;
  const { toggle, ...props } = args;
  return (
    <C
      {...(props as KbProps)}
      active={active}
      CardActionAreaProps={{ "aria-pressed": active, ...props.CardActionAreaProps }}
      onClick={() => {
        if (toggle) setActive((a) => !a);
        log("onClick");
      }}
    />
  );
}

function DepartureCardCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return <Compare kb={<Side kb args={args} log={kbOn} />} sj={<Side kb={false} args={args} log={sjOn} />} kbLog={kbLog} sjLog={sjLog} />;
}

const meta = {
  title: "Jämförelse/DepartureCard",
  component: DepartureCardCompare,
  args: base,
  argTypes: {
    availability: { control: "select", options: ["available", "soldOut", "CANCELLED", "DISTURBANCE", "TOO_FEW_PRIO_POINTS", "SALES_STOP", "unavailable"] },
    size: { control: "inline-radio", options: [undefined, "small", "medium", "large"] },
  },
} satisfies Meta<typeof DepartureCardCompare>;

export default meta;
type Story = StoryObj<typeof meta>;
const v = (name: string, args: Args = {}): Story => ({ name, args });

export const Bokningsbar = v("Bokningsbar");
export const Vald = v("Vald", { active: true });
export const Slutsald = v("Slutsåld", { availability: "soldOut" });
export const Installd = v("Inställd", { availability: "CANCELLED" });
export const Trafikstorning = v("Trafikstörning", { availability: "DISTURBANCE" });
export const Fullbokad = v("Fullbokad", { availability: "SALES_STOP" });
export const PrioPoang = v("Fler Prio-poäng behövs", { availability: "TOO_FEW_PRIO_POINTS", showPoints: true, points: 2400 });
export const Inaktiverad = v("Inaktiverad", { disabled: true, toggle: false });
export const Nattag = v("Nattåg", {
  captionText: "Ankommer nästa dag",
  captionIcon: "moon",
  captionSrText: "Nattåg, ankommer nästa dag",
  price: 645,
  arrivalDate: at(3, 7, 40),
  duration: { days: "", hours: "9", minutes: "30" },
  transportations: [leg({ productName: "Nattåg", concept: "GENERIC_NIGHT_TRAIN" })],
});
export const NattagMarkerad = v("Nattåg, markerad text", { captionText: "Ankommer nästa dag", captionIcon: "moon", captionColor: "highlighted" });
export const Badge = v("Badge", { badgeLabel: "Snabbast", badgeColor: "green" });
export const BadgeLang = v("Badge, lång text", { badgeLabel: "Ersättningsbuss mellan Hallsberg och Laxå på grund av banarbete", badgeColor: "orange" });
export const Lagpris = v("Lågpris med pristexter", { priceType: "lowPrice", priceText: "Endast 2 platser kvar", priceTextType: "lowPrice", secondaryPriceText: "Ombokningsbar", secondaryPriceTextType: "secondary" });
export const PrisOchPoang = v("Pris och poäng", { showPoints: true, points: 1200, price: 95 });
export const BaraPoang = v("Bara poäng", { showPrice: false, showPoints: true, points: 3600 });
export const UtanPris = v("Utan pris", { showPrice: false });
export const LaggTill = v("Lägg till fr.", { pricePrefix: "addFrom", price: 129 });
export const UtanPrefix = v("Utan prefix", { hidePricePrefix: true });
export const Euro = v("Euro", { currency: "EUR", price: 49.5 });
export const DyrtPris = v("Pris över tusen", { price: 12495 });
export const PrisInaktivt = v("Pris inaktivt", { disabledPrice: true });
const comfort = [
  { category: "SECOND", isAvailable: true, soldOut: false },
  { category: "SECOND_CALM", isAvailable: true, soldOut: true },
  { category: "FIRST", isAvailable: true, soldOut: false },
  { category: "SLEEPER", isAvailable: false, soldOut: false },
] as KbProps["comfortAvailabilities"];
export const Reseklasser = v("Reseklasser", { hasComfortAvailabilities: true, comfortAvailabilities: comfort });
export const LaddarPris = v("Laddar pris", { isLoadingPrice: true, hasComfortAvailabilities: true, comfortAvailabilities: comfort });
export const BussOchTag = v("Tåg och buss", {
  transportations: [leg({ id: "1" }), leg({ id: "2", producer: "SJ", productName: "Ersättningsbuss", transportMethod: "BUS" })],
  duration: { days: "", hours: "3", minutes: "40" },
});
export const TreDelresor = v("Tre delresor", {
  transportations: [leg({ id: "1", concept: "X2000" }), leg({ id: "2", producer: "Mälartåg", productName: "Regionaltåg", concept: "MALARTAG" }), leg({ id: "3", producer: "Taxi", productName: "", transportMethod: "TAXI" })],
});
export const FyraDelresor = v("Fyra delresor", {
  transportations: [leg({ id: "1" }), leg({ id: "2", transportMethod: "BUS" }), leg({ id: "3", transportMethod: "FERRY", producer: "Färja", productName: "" }), leg({ id: "4", transportMethod: "TAXI", producer: "Taxi", productName: "" })],
});
export const X2000 = v("X 2000", { transportations: [leg({ concept: "X2000" })] });
export const SJ3000 = v("SJ 3000", { transportations: [leg({ concept: "SJ3000" })] });
export const Regina = v("Regina", { transportations: [leg({ producer: "SJ", productName: "Regional", concept: "REGINA" })] });
export const EuroNight = v("EuroNight", { transportations: [leg({ producer: "SJ", productName: "EuroNight", concept: "EURONIGHT" })] });
export const Varumarke = v("Tågnummer och varumärke", { transportations: [leg({ id: "421", serviceBrandName: "SJ Prio", transportMethodDescription: "Tåg" })] });
export const AllaSymboler = v("Alla symboler", {
  transportInformations: ["BIKE", "BISTRO", "CATERING", "FAMILY", "PETS", "POWEROUTLET", "WHEELCHAIR", "WIFIPLUS"].map((code) => ({ code })) as KbProps["transportInformations"],
});
export const MedLank = v("Restid som länk", { durationLink: { component: "button", onClick: () => {} } as KbProps["durationLink"] });
export const BegransadKlickyta = v("Begränsad klickyta", {
  limitClickArea: true,
  limitedClickAreaSlot: <span>Plattform 4</span>,
  children: <a href="#hallplatser" style={{ display: "block", padding: 16 }}>Visa hållplatser</a>,
} as Args);
export const InnehallIKortet = v("Innehåll i kortet", { children: <span>Byte i Hallsberg, 12 min</span> });
export const Engelska = v("Engelska", { lang: "en", captionText: "Arrives next day", captionIcon: "moon", availability: "available" });
export const EngelskaSlutsald = v("Engelska, slutsåld", { lang: "en", availability: "soldOut" });
export const EgenOversattning = v("Egen översättning", { availability: "soldOut", translation: { soldOut: "Inga platser kvar" } as KbProps["translation"] });
export const Liten = v("Storlek small", { size: "small" });
export const Mellan = v("Storlek medium", { size: "medium" });
export const MellanSlutsald = v("Storlek medium, slutsåld", { size: "medium", availability: "soldOut", hasComfortAvailabilities: true, comfortAvailabilities: comfort });
export const LitenSlutsald = v("Storlek small, slutsåld", { size: "small", availability: "soldOut", badgeLabel: "Snabbast", badgeColor: "green" });
export const Stor = v("Storlek large", { size: "large" });
export const Avrundning = v("Mindre avrundning", { borderRadiusOverride: "sm" } as Args);
export const JusteraVanster = v("Bilden i linje med texten", { adjustLeft: true });
export const AvrundningAldre = v("Avrundning med äldre namn", { borderRadiusOverride: "large" } as Args);
export const AvrundningKapsel = v("Avrundning capsule", { borderRadiusOverride: "capsule", size: "small" } as Args);
export const TidSomRubrik = v("Tiden som h3", { timeLabelTypographyElement: "h3" });
export const ArvdaPropsUtanEffekt = v("Ärvda props utan effekt", { isLoading: true, showTransportImage: false, applyGradient: true, hasMarginTop: false, elevation: 3 } as Args);
