export const MATURITY_WINDOW_MONTHS = 4;

/** Demo clock so the 4-month reminder stays visible after 2026. */
export const DEMO_TODAY = new Date(2026, 7, 14);

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseIsoDate(iso: string): Date | null {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function addCalendarMonths(date: Date, months: number): Date {
  const next = startOfDay(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

export function isMaturityReminderDue(
  maturityDate: string | null,
  today: Date,
): boolean {
  if (!maturityDate) {
    return false;
  }
  const maturity = parseIsoDate(maturityDate);
  if (!maturity) {
    return false;
  }
  const start = startOfDay(today);
  const end = addCalendarMonths(start, MATURITY_WINDOW_MONTHS);
  return maturity.getTime() >= start.getTime() && maturity.getTime() <= end.getTime();
}
