/*
 * Legacy DatePicker: KB's DatePicker (MUI TextField + MUI X DateCalendar) on ui-sdk's Calendar
 * and Popover. Drop-in for `@sj-ab/component-library.ui.date-picker`. No date-fns, no
 * LocalizationProvider needed (the legacy one renders only its children).
 *
 * As in KB:
 * - The field shows "Tisdag 24 november" (or `displayFormat`) and the ISO date while it has focus.
 *   Typing is masked as KB's DateField masks it ("20261224" becomes "2026-12-24"); onChange gets
 *   every keystroke, onAccept a finished date on Enter or when the field loses focus.
 * - The calendar opens from the button, under the field on desktop and as a bottom sheet below
 *   600 px, where the field is read-only and opens the calendar itself. A pick calls onAccept and
 *   closes; focus goes back to the button.
 * - The month or year view (`secondaryView`) picks the same day in another month and returns to
 *   the days. Week numbers, Avbryt/Klar buttons and `customTranslation` work as in KB.
 * Deliberate differences are listed in docs/avsiktliga-skillnader.md.
 */
import type { ChangeEvent, CSSProperties, FocusEvent, KeyboardEvent, ReactNode, Ref } from "react";
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { addDays, clampDate, daysInMonth, isISODate, weekday } from "@ui-sdk/core/date";
import { createCalendarController, Calendar as UiCalendar, CalendarDay, CalendarGrid, CalendarNext, CalendarPrevious, CalendarWeekday, CalendarWeekdays, CalendarWeeks } from "@ui-sdk/react/calendar";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover";
import { FieldControl } from "@ui-sdk/react/field";
import { OutlinedField } from "../components/field/field";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "../icons";
import { cx } from "../lib/cx";
import { isoToday } from "../lib/format";
import { locales, resolveLang, type Lang } from "../lib/i18n";
import { kbMobileQuery, useMedia } from "../lib/use-media";
import { FlowButton } from "./flow-button";
import { assignRef, customAttr, legacyMarker, useLegacySx, type CustomAttribute, type Density, type KbRadius, kbRadii, type LegacySx } from "./shared";

/* ---------------- KB's translations (translations.date-picker-translation) ---------------- */

const translations = {
  sv: {
    today: "Idag", tomorrow: "Imorgon", okText: "Klar", cancelText: "Avbryt", week: "Vecka", weekAbbreviation: "v",
    outward: "Utresa", return: "Återresa", calendarButtonAriaLabelPart1: "Valt datum", calendarButtonAriaLabelPart2: "Tryck för att öppna kalendern ",
    selectedDatePrefix: "Valt datum. ", changeToMonthView: "Kalendern visas, välj månad", changeToYearView: "Kalendern visas, välj år",
    changeToCalendarView: "Månadsvy visas, byt till kalendern", leftArrowButtonAriaLabel: "Föregående månad", rightArrowButtonAriaLabel: "Nästa månad",
    dateFieldLabel: "Datum", daySeparator: "", close: "Stäng",
  },
  en: {
    today: "Today", tomorrow: "Tomorrow", okText: "OK", cancelText: "Cancel", week: "Week", weekAbbreviation: "wk",
    outward: "Outward journey", return: "Return", calendarButtonAriaLabelPart1: "Selected date", calendarButtonAriaLabelPart2: "Press to open the calendar ",
    selectedDatePrefix: "Selected date. ", changeToMonthView: "Calendar is shown, select month", changeToYearView: "Calendar is shown, select year",
    changeToCalendarView: "Month view is shown, switch to calendar view", leftArrowButtonAriaLabel: "Previous month", rightArrowButtonAriaLabel: "Next month",
    dateFieldLabel: "Date", daySeparator: ",", close: "Close",
  },
};
export type DatePickerTranslation = typeof translations.sv;

/** KB's weekday headers: three letters, the full name for screen readers. */
const weekdayShort = { sv: ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] };

/* ---------------- Dates as ISO strings, computed in UTC so the browser's zone never shifts a day ---------------- */

const ymd = (iso: string) => iso.split("-").map(Number) as [number, number, number];
const utc = (iso: string) => {
  const [y, m, d] = ymd(iso);
  return new Date(Date.UTC(y, m - 1, d));
};
const pad = (n: number, len = 2) => String(n).padStart(len, "0");
/** KB's isDateValidAndExisting: "yyyy-MM-dd" and a day that exists. */
const isValidIso = (value: string | undefined): value is string => Boolean(value) && isISODate(value!);
/** An ISO date from parts the caller knows are real. */
const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
/** The first and last day of a month. */
const monthBounds = (y: number, m: number) => [isoDate(y, m, 1), isoDate(y, m, daysInMonth(y, m))] as const;

/** Month and weekday names, built once per language (formatters are slow to create). */
const names = new Map<string, string[]>();
function nameList(lang: Lang, kind: "month" | "weekday", width: "long" | "short") {
  const key = `${lang}${kind}${width}`;
  let list = names.get(key);
  if (!list) {
    const format = new Intl.DateTimeFormat(locales[lang], { [kind]: width, timeZone: "UTC" });
    // 2001-01-07 was a Sunday, so weekday i (Sunday 0) is 7 + i January.
    list = Array.from({ length: kind === "month" ? 12 : 7 }, (_, i) => format.format(kind === "month" ? Date.UTC(2000, i, 1) : Date.UTC(2001, 0, 7 + i)));
    names.set(key, list);
  }
  return list;
}
const weekdayName = (iso: string, lang: Lang, width: "long" | "short" = "long") => nameList(lang, "weekday", width)[weekday(iso)];
const monthName = (month: number, lang: Lang, width: "long" | "short" = "long") => nameList(lang, "month", width)[month - 1];

/** date-fns' getWeek with the Swedish locale, which KB uses for both languages: the ISO week. */
function isoWeek(iso: string) {
  const thursday = utc(iso);
  thursday.setUTCDate(thursday.getUTCDate() - ((thursday.getUTCDay() + 6) % 7) + 3);
  return Math.ceil(((thursday.getTime() - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
}

/** "tisdag 24 november 2026", date-fns' "EEEE d MMMM yyyy". */
const longDate = (iso: string, lang: Lang) => {
  const [y, m, d] = ymd(iso);
  return `${weekdayName(iso, lang)} ${d} ${monthName(m, lang)} ${y}`;
};

/** KB's createCustomDatePickerFormat: "Idag 22 november", "Tisdag 24 november", "Friday, 1 January 2027". */
function friendlyDate(iso: string, lang: Lang, copy: DatePickerTranslation, today: string) {
  const [y, m, d] = ymd(iso);
  const tomorrow = addDays(today, 1);
  const prefix = iso === today ? `${copy.today}${copy.daySeparator} ` : iso === tomorrow ? `${copy.tomorrow}${copy.daySeparator} ` : `${weekdayName(iso, lang)}${lang === "en" ? ", " : " "}`;
  const year = y !== ymd(today)[0] ? ` ${y}` : "";
  return `${prefix}${d} ${monthName(m, lang)}${year}`.replace(/^\w|^[åäö]/, (c) => c.toUpperCase());
}

/** The date-fns tokens `displayFormat` takes in practice: y, M/L, d, E/c, and 'quoted text'. */
function formatPattern(iso: string, pattern: string, lang: Lang) {
  const [y, m, d] = ymd(iso);
  return pattern.replace(/'([^']*)'|y+|M+|L+|d+|E+|c+|i+/g, (token, quoted: string | undefined) => {
    if (quoted !== undefined) return quoted || "'";
    const n = token.length;
    switch (token[0]) {
      case "y": return n === 2 ? pad(y % 100) : pad(y, n);
      case "M": case "L": return n === 1 ? String(m) : n === 2 ? pad(m) : n === 3 ? monthName(m, lang, "short") : monthName(m, lang);
      case "d": return n === 1 ? String(d) : pad(d);
      default: return weekdayName(iso, lang, n >= 4 ? "long" : "short");
    }
  });
}

/** KB's DateField mask: digits only, hyphens put in as you type. */
function maskedValue(input: string) {
  const match = input.replace(/-/g, "").match(/^(\d{4})(\d{0,2})(\d{0,2})$/);
  if (!match) return input.replace(/[^\d-]/g, "");
  const [, year, month = "", day = ""] = match;
  let out = year;
  if (year.length < input.length) out += "-";
  if (month) {
    out += month;
    if (year.length + month.length + 1 < input.length) out += "-";
  }
  return out + day;
}

/** "2026-12-5" becomes "2026-12-05", as KB's addZeroToDay. */
const withDayZero = (text: string) => (text.length === 9 ? `${text.slice(0, 8)}0${text.slice(8)}` : text);

/* ---------------- Props ---------------- */

/**
 * TextField and DateField props that KB's types inherit and KB's DatePicker never reads (it
 * destructures a fixed list). Accepted with no effect, so KB code compiles unchanged.
 */
type KbIgnoredProp =
  | "autoComplete" | "autoFocus" | "calendarButtonAriaLabel" | "children" | "color" | "defaultValue" | "endIcon" | "error"
  | "FormHelperTextProps" | "InputLabelProps" | "InputProps" | "inputProps" | "inputRef" | "isCalendarOpen" | "isSearchField"
  | "margin" | "maxRows" | "minRows" | "multiline" | "name" | "numeric" | "onBlur" | "onClick" | "onError" | "onFocus"
  | "onKeyDown" | "onKeyUp" | "onMouseLeave" | "onMouseOver" | "onToggleCalendar" | "rounded" | "rows" | "select"
  | "SelectProps" | "showCalendarButton" | "skeletonSx" | "SlotProps" | "startIcon" | "type" | "valid" | "variant";

export interface DatePickerProps extends Partial<Record<KbIgnoredProp, unknown>> {
  id: string;
  label?: string;
  lang?: Lang;
  /** ISO date, "yyyy-MM-dd". While someone types it holds what they typed. */
  value: string;
  /** A finished date: picked, or typed and confirmed with Enter or by leaving the field. */
  onAccept?: (date: string) => void;
  /** Every keystroke, as MUI's change event. */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  minDate?: string;
  maxDate?: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  timeZone?: string;
  helperText?: string;
  /** Shows the field as invalid with this text. */
  errorHelperText?: string;
  /** Sets aria-required. Default true, as in KB. */
  required?: boolean;
  /**
   * As in KB: only the calendar's days are disabled. KB never passes it to the field, so the field
   * stays editable and the button still opens the calendar (see docs/avsiktliga-skillnader.md).
   */
  disabled?: boolean;
  fullWidth?: boolean;
  hasExternalLabel?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  density?: Density;
  borderRadiusOverride?: KbRadius;
  journeyDirection?: "outward" | "return";
  /** date-fns tokens, like "yyyy-MM-dd" or "dd/MM/yyyy", for the date shown in the field. */
  displayFormat?: string;
  hasWeekNumbers?: boolean;
  hasActionButtons?: boolean;
  secondaryView?: "month" | "year";
  customTranslation?: Partial<Record<Lang, Partial<DatePickerTranslation>>>;
  customAttribute?: CustomAttribute;
  customCalendarButtonRef?: Ref<HTMLButtonElement>;
  sx?: LegacySx;
  className?: string;
  style?: CSSProperties;
  /** Accepted, no effect: the calendar renders in the top layer, above everything. */
  disablePortal?: boolean;
  zIndexCalendar?: number;
}

/* ---------------- Component ---------------- */

export const DatePicker = forwardRef(function DatePicker(props: DatePickerProps, ref: Ref<HTMLDivElement>) {
  const {
    id, label, lang: langProp = "sv", value: valueProp, onAccept, onChange, minDate, maxDate, disablePast, disableFuture,
    timeZone = "Europe/Stockholm", helperText, errorHelperText, required = true, disabled, fullWidth, hasExternalLabel = false,
    isLoading, placeholder, density = "comfortable", borderRadiusOverride, journeyDirection, displayFormat, hasWeekNumbers,
    hasActionButtons, secondaryView = "month", customTranslation, customAttribute, customCalendarButtonRef, sx, className, style,
  } = props;
  const lang = resolveLang(langProp);
  const copy: DatePickerTranslation = { ...translations[lang], ...customTranslation?.[lang] };
  const value = valueProp ?? "";
  const resolved = useLegacySx(sx);
  const mobile = useMedia(kbMobileQuery);

  const [open, setOpen] = useState(false);
  const [masked, setMasked] = useState(false);
  const [view, setView] = useState<"day" | "month" | "year">("day");
  const [pending, setPending] = useState<string | null>(null);
  const today = isoToday(timeZone);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // MUI's defaults are 1900-01-01 and 2099-12-31.
  const min = [minDate || "1900-01-01", disablePast ? today : ""].sort().pop()!;
  const max = [maxDate || "2099-12-31", disableFuture ? today : "9999"].sort()[0];
  const selected = isValidIso(value) ? value : null;
  const shown = pending ?? selected;

  // KB moves focus to the calendar button whenever the calendar closes, also after a pick.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const setButtonRef = (el: HTMLButtonElement | null) => {
    buttonRef.current = el;
    assignRef(customCalendarButtonRef, el);
  };

  const openChange = (next: boolean) => {
    if (next) {
      setMonth(clampDate(selected ?? today, min, max).slice(0, 7));
      setView("day");
    }
    setPending(null);
    setOpen(next);
  };

  const accept = (date: string) => onAccept?.(date);
  /** A date picked in the calendar. With action buttons it waits for Klar. */
  const pick = (date: string) => (hasActionButtons ? setPending(date) : accept(date));
  /** A day closes the calendar, unless Klar does. */
  const pickDay = (date: string) => {
    pick(date);
    if (!hasActionButtons) openChange(false);
  };

  if (isLoading) {
    return (
      <span {...legacyMarker} className="sj-legacy-select-skeleton" data-external-label={hasExternalLabel || undefined} data-full-width={fullWidth || mobile || undefined}>
        {hasExternalLabel && <span className="sj-legacy-select-skeleton__label" />}
        <span className="sj-legacy-select-skeleton__box" data-legacy-date-skeleton="" data-density={density} data-radius={borderRadiusOverride && kbRadii[borderRadiusOverride]}>
          <span className="sj-legacy-select-skeleton__bar" />
        </span>
      </span>
    );
  }

  /* The field */
  const display = (() => {
    if (!masked && selected) return (displayFormat && formatPattern(selected, displayFormat, lang)) || friendlyDate(selected, lang, copy, today);
    if (masked && value.length < 10) return maskedValue(value);
    return value;
  })();

  const confirmTyped = (text: string) => {
    const date = withDayZero(text);
    if (isValidIso(date)) accept(date);
  };

  const fieldEvents = mobile
    ? {
        render: (p: object) => <textarea {...p} rows={1} />,
        readOnly: true,
        onFocus: () => setMasked(false),
        onClick: () => openChange(true),
      }
    : {
        maxLength: masked ? 10 : undefined,
        onFocus: () => setMasked(true),
        onBlur: (event: FocusEvent<HTMLInputElement>) => {
          setMasked(false);
          confirmTyped(event.target.value);
        },
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") confirmTyped(event.currentTarget.value);
        },
        // Always a handler, so React doesn't call the field read-only when the team passes none.
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange?.(event),
      };

  const buttonLabel = selected
    ? `${journeyDirection ? `${copy[journeyDirection]}, ` : ""}${copy.calendarButtonAriaLabelPart1} ${longDate(selected, lang)}, ${copy.calendarButtonAriaLabelPart2}`
    : copy.calendarButtonAriaLabelPart2;
  const labelText = label || copy.dateFieldLabel;
  const presentation = mobile ? "sheet" : "popover";

  return (
    <div
      {...legacyMarker}
      className={cx("sj-legacy-date", resolved.className, className)}
      data-full-width={fullWidth || mobile || undefined}
      style={{ ...resolved.style, ...style }}
    >
      <Popover open={open} onOpenChange={openChange} presentation={presentation} modal={mobile}>
        <OutlinedField
          label={labelText}
          externalLabel={hasExternalLabel}
          filled={display !== ""}
          helperText={errorHelperText || helperText}
          error={Boolean(errorHelperText)}
          fullWidth={fullWidth || mobile}
          labelId={`${id}-label`}
          rootProps={{
            "data-legacy-date": "",
            "data-density": density,
            "data-mobile": mobile ? "" : undefined,
            "data-radius": borderRadiusOverride && kbRadii[borderRadiusOverride],
            ...customAttr(customAttribute),
          }}
          end={
            <PopoverTrigger
              ref={setButtonRef}
              className="sj-legacy-date__button"
              data-focus-ring=""
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={buttonLabel}
              data-density={density}
              {...customAttr(customAttribute, "CalendarButton")}
            >
              <CalendarIcon />
            </PopoverTrigger>
          }
        >
          <span className="sj-legacy-date__anchor" ref={setAnchor} aria-hidden="true" />
          <FieldControl
            id={id}
            className="sj-legacy-date__input"
            value={display}
            placeholder={placeholder}
            autoComplete="off"
            aria-required={required}
            {...customAttr(customAttribute, "Input")}
            {...fieldEvents}
          />
        </OutlinedField>
        <PopoverContent
          className="sj-legacy-cal-popup"
          data-weeks={hasWeekNumbers || undefined}
          data-presentation={presentation}
          aria-label={mobile ? copy.dateFieldLabel : undefined}
          anchor={anchor ?? undefined}
          side="bottom"
          align="center"
          sideOffset={0}
          collisionPadding={0}
          // Desktop: the selected day (or today), as MUI's autoFocus. KB's sheet focuses itself.
          initialFocus={mobile ? "content" : TAB_STOP_DAY}
          finalFocus="none"
          style={props.zIndexCalendar ? { zIndex: props.zIndexCalendar } : undefined}
          {...customAttr(customAttribute)}
        >
          {mobile && <PopoverClose className="sj-visually-hidden">{copy.close}</PopoverClose>}
          <LegacyCalendar
            ref={ref}
            lang={lang}
            copy={copy}
            value={shown}
            month={month}
            onMonthChange={setMonth}
            view={view}
            onViewChange={setView}
            secondaryView={secondaryView}
            min={min}
            max={max}
            today={today}
            timeZone={timeZone}
            disabled={disabled}
            hasWeekNumbers={hasWeekNumbers}
            onPick={pick}
            onPickDay={pickDay}
          />
          {hasActionButtons && (
            <div className="sj-legacy-cal__actions">
              <FlowButton color="green" colorVariant="secondary" onClick={() => openChange(false)}>
                {copy.cancelText}
              </FlowButton>
              <FlowButton
                color="green"
                onClick={() => {
                  if (pending) accept(pending);
                  openChange(false);
                }}
              >
                {copy.okText}
              </FlowButton>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
});

/* ---------------- The calendar: KB's DateCalendar with PickersDay ---------------- */

interface LegacyCalendarProps {
  lang: Lang;
  copy: DatePickerTranslation;
  value: string | null;
  month: string;
  onMonthChange: (month: string) => void;
  view: "day" | "month" | "year";
  onViewChange: (view: "day" | "month" | "year") => void;
  secondaryView: "month" | "year";
  min: string;
  max: string;
  today: string;
  timeZone: string;
  disabled?: boolean;
  hasWeekNumbers?: boolean;
  /** A month or year: the same day there, then the days again. */
  onPick: (date: string) => void;
  onPickDay: (date: string) => void;
}

/** The day that has the calendar's tab stop: the selected day, or today. */
const TAB_STOP_DAY = "td[tabindex='0']";

const LegacyCalendar = forwardRef(function LegacyCalendar(p: LegacyCalendarProps, ref: Ref<HTMLDivElement>) {
  const { lang, copy, value, month, view, secondaryView, min, max, today } = p;
  const [y, m] = month.split("-").map(Number);
  const heading = `${monthName(m, lang)} ${y}`;

  /** MUI's month and year pick: the same day there, moved inside min and max. */
  const moveTo = (year: number, mon: number) => {
    const [first, last] = monthBounds(year, mon);
    const date = isoDate(year, mon, Math.min(ymd(value ?? today)[2], daysInMonth(year, mon)));
    return clampDate(date, first > min ? first : min, last < max ? last : max);
  };
  const pickIn = (year: number, mon: number) => {
    p.onPick(moveTo(year, mon));
    p.onMonthChange(isoDate(year, mon, 1).slice(0, 7));
    p.onViewChange("day");
  };

  // Back in the day view after a month or year pick, MUI focuses the day, as when the calendar opens.
  const [controller] = useState(createCalendarController);
  const lastView = useRef(view);
  useEffect(() => {
    const back = view === "day" && lastView.current !== "day";
    lastView.current = view;
    if (back) controller.focus(value ?? today);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps -- only when the view changes

  const dayLabel = (iso: string) => {
    let text = "";
    if (weekday(iso) === 1) text += `${copy.week} ${isoWeek(iso)}, `;
    if (iso === value) text += copy.selectedDatePrefix;
    if (iso === today) text += `${copy.today}, `;
    return text + longDate(iso, lang);
  };

  return (
    <UiCalendar
      ref={ref}
      controller={controller}
      className="sj-legacy-cal"
      data-view={view}
      data-weeks={p.hasWeekNumbers || undefined}
      value={value}
      onValueChange={(next) => typeof next === "string" && p.onPickDay(next)}
      month={month}
      onMonthChange={p.onMonthChange}
      min={min}
      max={max}
      today={today}
      timeZone={p.timeZone}
      locale={locales[lang]}
      weekStartsOn={1}
      showOutsideDays={false}
      disabled={p.disabled}
    >
      <div className="sj-legacy-cal__header">
        <div className="sj-legacy-cal__label-wrap">
          <span className="sj-legacy-cal__label" aria-live="polite">
            {heading}
          </span>
          <button
            type="button"
            className="sj-legacy-cal__switch"
            aria-label={view === "day" ? (secondaryView === "month" ? copy.changeToMonthView : copy.changeToYearView) : copy.changeToCalendarView}
            onClick={() => p.onViewChange(view === "day" ? secondaryView : "day")}
          >
            <ChevronDown />
          </button>
        </div>
        {view === "day" && (
          <div className="sj-legacy-cal__arrows">
            <CalendarPrevious className="sj-legacy-cal__arrow" aria-label={copy.leftArrowButtonAriaLabel}>
              <ChevronLeft />
            </CalendarPrevious>
            <CalendarNext className="sj-legacy-cal__arrow" aria-label={copy.rightArrowButtonAriaLabel}>
              <ChevronRight />
            </CalendarNext>
          </div>
        )}
      </div>
      <div className="sj-legacy-cal__view">
        {view === "day" ? (
          <CalendarGrid className="sj-legacy-cal__grid">
            <CalendarWeekdays className="sj-legacy-cal__weekdays">
              {(index) => (
                <>
                  {p.hasWeekNumbers && index === 0 && <th className="sj-legacy-cal__week" aria-hidden="true" />}
                  <CalendarWeekday index={index} className="sj-legacy-cal__weekday">
                    {weekdayShort[lang][index]}
                  </CalendarWeekday>
                </>
              )}
            </CalendarWeekdays>
            <CalendarWeeks className="sj-legacy-cal__weeks">
              {(cell) => {
                const day = <CalendarDay value={cell.date} className="sj-legacy-cal__day" aria-label={dayLabel(cell.date)} />;
                // MUI renders hidden days too, so the first week has its number even when it starts
                // on a Sunday. Here the week's first shown day carries it; CSS moves it first in the row.
                if (!p.hasWeekNumbers || (weekday(cell.date) !== 1 && !cell.date.endsWith("-01"))) return day;
                return (
                  <>
                    <th className="sj-legacy-cal__week" scope="row" aria-hidden="true">
                      {copy.weekAbbreviation}
                      {isoWeek(cell.date)}
                    </th>
                    {day}
                  </>
                );
              }}
            </CalendarWeeks>
          </CalendarGrid>
        ) : (
          <PickGrid
            items={
              view === "month"
                ? Array.from({ length: 12 }, (_, i) => {
                    const [first, last] = monthBounds(y, i + 1);
                    return {
                      key: i + 1,
                      text: monthName(i + 1, lang, "short").replace(".", ""),
                      label: monthName(i + 1, lang),
                      selected: value?.slice(0, 7) === first.slice(0, 7),
                      disabled: last < min || first > max,
                      onPick: () => pickIn(y, i + 1),
                    };
                  })
                : Array.from({ length: Number(max.slice(0, 4)) - Number(min.slice(0, 4)) + 1 }, (_, i) => {
                    const year = Number(min.slice(0, 4)) + i;
                    return { key: year, text: String(year), selected: value ? ymd(value)[0] === year : year === y, onPick: () => pickIn(year, m) };
                  })
            }
            kind={view}
          />
        )}
      </div>
    </UiCalendar>
  );
});

/** MUI's MonthCalendar and YearCalendar: a radio group of buttons, four a row, arrow keys between them. */
function PickGrid({ items, kind }: { items: { key: number; text: ReactNode; label?: string; selected: boolean; disabled?: boolean; onPick: () => void }[]; kind: "month" | "year" }) {
  const listRef = useRef<HTMLDivElement>(null);
  const start = Math.max(0, items.findIndex((i) => i.selected));
  const [active, setActive] = useState(start);

  // MUI focuses the selected month or year, and scrolls the year to the middle.
  useLayoutEffect(() => {
    const scroller = listRef.current;
    const el = scroller?.children[active] as HTMLElement | undefined;
    if (!scroller || !el) return;
    el.focus({ preventScroll: true });
    if (kind !== "year") return;
    const bottom = el.offsetTop + el.offsetHeight;
    if (bottom < scroller.clientHeight || el.offsetTop < scroller.scrollTop) return;
    scroller.scrollTop = bottom - scroller.clientHeight / 2 - el.offsetHeight / 2;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, when the view opens

  const move = (to: number) => {
    const next = Math.max(0, Math.min(items.length - 1, to));
    setActive(next);
    (listRef.current?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="radiogroup"
      className="sj-legacy-cal__picks"
      data-kind={kind}
      onKeyDown={(event) => {
        const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        move(active + step);
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.key}
          type="button"
          role="radio"
          aria-checked={item.selected}
          aria-label={item.label}
          tabIndex={index === active ? 0 : -1}
          disabled={item.disabled}
          data-selected={item.selected || undefined}
          className="sj-legacy-cal__pick"
          onClick={item.onPick}
        >
          {item.text}
        </button>
      ))}
    </div>
  );
}

export default DatePicker;
