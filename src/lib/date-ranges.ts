// Shared helpers for building comparable "current vs previous" date windows
// used across the dashboard/commission/leads aggregation routes.

export function currentAndPreviousMonth(now: Date) {
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = now;
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  return { currentStart, currentEnd, previousStart, previousEnd };
}

export function last12MonthsRange(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  return { start, end: now };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function monthLabels(now: Date): { key: string; label: string; start: Date; end: Date }[] {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    const label = start.toLocaleDateString("en-US", { month: "short" });
    months.push({ key, label, start, end });
  }
  return months;
}
