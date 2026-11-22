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
  /** KB's alignment helper: -12 px on the chosen sides. SJ's guidelines use only the left. */
  negativeMargins?: boolean | { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  /** Label and control at opposite ends, as in SJ's settings rows. */
  spaceBetween?: boolean;
  /** Draws the focus ring inside the row, for rows in a list or a card. */
  insetFocus?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  id?: string;
}

export function FormControlLabel({ control, label, labelPlacement = "end", negativeMargins, spaceBetween, insetFocus, disabled, className, style, sx, customAttribute, id }: FormControlLabelProps) {
  const resolved = useLegacySx(sx);
  const neg = (side: "top" | "right" | "bottom" | "left") => negativeMargins === true || (typeof negativeMargins === "object" && !!negativeMargins[side]) || undefined;
  return (
    <label
      {...legacyMarker}
      {...customAttr(customAttribute)}
      id={id}
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
      data-disabled={disabled || undefined}
    >
      {disabled && (control.props as { disabled?: boolean }).disabled === undefined ? cloneElement(control as ReactElement<{ disabled?: boolean }>, { disabled: true }) : control}
      <span className="sj-legacy-fcl__label">{label}</span>
    </label>
  );
}

export default FormControlLabel;
