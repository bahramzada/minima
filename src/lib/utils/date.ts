export function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function dateRange(endDate: string, length: number) {
  return Array.from({ length }, (_, index) =>
    addDays(endDate, index - (length - 1)),
  );
}
