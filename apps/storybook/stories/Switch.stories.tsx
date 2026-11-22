import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import KbSwitch from "@sj-ab/component-library.ui.switch";
import KbFormControlLabel from "@sj-ab/component-library.ui.form-control-label";
import SjSwitch from "@sj-ui-sdk/sj-ui/legacy/switch";
import SjFormControlLabel from "@sj-ui-sdk/sj-ui/legacy/form-control-label";
import { Compare, useLog } from "./Compare";

/*
 * Every variant of KB's Switch and FormControlLabel, KB on the left and sj-ui on the right with the
 * same props. The log shows what onChange received, including event.target.value.
 */

type FclProps = Omit<ComponentProps<typeof KbFormControlLabel>, "control">;
type SwProps = Partial<ComponentProps<typeof KbSwitch>>;
type Args = { fcl?: Partial<FclProps> | false; sw?: SwProps; startChecked?: boolean };

function Side({ kb, args, log }: { kb: boolean; args: Args; log: (n: string, v?: unknown) => void }) {
  const [checked, setChecked] = useState(Boolean(args.startChecked));
  const Sw = (kb ? KbSwitch : SjSwitch) as typeof KbSwitch;
  const Fcl = (kb ? KbFormControlLabel : SjFormControlLabel) as typeof KbFormControlLabel;
  const control = (
    <Sw
      name="direct"
      checked={checked}
      onChange={(e, c) => {
        setChecked(c);
        log("onChange", { checked: c, value: e.target.value, name: e.target.name });
      }}
      {...args.sw}
    />
  );
  if (args.fcl === false) return control;
  return <Fcl label="Visa bara direkttåg" control={control} {...args.fcl} />;
}

function SwitchCompare(args: Args) {
  const [kbLog, kbOn] = useLog();
  const [sjLog, sjOn] = useLog();
  return <Compare kb={<Side kb args={args} log={kbOn} />} sj={<Side kb={false} args={args} log={sjOn} />} kbLog={kbLog} sjLog={sjLog} />;
}

const meta = { title: "Jämförelse/Switch", component: SwitchCompare, args: { startChecked: true } } satisfies Meta<typeof SwitchCompare>;
export default meta;
type Story = StoryObj<typeof meta>;
const v = (name: string, args: Args = {}): Story => ({ name, args });

export const MedEtikett = v("Med etikett");
export const Av = v("Av", { startChecked: false });
export const Installningsrad = v("Inställningsrad", { fcl: { labelPlacement: "start", spaceBetween: true } });
export const EtikettForst = v("Etikett först", { fcl: { labelPlacement: "start" } });
export const EtikettOver = v("Etikett över", { fcl: { labelPlacement: "top" } });
export const EtikettUnder = v("Etikett under", { fcl: { labelPlacement: "bottom" } });
export const Inaktiverad = v("Inaktiverad", { fcl: { disabled: true } });
export const InaktiveradAv = v("Inaktiverad, av", { startChecked: false, sw: { disabled: true } });
export const NegativMarginal = v("Negativ marginal till vänster", { fcl: { negativeMargins: { left: true } } });
export const NegativMarginalAlla = v("Negativ marginal runt om", { fcl: { negativeMargins: true } });
export const FokusInnanfor = v("Fokusram innanför", { fcl: { insetFocus: true, labelPlacement: "start", spaceBetween: true } });
export const Obligatorisk = v("Obligatorisk", { fcl: { required: true } });
export const EtikettElement = v("Etikett som element", { fcl: { label: <strong>Visa bara direkttåg</strong> } });
export const LangEtikett = v("Lång etikett", { fcl: { label: "Visa bara direkttåg utan byten, även när det finns snabbare resor med ett byte" } });
export const UtanEtikett = v("Utan etikett", { fcl: false, sw: { "aria-label": "Visa bara direkttåg" } });
export const ListOffset = v("Sist i en listrad", { fcl: false, sw: { listOffset: true, "aria-label": "Visa bara direkttåg" } });
export const MedVarde = v("Med value", { sw: { value: "direct-only" } });
