import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { Switch as UiSwitch, SwitchThumb } from "@ui-sdk/react/switch";
import { cx } from "../../lib/cx";

export interface SwitchProps extends Omit<ComponentProps<typeof UiSwitch>, "children" | "className" | "render"> {
  className?: string;
  /** Visible label. Without it, give the switch an `aria-label`. */
  label?: ReactNode;
  /** Help text under the label. */
  description?: ReactNode;
  /** Where the label sits. SJ's settings rows put it first, the switch at the end. */
  labelPlacement?: "start" | "end";
}

/**
 * On/off setting. With `label` it renders a whole row (label + switch); without it, only the control.
 */
export function Switch({ label, description, labelPlacement = "start", className, ...rest }: SwitchProps) {
  const descId = useId();
  const control = (
    <UiSwitch
      {...rest}
      className={cx("sj-switch", !label && className)}
      aria-describedby={description ? descId : (rest["aria-describedby"] as string | undefined)}
    >
      <SwitchThumb className="sj-switch__thumb" />
    </UiSwitch>
  );
  if (!label) return control;
  return (
    <label className={cx("sj-switch-row", className)} data-label-placement={labelPlacement}>
      <span className="sj-switch-row__text">
        <span className="sj-switch-row__label">{label}</span>
        {description && (
          <span id={descId} className="sj-switch-row__description">
            {description}
          </span>
        )}
      </span>
      {control}
    </label>
  );
}
