/*
 * Legacy Switch: KB's props on the new Switch. Drop-in for `@sj-ab/component-library.ui.switch`.
 * Pair it with the legacy FormControlLabel for a visible label, as in KB.
 */
import type { ChangeEvent, CSSProperties, Ref } from "react";
import { Switch as NewSwitch } from "../components/switch/switch";
import { cx } from "../lib/cx";
import { warnUnsupported } from "../lib/warn";
import { syntheticChange } from "./events";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface SwitchProps {
  name: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  /** Adds the right margin KB uses for a switch at the end of a list row. */
  listOffset?: boolean;
  inputRef?: Ref<HTMLButtonElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Deprecated in KB too. Use aria-label. */
  inputProps?: Record<string, unknown>;
  component?: unknown;
}

export function Switch(props: SwitchProps) {
  const { name, checked, defaultChecked, onChange, disabled, required, value, id, className, style, sx, customAttribute, listOffset, inputRef, inputProps, component: _c, ...aria } = props;
  warnUnsupported("Switch", props as unknown as Record<string, unknown>, ["component"]);
  const resolved = useLegacySx(sx);
  const ariaFromInputProps = (inputProps?.["aria-label"] as string | undefined) ?? undefined;
  return (
    <NewSwitch
      {...legacyMarker}
      {...customAttr(customAttribute)}
      {...aria}
      aria-label={aria["aria-label"] ?? ariaFromInputProps}
      ref={inputRef}
      id={id}
      name={name}
      value={value}
      required={required}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={(next, details) => onChange?.(syntheticChange({ checked: next, name, value }, details.event as Event | undefined), next)}
      className={cx(resolved.className, className)}
      data-list-offset={listOffset || undefined}
      style={{ ...resolved.style, ...style }}
    />
  );
}

export default Switch;
