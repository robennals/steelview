import { datePlacement, isApproximateDate } from '@/lib/content/period';
import { compareDates } from './format';
import { brokenScale, brokenTicks, stackLevels, toYear, type AxisTick, type BrokenScale } from './time-axis';
import type { PartialDate } from './types';
import type { TimelineEvent } from './timeline';

/**
 * The layout a timeline and its thumbnail share, so the thumbnail is the
 * timeline drawn small: the same axis, breaks and markers, and the same
 * events given cards in a preview.
 */

/** A preview shows at most this many cards; the rest are markers on its axis. */
export const PREVIEW_CARDS = 3;

/**
 * Date order, by where each date is placed; at the same place an
 * approximate date comes first, so "1850s" heads the 1850s.
 */
export function compareEventDates(a: PartialDate, b: PartialDate) {
  return compareDates(datePlacement(a), datePlacement(b)) || Number(isApproximateDate(b)) - Number(isApproximateDate(a));
}

export function sortEvents<E extends Pick<TimelineEvent, 'date'>>(events: E[]): E[] {
  return [...events].sort((a, b) => compareEventDates(a.date, b.date));
}

/**
 * Whether every event is a short name (a country, a person), so the names
 * themselves go on the axis: cards holding one word each would be mostly
 * empty box.
 */
export function namesOnAxis(events: Pick<TimelineEvent, 'title'>[]): boolean {
  return events.length <= 8 && events.every(e => e.title.length <= 16);
}

export type EventAxis = {
  scale: BrokenScale;
  ticks: AxisTick[];
  /** Each event's place on the axis, 0–100, and its end's for one that lasted. */
  places: Array<{ x: number; end?: number }>;
  /** Each event's level above the axis, so markers that would overlap stack. */
  levels: number[];
};

/**
 * Markers are ~12px; at a 330px phone axis, 5% keeps neighbours apart. A
 * name on the axis needs room for itself, so names stack sooner.
 */
const MARKER_GAP = 5;
const NAME_GAP = 26;

/**
 * The baseline in pieces, from 0 to 100, leaving a gap of `gap` either side
 * of each break, so the line visibly stops where time is cut out.
 */
export function baselinePieces(breaks: number[], gap: number): Array<{ from: number; to: number }> {
  const starts = [0, ...breaks];
  return starts.map((at, k) => ({ from: k === 0 ? 0 : at + gap, to: k + 1 < starts.length ? starts[k + 1] - gap : 100 }));
}

/** The axis for `events`, which must be in date order. */
export function eventAxis(events: Pick<TimelineEvent, 'date' | 'endDate' | 'title'>[]): EventAxis {
  const starts = events.map(e => toYear(datePlacement(e.date)));
  const ends = events.map(e => (e.endDate ? toYear(datePlacement(e.endDate)) : undefined));
  const scale = brokenScale([...starts, ...ends.filter((y): y is number => y !== undefined)]);
  const places = starts.map((start, i) => {
    const end = ends[i];
    return { x: scale.at(start), end: end === undefined ? undefined : scale.at(end) };
  });
  const named = namesOnAxis(events);
  const levels = stackLevels(places.map(p => p.x), named ? NAME_GAP : MARKER_GAP, named ? 3 : 4);
  return { scale, ticks: brokenTicks(scale), places, levels };
}

/**
 * The events a preview gives cards to: those its claim is about (`picked`,
 * by title), else the major ones, else the latest — at most `PREVIEW_CARDS`,
 * in date order. `events` must be in date order.
 */
export function previewEvents<E extends Pick<TimelineEvent, 'title' | 'significance'>>(events: E[], picked: string[] = []): E[] {
  const chosen = events.filter(e => picked.includes(e.title));
  const major = events.filter(e => e.significance === 'major');
  const pool = chosen.length > 0 ? chosen : major.length > 0 ? major : events.slice(-PREVIEW_CARDS);
  return pool.slice(0, PREVIEW_CARDS);
}
