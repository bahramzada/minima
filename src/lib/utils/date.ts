import { appTimeZone } from "@/lib/config";

export function toDateKey(date = new Date(), timeZone = appTimeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function startOfMonth(dateKey: string) {
  return `${dateKey.slice(0, 7)}-01`;
}

export function dateRange(endDate: string, length: number) {
  return Array.from({ length }, (_, index) =>
    addDays(endDate, index - (length - 1)),
  );
}
