import type { Meta, StoryObj } from "@storybook/react-vite";
import KbFlowButton from "@sj-ab/component-library.ui.flow-button";
import SjFlowButton from "@sj-ui-sdk/sj-ui/legacy/flow-button";
import { ArrowRight as KbArrow } from "@sj-ab/component-library.ui.icons";
import { ArrowRight } from "@sj-ui-sdk/sj-ui/icons";
import { Compare, useLog } from "./Compare";

type Args = {
  children: string;
  color: "green" | "blue" | "orange" | "black" | "white" | "critical" | "grey" | "frosted";
  colorVariant: "primary" | "secondary";
  size: "sm" | "md" | "lg" | "xl";
  fullWidth: boolean;
  disabled: boolean;
  shouldShowSpinner: boolean;
  withSymbol: boolean;
  symbolPosition: "left" | "right" | "top";
};

function FlowButtonCompare({ withSymbol, ...args }: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return (
    <Compare
      kb={<KbFlowButton {...args} symbol={withSymbol ? <KbArrow /> : undefined} onClick={() => kbOn("onClick")} />}
      sj={<SjFlowButton {...args} symbol={withSymbol ? <ArrowRight /> : undefined} onClick={() => sjOn("onClick")} />}
      kbLog={kbLog}
      sjLog={sjLog}
      note="Samma props på båda sidor. sj-ui bygger på SJ:s nya sj-button-kontrakt (type, color, size, borderShape) och mappar KB:s color och colorVariant dit."
    />
  );
}

const meta = {
  title: "Jämförelse/FlowButton",
  component: FlowButtonCompare,
  args: { children: "Fortsätt", color: "green", colorVariant: "primary", size: "xl", fullWidth: false, disabled: false, shouldShowSpinner: false, withSymbol: false, symbolPosition: "left" },
  argTypes: {
    color: { control: "select", options: ["green", "blue", "orange", "black", "white", "critical", "grey", "frosted"] },
    colorVariant: { control: "inline-radio", options: ["primary", "secondary"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    symbolPosition: { control: "inline-radio", options: ["left", "right", "top"] },
  },
} satisfies Meta<typeof FlowButtonCompare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primar: Story = { name: "Primär" };
export const Sekundar: Story = { name: "Sekundär", args: { colorVariant: "secondary", children: "Avbryt" } };
export const Bla: Story = { name: "Blå, mellan", args: { color: "blue", size: "md", withSymbol: true, symbolPosition: "right" } };
export const Spinner: Story = { args: { shouldShowSpinner: true, children: "Sparar" } };
export const Inaktiv: Story = { args: { disabled: true } };
