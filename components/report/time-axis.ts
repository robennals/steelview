import { dateToYear, formatDate } from './format';
import type { PartialDate } from './types';

/**
 * The shared horizontal time axis of PeriodTimeline and its event markers: a span of
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

/**
 * A time axis that cuts out long empty stretches. Most timelines have one or
 * two early events and then a burst of recent ones; drawn to scale, the burst
 * shares a sliver of the axis. Here any gap between neighbouring dates longer
 * than `gapShare` of the whole span is squeezed to `breakShare` of it and
 * marked as a break, so the axis is to scale only within each stretch
 * (`segments`) and says so where it is not.
 */
export type BrokenScale = {
  /** Where a moment sits, 0–100, with `pad` percent kept clear at each end for markers. */
  at: (year: number) => number;
  /** Where each break is drawn, 0–100. */
  breaks: number[];
  /** The stretches drawn to scale, earliest first. */
  segments: TimeSpan[];
};

export function brokenScale(years: number[], { gapShare = 0.25, breakShare = 0.07, pad = 4 } = {}): BrokenScale {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  if (sorted.length < 2) {
    const only = sorted[0] ?? 0;
    return { at: () => 50, breaks: [], segments: [{ from: only, to: only }] };
  }
  const span = sorted[sorted.length - 1] - sorted[0];
  // Distance along the squeezed axis to each date.
  const along = [0];
  const breakAfter: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    const long = gap > span * gapShare;
    if (long) breakAfter.push(i - 1);
    along.push(along[i - 1] + (long ? span * breakShare : gap));
  }
  const total = along[along.length - 1];
  const at = (year: number) => {
    let i = sorted.findIndex(d => d >= year);
    if (i <= 0) return pad;
    if (i === -1) i = sorted.length - 1;
    const [a, b] = [sorted[i - 1], sorted[i]];
    const share = Math.min(1, (year - a) / (b - a));
    return pad + ((100 - 2 * pad) * (along[i - 1] + share * (along[i] - along[i - 1]))) / total;
  };
  const segments: TimeSpan[] = [];
  let start = 0;
  for (const end of [...breakAfter, sorted.length - 1]) {
    segments.push({ from: sorted[start], to: sorted[end] });
    start = end + 1;
  }
  return { at, breaks: breakAfter.map(i => at((sorted[i] + sorted[i + 1]) / 2)), segments };
}

/** A label at either end of the axis is aligned inwards (`tickEdge`) rather than centred, so it never spills past the plot. */
export function tickEdge(x: number): 'start' | 'end' | undefined {
  if (x < 7) return 'start';
  if (x > 93) return 'end';
  return undefined;
}

/** The axis a label must fit: a phone's, the narrowest, in px, and the width of one character of a label there. */
const PHONE_AXIS = 330;
const LABEL_CHAR = 6.4;

/** The span a tick's label covers, in percent of a phone-width axis. */
function labelExtent({ x, label }: AxisTick): [number, number] {
  const width = (label.length * LABEL_CHAR * 100) / PHONE_AXIS;
  const edge = tickEdge(x);
  if (edge === 'start') return [x - 2, x - 2 + width];
  if (edge === 'end') return [x + 2 - width, x + 2];
  return [x - width / 2, x + width / 2];
}

/** A tick on a broken axis: `x` is its place, 0–100. */
export type AxisTick = { x: number; label: string };

/**
 * Labelled ticks for a broken axis, with at least `minGap` percent of clear
 * space between labels on a phone-width axis (`labelExtent`). Each stretch is labelled at its start first,
 * so no stretch is left without a date; whole years or, for a short
 * timeline, months fill in between where there is room.
 */
export function brokenTicks(scale: BrokenScale, { minGap = 5 } = {}): AxisTick[] {
  const length = scale.segments.reduce((sum, s) => sum + (s.to - s.from), 0);
  const months = length < MONTH_TICKS_BELOW;
  const anchorLabel = (year: number) => {
    if (!months) return String(Math.floor(year));
    const month = Math.floor(Math.round(year * 12 * 1e6) / 1e6);
    return formatDate(`${Math.floor(month / 12)}-${String((month % 12) + 1).padStart(2, '0')}`);
  };
  const anchors = scale.segments.map(s => ({ x: scale.at(s.from), label: anchorLabel(s.from) }));
  const between = scale.segments.flatMap(s => {
    const share = length > 0 ? (s.to - s.from) / length : 1;
    const most = Math.max(1, Math.round(4 * share));
    const ticks = months
      ? timeTicks({ from: s.from, to: s.to }, most)
      : yearTicks({ from: s.from, to: s.to }, most).map(t => ({ at: t.year, label: String(t.year), minor: t.minor }));
    return ticks
      .filter(t => t.at > s.from + 1e-9 && t.at <= s.to + 1e-9)
      // A month tick names its year only where the year changes.
      .map(t => ({ x: scale.at(t.at), label: months && !/^Jan/.test(t.label) ? t.label.split(' ')[0] : t.label }));
  });
  const kept: AxisTick[] = [];
  for (const tick of [...anchors, ...between]) {
    const [from, to] = labelExtent(tick);
    const clear = kept.every(k => {
      const [kFrom, kTo] = labelExtent(k);
      return from >= kTo + minGap || to <= kFrom - minGap;
    });
    if (clear && !kept.some(k => k.label === tick.label)) kept.push(tick);
  }
  kept.sort((a, b) => a.x - b.x);
  if (!months) return kept;
  // A month label names its year only where the year changes, so labels stay short enough not to collide.
  let year = '';
  return kept.map(tick => {
    const [name, ofYear = year] = tick.label.split(' ');
    const label = ofYear === year ? name : `${name} ${ofYear}`;
    year = ofYear;
    return { ...tick, label };
  });
}
