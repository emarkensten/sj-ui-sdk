import { locales, resolveLang, t } from "./i18n";

const STOCKHOLM = "Europe/Stockholm";

export function formatTime(date: Date, timeZone = STOCKHOLM) {
  return new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit", timeZone }).format(date);
}

/** "Tisdag 24 november", the format SJ's DatePicker shows by default. */
export function formatLongDate(iso: string, lang?: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const text = new Intl.DateTimeFormat(locales[resolveLang(lang)], { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
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
