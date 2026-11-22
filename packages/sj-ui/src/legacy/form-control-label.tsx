/*
 * Legacy FormControlLabel: wraps a control (Switch, Checkbox, Radio) with a clickable label.
 * Drop-in for `@sj-ab/component-library.ui.form-control-label`.
 */
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import { cx } from "../lib/cx";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface FormControlLabelProps {
  control: ReactElement;
  label: ReactNode;
  labelPlacement?: "start" | "end" | "top" | "bottom";
  /** KB's alignment helper. Only the left side is supported, which is what SJ's guidelines use. */
  negativeMargins?: boolean | { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  /** Label and control at opposite ends, as in SJ's settings rows. */
  spaceBetween?: boolean;
  /** Accepted for compatibility. The new focus ring is always drawn on the control. */
  insetFocus?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  id?: string;
}

export function FormControlLabel({ control, label, labelPlacement = "end", negativeMargins, spaceBetween, disabled, className, style, sx, customAttribute, id }: FormControlLabelProps) {
  const resolved = useLegacySx(sx);
  const left = negativeMargins === true || (typeof negativeMargins === "object" && negativeMargins.left);
  return (
    <label
      {...legacyMarker}
      {...customAttr(customAttribute)}
      id={id}
      className={cx("sj-legacy-fcl", resolved.className, className)}
      style={{ ...resolved.style, ...style }}
      data-placement={labelPlacement}
      data-space-between={spaceBetween || undefined}
      data-negative-left={left || undefined}
      data-disabled={disabled || undefined}
    >
      {disabled && (control.props as { disabled?: boolean }).disabled === undefined ? cloneElement(control as ReactElement<{ disabled?: boolean }>, { disabled: true }) : control}
      <span className="sj-legacy-fcl__label">{label}</span>
    </label>
  );
}

export default FormControlLabel;
