import { locales, resolveLang, t } from "./i18n";

const STOCKHOLM = "Europe/Stockholm";

export function formatTime(date: Date, timeZone = STOCKHOLM) {
  // Intl throws a RangeError on an invalid date, which would take the whole page down.
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit", timeZone }).format(date);
}

/**
 * The text SJ's DatePicker shows: "Tisdag 24 november", "Idag 22 november", "Tomorrow, 23 November",
 * with the year only when it isn't this year. Same rules as KB's createCustomDatePickerFormat.
 */
export function formatLongDate(iso: string, lang?: string, timeZone = STOCKHOLM) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const l = resolveLang(lang);
  const copy = t(l);
  const date = new Date(Date.UTC(y, m - 1, d));
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locales[l], { ...o, timeZone: "UTC" }).format(date);
  const todayIso = new Intl.DateTimeFormat("sv-SE", { timeZone }).format(new Date());
  const [ty, tm, td] = todayIso.split("-").map(Number);
  const dayDiff = Math.round((date.getTime() - Date.UTC(ty, tm - 1, td)) / 86400000);
  const day = dayDiff === 0 ? copy.today : dayDiff === 1 ? copy.tomorrow : fmt({ weekday: "long" });
  const text = `${day}${copy.daySeparator} ${fmt({ day: "numeric", month: "long" })}${y !== ty ? ` ${y}` : ""}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatPrice(price: number, lang?: string) {
  const n = new Intl.NumberFormat(locales[resolveLang(lang)], { maximumFractionDigits: 0 }).format(price);
  return `${n}${t(lang).currency}`;
}

export type Duration = { days?: string | number; hours?: string | number; minutes?: string | number };

export function formatDuration(duration: Duration | undefined, lang?: string) {
  if (!duration) return "";
  const d = t(lang);
  const parts: string[] = [];
  if (Number(duration.days)) parts.push(`${duration.days} ${d.days}`);
  if (Number(duration.hours)) parts.push(`${duration.hours} ${d.hours}`);
  if (Number(duration.minutes)) parts.push(`${duration.minutes} ${d.minutes}`);
  return parts.join(" ");
}

export function durationBetween(from: Date, to: Date): Duration {
  const total = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  const days = Math.floor(total / 1440);
  return { days: days || "", hours: Math.floor((total % 1440) / 60), minutes: total % 60 };
}

export function isoToday(timeZone = STOCKHOLM) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
