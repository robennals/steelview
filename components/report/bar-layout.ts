import { linearScale, zeroBasedDomain } from './scale';
import { formatValue } from './format';
import { isRange, pointValue, qualificationOf, type FigureNumber, type Qualification } from './qualified';
import type { ValueFormat } from './types';

/**
 * Layout maths shared by every horizontal-bar figure (BarChart,
 * SliceExplorer). Positions are percentages of the track, so the markup is
 * plain HTML that reflows at any width with no measuring on the client.
 */

export type BarScale = {
  domain: [number, number];
  ticks: number[];
  /** Percentage from the track's left edge for a value. */
  x: (value: number) => number;
  /** Percentage position of zero — where every bar starts. */
  zero: number;
};

/** A zero-based scale over the given values, widened to round ticks. */
export function barScale(values: number[], domainMax?: number): BarScale {
  const { domain, ticks } = zeroBasedDomain(values.filter(Number.isFinite), domainMax);
  const x = linearScale(domain, [0, 100]);
  return { domain, ticks, x, zero: x(0) };
}

/** The order bars are drawn in: largest first for `value` (the default; a range by its midpoint), as given for `none`. */
export function orderBars<T extends { value: FigureNumber }>(items: T[], sort: 'value' | 'none' = 'value'): T[] {
  return sort === 'value' ? [...items].sort((a, b) => pointValue(b.value) - pointValue(a.value)) : items;
}

export type Span = { left: number; width: number };

/** One bar from zero to `value`; negative values extend left of zero. */
export function barSpan(value: number, scale: BarScale): Span {
  const end = scale.x(value);
  return { left: Math.min(end, scale.zero), width: Math.abs(end - scale.zero) };
}

/** A bar for a qualified value: its span, how it is qualified, and for a range the whisker beyond it. */
export type QualifiedSpan = Span & { qualification: Qualification; whisker?: Span; negative?: boolean };

/**
 * One bar for a value as the source gives it: to the value — a bound or an
 * approximation is marked at the end, not moved — or, for a range, to
 * `low` with a whisker on to `high`, so the drawn bar never claims more than
 * the source's smallest figure.
 */
export function qualifiedSpan(value: FigureNumber, scale: BarScale): QualifiedSpan {
  const qualification = qualificationOf(value);
  if (isRange(value)) {
    const whisker = { left: scale.x(value.low), width: Math.max(0, scale.x(value.high) - scale.x(value.low)) };
    return { ...barSpan(value.low, scale), qualification, whisker, ...(value.low < 0 ? { negative: true } : null) };
  }
  const point = pointValue(value);
  return { ...barSpan(point, scale), qualification, ...(point < 0 ? { negative: true } : null) };
}

/**
 * Stacked segments for one row. Positive parts stack rightwards from zero
 * and negative parts leftwards, each in their own run: interleaving them
 * would draw a segment over the one before it and hide it.
 */
export function stackSpans(values: Array<number | null>, scale: BarScale): Array<Span | null> {
  let positive = 0;
  let negative = 0;
  return values.map(value => {
    if (value === null || !Number.isFinite(value) || value === 0) return null;
    const from = value > 0 ? positive : negative;
    const to = from + value;
    if (value > 0) positive = to;
    else negative = to;
    const a = scale.x(from);
    const b = scale.x(to);
    return { left: Math.min(a, b), width: Math.abs(b - a) };
  });
}

/** The extent a stacked row reaches on each side of zero, for the domain. */
export function stackExtent(values: Array<number | null>): [number, number] {
  let positive = 0;
  let negative = 0;
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    if (value > 0) positive += value;
    else negative += value;
  }
  return [negative, positive];
}

/**
 * Axis tick labels. Large values are written compactly (250k, 1m) so they
 * fit a phone-width axis, but a tick that compaction would round — 1,250,000
 * as "1.3m" — is left unlabelled rather than labelled with a number that is
 * not where it sits. Zero and the round ticks either side still anchor the
 * scale.
 */
export function tickLabels(ticks: number[], format: ValueFormat = {}): Array<{ value: number; label: string | null }> {
  const compact = format.compact ?? ticks.some(tick => Math.abs(tick) >= 10_000);
  const ticksAs = { ...format, compact };
  return ticks.map(value => ({
    value,
    label: format.compact === undefined && compact && !compactsExactly(value) ? null : formatValue(value, ticksAs),
  }));
}

function compactsExactly(value: number): boolean {
  const magnitude = Math.abs(value);
  const step = [1e9, 1e6, 1e3].find(s => magnitude >= s);
  if (!step) return true;
  const scaled = magnitude / step;
  const digits = scaled >= 10 ? scaled : scaled * 10;
  return Math.abs(digits - Math.round(digits)) < 1e-9;
}
