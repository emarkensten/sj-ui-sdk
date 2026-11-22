import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import KbFlowButton from "@sj-ab/component-library.ui.flow-button";
import SjFlowButton from "@sj-ui-sdk/sj-ui/legacy/flow-button";
import { ArrowRight as KbArrow } from "@sj-ab/component-library.ui.icons";
import { ArrowRight } from "@sj-ui-sdk/sj-ui/icons";
import { Compare, useLog } from "./Compare";

/*
 * Every variant of KB's FlowButton: each color in both variants, each size, each symbol position,
 * spinner, disabled, full width, skeleton and link. KB left, sj-ui right, same props.
 */

type Args = Partial<ComponentProps<typeof KbFlowButton>> & { withSymbol?: boolean };

function FlowButtonCompare({ withSymbol, ...args }: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return (
    <Compare
      kb={<KbFlowButton {...args} symbol={withSymbol ? <KbArrow /> : undefined} onClick={() => kbOn("onClick")} />}
      sj={<SjFlowButton {...(args as ComponentProps<typeof SjFlowButton>)} symbol={withSymbol ? <ArrowRight /> : undefined} onClick={() => sjOn("onClick")} />}
      kbLog={kbLog}
      sjLog={sjLog}
    />
  );
}

const meta = {
  title: "Jämförelse/FlowButton",
  component: FlowButtonCompare,
  args: { children: "Fortsätt" },
  argTypes: {
    color: { control: "select", options: ["green", "blue", "orange", "black", "white", "critical", "grey", "frosted"] },
    colorVariant: { control: "inline-radio", options: ["primary", "secondary"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    symbolPosition: { control: "inline-radio", options: ["left", "right", "top"] },
  },
} satisfies Meta<typeof FlowButtonCompare>;

export default meta;
type Story = StoryObj<typeof meta>;
const v = (name: string, args: Args = {}): Story => ({ name, args });


export const Gron = v("Grön", { color: "green" });
export const GronSekundar = v("Grön, sekundär", { color: "green", colorVariant: "secondary" });
export const Bla = v("Blå", { color: "blue" });
export const BlaSekundar = v("Blå, sekundär", { color: "blue", colorVariant: "secondary" });
export const Orange = v("Orange", { color: "orange" });
export const OrangeSekundar = v("Orange, sekundär", { color: "orange", colorVariant: "secondary" });
export const Svart = v("Svart", { color: "black" });
export const SvartSekundar = v("Svart, sekundär", { color: "black", colorVariant: "secondary" });
export const Vit = v("Vit", { color: "white" });
export const VitSekundar = v("Vit, sekundär", { color: "white", colorVariant: "secondary" });
export const Rod = v("Röd", { color: "critical" });
export const RodSekundar = v("Röd, sekundär", { color: "critical", colorVariant: "secondary" });
export const Gra = v("Grå", { color: "grey" });
export const GraSekundar = v("Grå, sekundär", { color: "grey", colorVariant: "secondary" });
export const Frostad = v("Frostad", { color: "frosted" });
export const FrostadSekundar = v("Frostad, sekundär", { color: "frosted", colorVariant: "secondary" });
export const StorlekLiten = v("Storlek sm", { size: "sm" });
export const StorlekMellan = v("Storlek md", { size: "md" });
export const StorlekStor = v("Storlek lg", { size: "lg" });
export const StorlekExtraStor = v("Storlek xl", { size: "xl" });
export const SymbolVanster = v("Symbol till vänster", { withSymbol: true });
export const SymbolHoger = v("Symbol till höger", { withSymbol: true, symbolPosition: "right" });
export const SymbolOver = v("Symbol över", { withSymbol: true, symbolPosition: "top" });
export const SymbolOverLiten = v("Symbol över, liten", { withSymbol: true, symbolPosition: "top", size: "sm" });
export const Spinner = v("Spinner", { shouldShowSpinner: true, children: "Sparar" });
export const SpinnerSekundar = v("Spinner, sekundär", { shouldShowSpinner: true, colorVariant: "secondary", children: "Sparar" });
export const Inaktiv = v("Inaktiv", { disabled: true });
export const InaktivSekundar = v("Inaktiv, sekundär", { disabled: true, colorVariant: "secondary" });
export const FullBredd = v("Full bredd", { fullWidth: true });
export const Skelett = v("Laddar (skelett)", { isLoading: true });
export const SkelettFullBredd = v("Laddar, full bredd", { isLoading: true, fullWidth: true });
export const Lank = v("Länk", { href: "#vidare" });
export const LangText = v("Lång text", { children: "Fortsätt till betalning och bekräfta resan" });
