import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { cx } from "../../lib/cx";

export interface OutlinedFieldProps {
  label?: ReactNode;
  /** Put the label above the box instead of in its border (SJ's `hasExternalLabel`). */
  externalLabel?: boolean;
  /** The control has a value, so the label floats up into the border. */
  filled?: boolean;
  helperText?: ReactNode;
  /** Shows the field as invalid. With `helperText`, that text becomes the error. */
  error?: boolean;
  errorText?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
  name?: string;
  /** The control: a SelectTrigger, an Input, a DatePickerInput. */
  children: ReactNode;
}

/**
 * SJ's outlined text field shell: a 56px box with the label notched into the border,
 * helper or error text under it. Shared by Select and DatePicker, so they line up.
 * Built on ui-sdk's Field, which wires the label and descriptions to the control.
 */
export function OutlinedField({
  label,
  externalLabel = false,
  filled = false,
  helperText,
  error = false,
  errorText,
  required,
  disabled,
  fullWidth = true,
  start,
  end,
  className,
  name,
  children,
}: OutlinedFieldProps) {
  const message = error ? (errorText ?? helperText) : helperText;
  return (
    <Field
      className={cx("sj-field", className)}
      invalid={error || undefined}
      disabled={disabled}
      name={name}
      data-filled={filled || undefined}
      data-external-label={externalLabel || undefined}
      data-full-width={fullWidth || undefined}
      data-has-start={start ? "" : undefined}
    >
      {label && (
        <FieldLabel className="sj-field__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </FieldLabel>
      )}
      <div className="sj-field__box">
        {start && <span className="sj-field__start">{start}</span>}
        {children}
        {end && <span className="sj-field__end">{end}</span>}
        <fieldset className="sj-field__outline" aria-hidden="true">
          {label && !externalLabel ? (
            <legend>
              <span>
                {label}
                {required && " *"}
              </span>
            </legend>
          ) : (
            <legend className="sj-field__legend-empty" />
          )}
        </fieldset>
      </div>
      {message &&
        (error ? (
          <FieldError match={true} className="sj-field__helper">
            {message}
          </FieldError>
        ) : (
          <FieldDescription className="sj-field__helper">{message}</FieldDescription>
        ))}
    </Field>
  );
}
