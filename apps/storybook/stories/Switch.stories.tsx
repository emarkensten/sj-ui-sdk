import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import KbSwitch from "@sj-ab/component-library.ui.switch";
import KbFormControlLabel from "@sj-ab/component-library.ui.form-control-label";
import SjSwitch from "@sj-ui-sdk/sj-ui/legacy/switch";
import SjFormControlLabel from "@sj-ui-sdk/sj-ui/legacy/form-control-label";
import { Compare, useLog } from "./Compare";

type Args = { label: string; labelPlacement: "start" | "end"; spaceBetween: boolean; disabled: boolean; startChecked: boolean };

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const [checked, setChecked] = useState(args.startChecked);
  const Sw = kb ? KbSwitch : SjSwitch;
  const Fcl = kb ? KbFormControlLabel : SjFormControlLabel;
  return (
    <Fcl
      label={args.label}
      labelPlacement={args.labelPlacement}
      spaceBetween={args.spaceBetween}
      disabled={args.disabled}
      control={
        <Sw
          name="direct"
          checked={checked}
          disabled={args.disabled}
          onChange={(_e, c) => {
            setChecked(c);
            log("onChange", c);
          }}
        />
      }
    />
  );
}

function SwitchCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return <Compare kb={<Side kb args={args} log={kbOn} />} sj={<Side kb={false} args={args} log={sjOn} />} kbLog={kbLog} sjLog={sjLog} note="Samma kod på båda sidor: Switch i FormControlLabel, onChange(event, checked). Prova med tangentbordet: Tab och mellanslag." />;
}

const meta = {
  title: "Jämförelse/Switch",
  component: SwitchCompare,
  args: { label: "Visa bara direkttåg", labelPlacement: "end", spaceBetween: false, disabled: false, startChecked: true },
  argTypes: { labelPlacement: { control: "inline-radio", options: ["start", "end"] } },
} satisfies Meta<typeof SwitchCompare>;

export default meta;
export const MedEtikett: StoryObj<typeof meta> = { name: "Med etikett" };
export const Installningsrad: StoryObj<typeof meta> = { name: "Inställningsrad", args: { labelPlacement: "start", spaceBetween: true } };
