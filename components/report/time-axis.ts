import { dateToYear } from './format';
import type { PartialDate } from './types';

/**
 * The shared horizontal time axis of PeriodTimeline and EventStrip: a span of
 * fractional years, positions as percentages of it (so HTML can lay out bars
 * and markers without measuring), and round year ticks.
 */

export type TimeSpan = { from: number; to: number };

/** Accepts a year number or a partial date. */
export function toYear(value: number | PartialDate): number {
  return typeof value === 'number' ? value : dateToYear(value);
}

/** Where a moment sits along the span, 0–100, clamped to the ends. */
export function percentAlong(year: number, { from, to }: TimeSpan): number {
  const t = ((year - from) / (to - from || 1)) * 100;
  return Math.min(100, Math.max(0, t));
}

/** A tick label at either end of the axis is aligned inwards so it never spills past the plot. */
export function edgeOf(percent: number): 'start' | 'end' | undefined {
  if (percent <= 0.5) return 'start';
  if (percent >= 99.5) return 'end';
  return undefined;
}

/**
 * Whole-year ticks on a step from the 1-2-5 ladder, at most `maxTicks` of
 * them (eight by default: any more and the end labels, aligned inwards, run
 * into their neighbours on a page-width axis). `minor` marks every other tick so a narrow
 * rendering can drop half the labels and keep the gridlines.
 */
export function yearTicks({ from, to }: TimeSpan, maxTicks = 8): Array<{ year: number; minor: boolean }> {
  const span = to - from;
  const step = [1, 2, 5, 10, 20, 50, 100].find(s => span / s <= maxTicks) ?? 100;
  const first = Math.ceil(from / step) * step;
  const ticks: Array<{ year: number; minor: boolean }> = [];
  for (let year = first, i = 0; year <= to + 1e-9; year += step, i++) {
    ticks.push({ year, minor: i % 2 === 1 });
  }
  return ticks;
}

/**
 * Two placement levels for markers that would otherwise overlap: a marker
 * closer than `gap` (in percent of the span) to the previous one on a level
 * moves to the next level. Greedy, left to right, so order on the axis is
 * always the reading order.
 */
export function stackLevels(positions: number[], gap: number, maxLevels = 3): number[] {
  const lastOnLevel: number[] = [];
  return positions.map(x => {
    let level = lastOnLevel.findIndex(last => x - last >= gap);
    if (level === -1) level = lastOnLevel.length < maxLevels ? lastOnLevel.length : lastOnLevel.indexOf(Math.min(...lastOnLevel));
    lastOnLevel[level] = x;
    return level;
  });
}
