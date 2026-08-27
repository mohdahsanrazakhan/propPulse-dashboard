// Shared randomization helpers for the seed script.

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface Weighted<T> {
  item: T;
  weight: number;
}

export function weightedPick<T>(weighted: Weighted<T>[]): T {
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.item;
  }
  return weighted[weighted.length - 1].item;
}

// Splits `total` into `n` integer parts proportional to `weights`, exact sum = total.
export function splitByWeights(total: number, weights: number[]): number[] {
  const sumWeights = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sumWeights) * total);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const fracIndices = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  let k = 0;
  while (remainder > 0 && k < fracIndices.length) {
    result[fracIndices[k].i] += 1;
    remainder -= 1;
    k += 1;
  }
  return result;
}

// A-Res weighted reservoir sampling priority key. Higher weight -> tends to
// produce a higher priority (so sorting descending favors high-weight items).
export function weightedPriority(weight: number): number {
  const u = Math.max(Math.random(), 1e-9);
  return Math.pow(u, 1 / Math.max(weight, 0.0001));
}

export function randomDateBetween(start: Date, end: Date): Date {
  const t = randInt(start.getTime(), end.getTime());
  return new Date(t);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60_000);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60_000));
}

export function pad(num: number, size: number): string {
  return num.toString().padStart(size, "0");
}
