import { linearScale, niceTicks } from './scale';

/** An estimate's three numbers, any of which a source may not publish. At least one is present. */
export type EstimateBounds = { estimate?: number; low?: number; high?: number };

function present(row: EstimateBounds): number[] {
  return [row.low, row.estimate, row.high].filter((v): v is number => v !== undefined);
}

/**
 * Where a lone bound's open tail reaches, in data units, so the axis can
 * hold it: `room` past the bound on its open side, but never across zero —
 * a time or a cost axis does not run negative to make room for "less than
 * one week". A log axis passes `stopAtZero: false`: its units are logarithms,
 * where crossing zero only means crossing 1.
 */
function openTailReach(row: EstimateBounds, room: number, stopAtZero = true): number[] {
  if (row.low !== undefined && row.high === undefined) {
    const reach = row.low + room;
    return [stopAtZero && row.low <= 0 && reach > 0 ? 0 : reach];
  }
  if (row.high !== undefined && row.low === undefined) {
    const reach = row.high - room;
    return [stopAtZero && row.high >= 0 && reach < 0 ? 0 : reach];
  }
  return [];
}

/** How the axis spaces values: evenly (`linear`), or by ratio (`log`), for multiples such as "7× the British rate". */
export type EstimateAxis = 'linear' | 'log';

/**
 * Round ticks for a log axis: 1, 2 and 5 times each power of ten, from the
 * last at or below `lo` to the first at or above `hi`, so equal ratios get
 * equal room and every tick is a number a reader can say.
 */
export function logTicks(lo: number, hi: number): number[] {
  const ticks: number[] = [];
  for (let power = Math.floor(Math.log10(lo)) - 1; power <= Math.ceil(Math.log10(hi)) + 1; power++) {
    for (const step of [1, 2, 5]) ticks.push(Number((step * 10 ** power).toPrecision(1)));
  }
  const first = Math.max(0, ticks.findLastIndex(t => t <= lo));
  const last = ticks.findIndex(t => t >= hi);
  return ticks.slice(first, last === -1 ? undefined : last + 1);
}

/**
 * The axis for a forest plot: wide enough for every interval and always
 * including the no-effect value, so a reader can see at a glance which
 * intervals cross it. An axis that stopped short of zero would hide exactly
 * the thing the figure is for. A `null` no-effect value — costs, counts —
 * adds nothing to the extent. Without a fixed `domain`, a lone bound at the
 * end of the data gets room for its open tail, so "at least 30" does not
 * stop dead at the axis edge.
 *
 * A `log` axis lays values out by their logarithm, so 0.5× and 2× sit the
 * same distance either side of 1×; every value on it must be above zero.
 */
export function estimateScale(
  rows: EstimateBounds[],
  nullValue: number | null = 0,
  domain?: [number, number],
  axis: EstimateAxis = 'linear',
) {
  const log = axis === 'log';
  // Layout works in "position units": the value itself, or its logarithm.
  const toUnits = (value: number) => (log ? Math.log10(value) : value);
  const fromUnits = (units: number) => (log ? 10 ** units : units);
  const inUnits = (row: EstimateBounds): EstimateBounds => ({
    low: row.low === undefined ? undefined : toUnits(row.low),
    estimate: row.estimate === undefined ? undefined : toUnits(row.estimate),
    high: row.high === undefined ? undefined : toUnits(row.high),
  });
  const data = [...(nullValue === null ? [] : [toUnits(nullValue)]), ...rows.map(inUnits).flatMap(present)];
  const room = ((Math.max(...data) - Math.min(...data)) * OPEN_TAIL) / 100;
  const tails = rows.map(inUnits).flatMap(row => openTailReach(row, room, !log));
  const values = [...data, ...tails].map(fromUnits);
  const lo = domain?.[0] ?? Math.min(...values);
  const hi = domain?.[1] ?? Math.max(...values);
  // On a log axis the reference line never sits on the edge, where it would be
  // mistaken for the axis itself: the axis runs at least one tick past it.
  const reference = nullValue === null || domain ? undefined : nullValue;
  const ticks = log
    ? logTicks(reference === undefined ? lo : Math.min(lo, reference * 0.99), reference === undefined ? hi : Math.max(hi, reference * 1.01)).filter(t => !domain || (t >= lo && t <= hi))
    : domain ? niceTicks(lo, hi, 5).filter(t => t >= lo && t <= hi) : niceTicks(lo, hi, 5);
  const extent: [number, number] = domain ?? [ticks[0], ticks[ticks.length - 1]];
  const position = linearScale([toUnits(extent[0]), toUnits(extent[1])], [0, 100]);
  const x = (value: number) => position(toUnits(value));
  const clamp = (value: number) => Math.max(0, Math.min(100, x(value)));
  /** Which edge a value lies past, when a fixed `domain` cuts it off: it is drawn at that edge, marked as continuing. */
  const beyond = (value: number): AxisEdge | undefined => (value < extent[0] ? 'start' : value > extent[1] ? 'end' : undefined);
  return { ticks, x: clamp, beyond, zero: nullValue === null ? undefined : clamp(nullValue) };
}

export type AxisEdge = 'start' | 'end';
export type EstimateScale = ReturnType<typeof estimateScale>;

/**
 * Whether an interval includes the no-effect value — said in words beside
 * the dot, never by colour alone. `undefined` when there is no interval (a
 * central estimate alone), no no-effect value to cross, or no way to tell:
 * with only one bound published, the interval includes no effect or not
 * depending on the end nobody published — unless the bound itself already
 * lies beyond it ("at least 1" excludes 0).
 */
export function crossesNull(row: EstimateBounds, nullValue: number | null = 0): boolean | undefined {
  if (nullValue === null || (row.low === undefined && row.high === undefined)) return undefined;
  if (row.low !== undefined && row.high !== undefined) return row.low <= nullValue && row.high >= nullValue;
  if (row.low !== undefined) return row.low > nullValue ? false : undefined;
  return row.high !== undefined && row.high < nullValue ? false : undefined;
}

/**
 * How far, in percent of the track, a lone bound's open tail runs from it:
 * far enough to see the direction, short enough not to look measured.
 */
export const OPEN_TAIL = 8;

/**
 * How a whisker end is drawn, beyond a plain cap: `clipped` when the
 * interval runs on past a fixed axis (an arrowhead at the edge), `open` when
 * the source published no bound on that side (a short dashed tail and an
 * arrowhead).
 */
export type WhiskerEnd = 'clipped' | 'open';

/**
 * Where a row's whisker runs, in percent of the track, or `undefined` for a
 * central estimate with no interval. A lone bound runs a short open tail
 * (`OPEN_TAIL`) away from it rather than to the axis edge, which would read
 * as a measured end at the axis start or end — and on past the central
 * estimate, if there is one, so the dot never hides the tail's arrowhead.
 */
export function whiskerSpan(
  row: EstimateBounds,
  scale: Pick<EstimateScale, 'x' | 'beyond'>,
): { left: number; right: number; start: WhiskerEnd | undefined; end: WhiskerEnd | undefined } | undefined {
  const { low, high } = row;
  const clipped = (value: number, edge: AxisEdge) => (scale.beyond(value) === edge ? 'clipped' : undefined);
  if (low === undefined) {
    if (high === undefined) return undefined;
    const right = scale.x(high);
    const reach = Math.min(right - OPEN_TAIL, row.estimate === undefined ? Infinity : scale.x(row.estimate) - OPEN_TAIL / 2);
    return { left: Math.max(0, reach), right, start: 'open', end: clipped(high, 'end') };
  }
  if (high === undefined) {
    const left = scale.x(low);
    const reach = Math.max(left + OPEN_TAIL, row.estimate === undefined ? -Infinity : scale.x(row.estimate) + OPEN_TAIL / 2);
    return { left, right: Math.min(100, reach), start: clipped(low, 'start'), end: 'open' };
  }
  return { left: scale.x(low), right: scale.x(high), start: clipped(low, 'start'), end: clipped(high, 'end') };
}
