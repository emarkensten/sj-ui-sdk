import type { ReactNode } from "react";
import { useState } from "react";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { ChevronDown, Done } from "../../icons";
import { OutlinedField } from "../field/field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: ReactNode;
  /** Put the label above the box (SJ's `hasExternalLabel`). */
  externalLabel?: boolean;
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  helperText?: ReactNode;
  error?: boolean;
  errorText?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  fullWidth?: boolean;
  /** An icon element shown before the value. */
  startIcon?: ReactNode;
  /** `"auto"` (default) is a bottom sheet on small touch screens and a popover elsewhere. */
  presentation?: "popover" | "sheet" | "auto";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  "aria-label"?: string;
}

/**
 * Pick one option from a list. Batteries included: pass `options`.
 * For custom item content, compose ui-sdk's Select parts directly with the `sj-select__*` classes.
 */
export function Select({
  label,
  externalLabel,
  options,
  value,
  defaultValue = null,
  onValueChange,
  placeholder,
  helperText,
  error,
  errorText,
  required,
  disabled,
  name,
  fullWidth,
  startIcon,
  presentation = "auto",
  open,
  onOpenChange,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;

  return (
    <OutlinedField
      className={className}
      label={label}
      externalLabel={externalLabel}
      filled={current != null || Boolean(placeholder)}
      helperText={helperText}
      error={error}
      errorText={errorText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      start={startIcon}
    >
      <UiSelect
        items={options}
        value={current}
        onValueChange={(next) => {
          const v = (next as string | null) ?? null;
          if (value === undefined) setInner(v);
          onValueChange?.(v);
        }}
        placeholder={placeholder ?? ""}
        presentation={presentation}
        required={required}
        disabled={disabled}
        name={name}
        open={open}
        onOpenChange={onOpenChange ? (o) => onOpenChange(o) : undefined}
        virtualFocus
      >
        <SelectTrigger className="sj-select__trigger" aria-label={ariaLabel}>
          <SelectValue className="sj-select__value" />
          <ChevronDown className="sj-select__chevron" />
        </SelectTrigger>
        <SelectContent className="sj-select__content">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} disabled={o.disabled} className="sj-select__item">
              <span className="sj-select__item-text">{o.label}</span>
              <SelectItemIndicator className="sj-select__indicator">
                <Done />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </OutlinedField>
  );
}
