/*
 * Legacy FormControlLabel: wraps a control (Switch, Checkbox, Radio) with a clickable label.
 * Drop-in for `@sj-ab/component-library.ui.form-control-label`. Like MUI's, it hands checked,
 * name, onChange, value, inputRef, disabled and required on to the control when the control
 * doesn't set them itself.
 */
import type { ChangeEvent, LabelHTMLAttributes, ReactElement, ReactNode, Ref } from "react";
import { cloneElement, isValidElement } from "react";
import { cx } from "../lib/cx";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface FormControlLabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "onChange"> {
  control: ReactElement;
  label: ReactNode;
  labelPlacement?: "start" | "end" | "top" | "bottom";
  /** KB's alignment helper: -12 px on the chosen sides. SJ's guidelines use only the left. */
  negativeMargins?: boolean | { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  /** Label and control at opposite ends, as in SJ's settings rows. */
  spaceBetween?: boolean;
  /** Draws the focus ring inside the row, for rows in a list or a card. */
  insetFocus?: boolean;
  /** Renders the label as given, without the body-text wrapper. */
  disableTypography?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  value?: unknown;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MUI's type
  inputRef?: Ref<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MUI types it loosely
  ref?: Ref<any>;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  /** MUI's class and slot overrides. There is no MUI underneath, so they have no effect. */
  classes?: unknown;
  componentsProps?: unknown;
  slotProps?: unknown;
  slots?: unknown;
}

const handedOn = ["checked", "name", "onChange", "value", "inputRef"] as const;

export function FormControlLabel(props: FormControlLabelProps) {
  const {
    control, label, labelPlacement = "end", negativeMargins, spaceBetween, insetFocus, disableTypography, disabled, required,
    className, style, sx, customAttribute, classes: _classes, componentsProps: _componentsProps, slotProps: _slotProps, slots: _slots,
    checked: _checked, name: _name, onChange: _onChange, value: _value, inputRef: _inputRef, ...rest
  } = props;
  const resolved = useLegacySx(sx);
  const own = control.props as Record<string, unknown>;
  const extra: Record<string, unknown> = {};
  for (const key of handedOn) if (own[key] === undefined && props[key] !== undefined) extra[key] = props[key];
  if (own.disabled === undefined && disabled !== undefined) extra.disabled = disabled;
  if (own.required === undefined && required !== undefined) extra.required = required;
  const isDisabled = disabled ?? Boolean(own.disabled);
  const neg = (side: "top" | "right" | "bottom" | "left") => negativeMargins === true || (typeof negativeMargins === "object" && !!negativeMargins[side]) || undefined;
  const text = disableTypography || isValidElement(label) ? label : <span className="sj-legacy-fcl__label">{label}</span>;
  return (
    <label
      {...rest}
      {...legacyMarker}
      {...customAttr(customAttribute)}
      className={cx("sj-legacy-fcl", resolved.className, className)}
      data-sj-focus-row=""
      style={{ ...resolved.style, ...style }}
      data-placement={labelPlacement}
      data-space-between={spaceBetween || undefined}
      data-neg-top={neg("top")}
      data-neg-right={neg("right")}
      data-neg-bottom={neg("bottom")}
      data-neg-left={neg("left")}
      data-inset-focus={insetFocus || undefined}
      data-disabled={isDisabled || undefined}
    >
      {Object.keys(extra).length ? cloneElement(control as ReactElement<Record<string, unknown>>, extra) : control}
      {required ? (
        <span>
          {text}
          <span aria-hidden="true">&thinsp;*</span>
        </span>
      ) : (
        text
      )}
    </label>
  );
}

export default FormControlLabel;
