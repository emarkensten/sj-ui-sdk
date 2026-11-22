import type { ReactNode } from "react";
import { useState } from "react";
import {
  DatePicker as UiDatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/date-picker";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "../../icons";
import { OutlinedField } from "../field/field";
import { formatLongDate } from "../../lib/format";
import { locales, resolveLang, t, type Lang } from "../../lib/i18n";

/** Dates that can't be picked, as ui-sdk takes them: ISO dates, `{ from, to }`, `{ before }`, `{ after }`, `{ weekday: [0, 6] }` or a function. */
export type DateMatchers = Parameters<typeof UiDatePicker>[0]["unavailable"];

export interface DatePickerProps {
  label?: ReactNode;
  externalLabel?: boolean;
  /** ISO date, like `"2026-11-24"`. No date library needed. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  unavailable?: DateMatchers;
  lang?: Lang;
  /** Decides what "today" is. SJ's default is Europe/Stockholm. */
  timeZone?: string;
  helperText?: ReactNode;
  error?: boolean;
  errorText?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  fullWidth?: boolean;
  /** `"auto"` (default) is a bottom sheet on small touch screens and a popover elsewhere. */
  presentation?: "popover" | "sheet" | "auto";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Pick one date. Shows the chosen date the SJ way ("Tisdag 24 november") and lets people type
 * it (ISO in Swedish) or pick it in a calendar.
 */
export function DatePicker({
  label,
  externalLabel,
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  unavailable,
  lang: langProp,
  timeZone = "Europe/Stockholm",
  helperText,
  error,
  errorText,
  required,
  disabled,
  name,
  fullWidth,
  presentation = "auto",
  open,
  onOpenChange,
  className,
}: DatePickerProps) {
  const lang = resolveLang(langProp);
  const text = t(lang);
  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;

  return (
    <OutlinedField
      className={className}
      label={label}
      externalLabel={externalLabel}
      filled={current != null}
      helperText={helperText}
      error={error}
      errorText={errorText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
    >
      <UiDatePicker
        className="sj-date-picker"
        value={current}
        onValueChange={(next) => {
          const v = typeof next === "string" ? next : null;
          if (value === undefined) setInner(v);
          onValueChange?.(v);
        }}
        min={min}
        max={max}
        unavailable={unavailable}
        locale={locales[lang]}
        timeZone={timeZone}
        weekdayFormat="short"
        required={required}
        disabled={disabled}
        name={name}
        presentation={presentation}
        closeOnSelect
        open={open}
        onOpenChange={onOpenChange ? (o) => onOpenChange(o) : undefined}
      >
        <span className="sj-date-picker__control">
          <DatePickerInput className="sj-date-picker__input" />
          {current && (
            <span className="sj-date-picker__display" aria-hidden="true">
              {formatLongDate(current, lang)}
            </span>
          )}
        </span>
        <DatePickerTrigger className="sj-date-picker__trigger" aria-label={text.chooseDate}>
          <CalendarIcon />
        </DatePickerTrigger>
        <DatePickerContent className="sj-date-picker__content">
          <div className="sj-calendar__header">
            <CalendarHeading className="sj-calendar__heading" />
            <CalendarPrevious className="sj-calendar__nav" aria-label={text.previousMonth}>
              <ChevronLeft />
            </CalendarPrevious>
            <CalendarNext className="sj-calendar__nav" aria-label={text.nextMonth}>
              <ChevronRight />
            </CalendarNext>
          </div>
          <CalendarGrid className="sj-calendar__grid">
            <CalendarWeekdays>{(index) => <CalendarWeekday index={index} className="sj-calendar__weekday" />}</CalendarWeekdays>
            <CalendarWeeks>{(cell) => <CalendarDay value={cell.date} className="sj-calendar__day" />}</CalendarWeeks>
          </CalendarGrid>
        </DatePickerContent>
      </UiDatePicker>
    </OutlinedField>
  );
}
