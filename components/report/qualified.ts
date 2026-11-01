import { formatValue } from './format';
import type { ValueFormat } from './types';

/**
 * A number as the source states it: "at least 159", "about 30%", "4–6%".
 *
 * A bound or an approximation printed as a bare number is a true number used
 * to mislead — "159 deaths" reads as a count when the source said "at
 * least". So every figure that takes a number also takes one of these, and
 * each component draws the qualification as well as the value: an
 * arrowhead on a bar, a glyph and a stipple on a map, the words in a table.
 *
 * The content schema mirrors this (`figureNumberSchema` in
 * lib/content/schema.ts).
 */

/** Mirrors `QUALIFIERS` in lib/content/schema.ts. */
export type Qualifier = 'about' | 'at least' | 'at most' | 'more than' | 'fewer than' | 'under' | 'over' | 'nearly';

/** One value with how the source qualifies it. No `qualifier` means the source states it exactly. */
export type QualifiedPoint = {
  value: number;
  qualifier?: Qualifier;
  /** The source's own wording, shown wherever the value is read as text. */
  asPublished?: string;
};

/** A range the source publishes instead of one value: "4–6%". Drawn as the range; sorted by its midpoint. */
export type QualifiedRange = {
  low: number;
  high: number;
  asPublished?: string;
};

export type QualifiedValue = QualifiedPoint | QualifiedRange;

/** What every figure accepts where it takes a number: a bare number, or a qualified one. */
export type FigureNumber = number | QualifiedValue;

/**
 * What a qualification means for drawing:
 *
 * - `lower-bound` — the true value is this or more (`at least`, `more than`, `over`);
 * - `upper-bound` — this or less (`at most`, `fewer than`, `under`);
 * - `approximate` — near this (`about`, `nearly`);
 * - `range` — somewhere between `low` and `high`.
 */
export type Qualification = 'exact' | 'lower-bound' | 'upper-bound' | 'approximate' | 'range';

const QUALIFICATION_OF: Record<Qualifier, Exclude<Qualification, 'exact' | 'range'>> = {
  'at least': 'lower-bound',
  'more than': 'lower-bound',
  over: 'lower-bound',
  'at most': 'upper-bound',
  'fewer than': 'upper-bound',
  under: 'upper-bound',
  about: 'approximate',
  nearly: 'approximate',
};

/** Whether a value — or any object that may be one, such as a table cell — is a published range. */
export function isRange(value: number | object): value is QualifiedRange {
  return typeof value === 'object' && 'low' in value;
}

export function qualificationOf(value: FigureNumber): Qualification {
  if (typeof value === 'number') return 'exact';
  if (isRange(value)) return 'range';
  return value.qualifier ? QUALIFICATION_OF[value.qualifier] : 'exact';
}

/** The single number a figure places, colours and sorts by: the value, or a range's midpoint. */
export function pointValue(value: FigureNumber): number {
  if (typeof value === 'number') return value;
  return isRange(value) ? (value.low + value.high) / 2 : value.value;
}

/** Every number the value spans — both ends of a range — for fitting a scale around it. */
export function extentValues(value: FigureNumber): number[] {
  if (typeof value === 'number') return [value];
  return isRange(value) ? [value.low, value.high] : [value.value];
}

/** "▲" for a lower bound, "▼" for an upper bound: the mark a map prints on a bounded area's label. */
export function boundGlyph(value: FigureNumber): '▲' | '▼' | undefined {
  const qualification = qualificationOf(value);
  return qualification === 'lower-bound' ? '▲' : qualification === 'upper-bound' ? '▼' : undefined;
}

/**
 * A range written once: the shared unit after the high end and the shared
 * currency before the low one ("4–6%", "$4–6bn", "1,200–1,500"), or "−4% to
 * 6%" when a sign would make an en dash read as a minus.
 */
export function rangeText(low: number, high: number, format: ValueFormat = {}): string {
  const from = formatValue(low, format);
  const to = formatValue(high, format);
  if (low < 0 || high < 0) return `${from} to ${to}`;
  const suffix = (text: string) => text.match(/[^\d.,]*$/)?.[0] ?? '';
  const prefix = (text: string) => text.match(/^[^\d.,]*/)?.[0] ?? '';
  const sharedSuffix = suffix(from) === suffix(to) ? suffix(from) : '';
  const sharedPrefix = prefix(from) === prefix(to) ? prefix(to) : '';
  return `${from.slice(0, from.length - sharedSuffix.length)}–${to.slice(sharedPrefix.length)}`;
}

/**
 * The value as a short label — "at least 159", "about 30%", "4–6%" — for
 * places a number is set as part of a graphic: a bar's value, a key figure.
 */
export function qualifiedLabel(value: FigureNumber, format: ValueFormat = {}): string {
  if (typeof value === 'number') return formatValue(value, format);
  if (isRange(value)) return rangeText(value.low, value.high, format);
  const number = formatValue(value.value, format);
  return value.qualifier ? `${value.qualifier} ${number}` : number;
}

/**
 * The value as a reader reads it in text — a table cell, a readout, a map
 * table: the source's wording when the value is qualified and the wording
 * is given, else `qualifiedLabel`. An exact value keeps its formatted
 * number, so `asPublished` written only for `check:figures` ("(76%)")
 * never replaces a figure that says the same thing.
 */
export function qualifiedText(value: FigureNumber, format: ValueFormat = {}): string {
  if (typeof value !== 'number' && value.asPublished && qualificationOf(value) !== 'exact') return value.asPublished;
  return qualifiedLabel(value, format);
}

/** The key line for each mark, in the words a legend uses. Components list only the qualifications that appear. */
export const QUALIFICATION_KEY: Record<Exclude<Qualification, 'exact'>, string> = {
  'lower-bound': 'at least this value: the source gives a lower bound',
  'upper-bound': 'at most this value: the source gives an upper bound',
  approximate: 'approximate: the source says “about” or “nearly”',
  range: 'a range: the source gives a low and a high',
};

/** The qualifications present among `values`, in a fixed order, for a legend. */
export function qualificationsIn(values: FigureNumber[]): Array<Exclude<Qualification, 'exact'>> {
  const present = new Set(values.map(qualificationOf));
  return (['lower-bound', 'upper-bound', 'approximate', 'range'] as const).filter(q => present.has(q));
}
