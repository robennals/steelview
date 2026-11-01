import { dateToYear, formatDate } from './format';
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

/**
 * The whole years that hold every date: from the start of the earliest
 * date's year to the start of the year after the latest. `from` and `to`
 * override either end.
 */
export function spanOf(dates: Array<number | PartialDate>, { from, to }: { from?: number | PartialDate; to?: number | PartialDate } = {}): TimeSpan {
  const years = dates.map(toYear);
  return {
    from: from !== undefined ? toYear(from) : Math.floor(Math.min(...years)),
    to: to !== undefined ? toYear(to) : Math.floor(Math.max(...years)) + 1,
  };
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

/** A labelled tick on the time axis: `at` is a fractional year. */
export type TimeTick = { at: number; label: string; minor: boolean };

/** Below this span (in years) an axis of whole years has too few ticks to read, so it counts months. */
const MONTH_TICKS_BELOW = 1.5;

/**
 * The ticks for a time axis: whole years (see `yearTicks`), or for a span
 * under eighteen months, month starts on a 1-, 2-, 3- or 6-month step. A
 * month tick names its year on the first tick and on each January ("Mar
 * 2026", "Apr", … "Jan 2027"), so the axis never leaves the year to guess.
 */
export function timeTicks(span: TimeSpan, maxTicks = 8): TimeTick[] {
  if (span.to - span.from >= MONTH_TICKS_BELOW) {
    return yearTicks(span, maxTicks).map(tick => ({ at: tick.year, label: String(tick.year), minor: tick.minor }));
  }
  // Months counted from year 0, so a step lands on the same months every year (Jan, Mar, May… for two).
  const from = Math.round(span.from * 12 * 1e6) / 1e6;
  const to = span.to * 12 + 1e-6;
  const firstOn = (step: number) => Math.ceil(from / step) * step;
  const count = (step: number) => Math.floor((to - firstOn(step)) / step) + 1;
  const step = [1, 2, 3, 6].find(s => count(s) <= maxTicks) ?? 6;
  const ticks: TimeTick[] = [];
  for (let month = firstOn(step), i = 0; month <= to; month += step, i++) {
    const year = Math.floor(month / 12);
    const date = `${year}-${String((month % 12) + 1).padStart(2, '0')}`;
    const [name] = formatDate(date).split(' ');
    ticks.push({ at: month / 12, label: i === 0 || month % 12 === 0 ? formatDate(date) : name, minor: i % 2 === 1 });
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
