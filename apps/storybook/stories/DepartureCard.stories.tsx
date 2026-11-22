import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import KbDepartureCard from "@sj-ab/component-library.ui.departure-card";
import SjDepartureCard from "@sj-ui-sdk/sj-ui/legacy/departure-card";
import { Compare, useLog } from "./Compare";

type Args = { availability: "available" | "soldOut" | "CANCELLED"; showPrice: boolean; price: number; disabled: boolean; withCaption: boolean };

const base = (day: number, h: number, m: number) => {
  const d = new Date();
  d.setDate(d.getDate() + day);
  d.setHours(h, m, 0, 0);
  return d;
};

const transportations = [{ concept: "", id: "1", producer: "SJ", productName: "Snabbtåg", serviceBrandName: "", transportMethod: "", transportMethodDescription: "" }];
const info = [{ code: "BISTRO" as const }, { code: "WIFI" as const }];

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const [active, setActive] = useState(false);
  const C = kb ? KbDepartureCard : SjDepartureCard;
  return (
    <C
      departureDate={base(2, 7, 10)}
      arrivalDate={base(2, 10, 5)}
      duration={{ days: "", hours: "2", minutes: "55" }}
      transportations={transportations}
      transportInformations={info}
      availability={args.availability}
      showPrice={args.showPrice}
      price={args.price}
      showPoints={false}
      disabled={args.disabled}
      active={active}
      timeZone="Europe/Stockholm"
      lang="sv"
      captionText={args.withCaption ? "Ankommer nästa dag" : undefined}
      captionIcon={args.withCaption ? "moon" : undefined}
      CardActionAreaProps={{ "aria-pressed": active }}
      onClick={() => {
        setActive((a) => !a);
        log("onClick");
      }}
    />
  );
}

function DepartureCardCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return (
    <Compare
      kb={<Side kb args={args} log={kbOn} />}
      sj={<Side kb={false} args={args} log={sjOn} />}
      kbLog={kbLog}
      sjLog={sjLog}
      note="Medveten skillnad: med disabled eller en slutsåld avgång stoppar sj-ui klicket. I KB når disabled aldrig kortets knapp, så en slutsåld avgång går att välja (prova). Tågbilden är en ikon i piloten."
    />
  );
}

const meta = {
  title: "Jämförelse/DepartureCard",
  component: DepartureCardCompare,
  args: { availability: "available", showPrice: true, price: 495, disabled: false, withCaption: false },
  argTypes: { availability: { control: "inline-radio", options: ["available", "soldOut", "CANCELLED"] } },
} satisfies Meta<typeof DepartureCardCompare>;

export default meta;
export const Bokningsbar: StoryObj<typeof meta> = { name: "Bokningsbar" };
export const Slutsald: StoryObj<typeof meta> = { name: "Slutsåld", args: { availability: "soldOut" } };
export const Nattag: StoryObj<typeof meta> = { name: "Nattåg", args: { withCaption: true, price: 645 } };
