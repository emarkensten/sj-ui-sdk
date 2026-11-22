/*
 * Legacy Switch: a native `<input type="checkbox" role="switch">`, like KB's.
 * Drop-in for `@sj-ab/component-library.ui.switch`. Every input attribute, ref and event is the
 * browser's own, so `event.target`, `inputRef` and forms behave exactly as in KB.
 * Pair it with the legacy FormControlLabel for a visible label, as in KB.
 */
import type { ChangeEvent, ElementType, InputHTMLAttributes, Ref } from "react";
import { cx } from "../lib/cx";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  name: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  /** Pulls the switch 12 px to the right, for a switch at the end of a list row. */
  listOffset?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- KB's type
  inputRef?: Ref<any>;
  /** Deprecated in KB too. Spread onto the input; use aria-label instead. */
  inputProps?: object | ((ownerState: never) => object);
  /** Swaps the root element in KB, which breaks the switch there. Ignored. */
  component?: ElementType;
}

export function Switch(props: SwitchProps) {
  const { checked, className, customAttribute, disabled = false, inputProps, inputRef, listOffset, name, onChange, sx, style, component: _component, ...other } = props;
  const resolved = useLegacySx(sx);
  return (
    <input
      {...legacyMarker}
      type="checkbox"
      role="switch"
      className={cx("sj-switch", resolved.className, className)}
      style={{ ...resolved.style, ...style }}
      checked={checked}
      disabled={disabled}
      name={name}
      data-list-offset={listOffset || undefined}
      onChange={(event) => onChange?.(event, event.currentTarget.checked)}
      {...customAttr(customAttribute)}
      ref={inputRef}
      {...(typeof inputProps === "object" ? inputProps : null)}
      {...other}
    />
  );
}

export default Switch;
