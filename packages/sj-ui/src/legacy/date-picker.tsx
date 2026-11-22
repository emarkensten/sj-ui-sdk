/*
 * Legacy DatePicker: KB's props (ISO strings, onAccept, onChange with an event) on the new DatePicker.
 * Drop-in for `@sj-ab/component-library.ui.date-picker`. No LocalizationProvider or date-fns needed.
 */
import type { ChangeEvent, CSSProperties, Ref } from "react";
import { forwardRef, useState } from "react";
import { DatePicker as NewDatePicker } from "../components/date-picker/date-picker";
import { isoToday } from "../lib/format";
import { resolveLang } from "../lib/i18n";
import { cx } from "../lib/cx";
import { warnUnsupported } from "../lib/warn";
import { syntheticChange } from "./events";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface DatePickerProps {
  id: string;
  label: string;
  lang: "sv" | "en";
  /** ISO date, "yyyy-MM-dd". Empty string for none. */
  value: string;
  onAccept?: (date: string) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onError?: (reason: "minDateError" | "invalidDateError" | "maxDateError", value?: string) => void;
  minDate?: string;
  maxDate?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  timeZone?: string;
  helperText?: string;
  errorHelperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  hasExternalLabel?: boolean;
  isLoading?: boolean;
  name?: string;
  className?: string;
  style?: CSSProperties;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  /** Accepted, no effect: the new picker has no portal or z-index to manage. */
  disablePortal?: boolean;
  zIndexCalendar?: number;
  journeyDirection?: "outward" | "return";
  density?: string;
  placeholder?: string;
  /** Required by KB's typings. The new input always turns browser autofill off. */
  autoComplete?: string;
  /** Not supported in the pilot (phase 2). */
  displayFormat?: string;
  hasWeekNumbers?: boolean;
  hasActionButtons?: boolean;
  secondaryView?: "month" | "year";
  customTranslation?: unknown;
}

export const DatePicker = forwardRef(function DatePicker(props: DatePickerProps, _ref: Ref<HTMLDivElement | null>) {
  const {
    id,
    label,
    lang,
    value,
    onAccept,
    onChange,
    onError,
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    timeZone = "Europe/Stockholm",
    helperText,
    errorHelperText,
    required,
    disabled,
    fullWidth,
    hasExternalLabel,
    isLoading,
    name,
    className,
    style,
    sx,
    customAttribute,
  } = props;
  warnUnsupported("DatePicker", props as unknown as Record<string, unknown>, ["displayFormat", "hasWeekNumbers", "hasActionButtons", "secondaryView", "customTranslation"]);
  const resolved = useLegacySx(sx);
  const [invalid, setInvalid] = useState(false);

  const today = isoToday(timeZone);
  const min = [minDate || undefined, disablePast ? today : undefined].filter(Boolean).sort().pop();
  const max = [maxDate || undefined, disableFuture ? today : undefined].filter(Boolean).sort()[0];

  if (isLoading) {
    return <span className="sj-legacy-skeleton" data-full-width={fullWidth || undefined} style={{ borderRadius: "var(--sjse-border-radius-lg)", width: fullWidth ? undefined : "18rem" }} aria-hidden="true" {...customAttr(customAttribute, "Skeleton")} />;
  }

  return (
    <div {...legacyMarker} {...customAttr(customAttribute)} id={`${id}-root`} className={cx(resolved.className, className)} style={{ ...resolved.style, ...style }}>
      <NewDatePicker
        label={label}
        externalLabel={hasExternalLabel}
        value={value || null}
        onValueChange={(next) => {
          const v = next ?? "";
          if (min && v && v < min) {
            setInvalid(true);
            onError?.("minDateError", v);
          } else if (max && v && v > max) {
            setInvalid(true);
            onError?.("maxDateError", v);
          } else {
            setInvalid(false);
          }
          onChange?.(syntheticChange({ value: v, name: name ?? id }));
          if (v) onAccept?.(v);
        }}
        min={min}
        max={max}
        lang={resolveLang(lang)}
        timeZone={timeZone}
        helperText={helperText}
        error={invalid}
        errorText={invalid ? errorHelperText : undefined}
        required={required}
        disabled={disabled}
        name={name ?? id}
        fullWidth={fullWidth}
      />
    </div>
  );
});

export default DatePicker;
