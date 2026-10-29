import { linearScale, niceTicks } from './scale';

/** An estimate's three numbers, any of which a source may not publish. At least one is present. */
export type EstimateBounds = { estimate?: number; low?: number; high?: number };

function present(row: EstimateBounds): number[] {
  return [row.low, row.estimate, row.high].filter((v): v is number => v !== undefined);
}

/**
 * The axis for a forest plot: wide enough for every interval and always
 * including the no-effect value, so a reader can see at a glance which
 * intervals cross it. An axis that stopped short of zero would hide exactly
 * the thing the figure is for. A `null` no-effect value — costs, counts —
 * adds nothing to the extent.
 */
export function estimateScale(
  rows: EstimateBounds[],
  nullValue: number | null = 0,
  domain?: [number, number],
) {
  const values = [...(nullValue === null ? [] : [nullValue]), ...rows.flatMap(present)];
  const lo = domain?.[0] ?? Math.min(...values);
  const hi = domain?.[1] ?? Math.max(...values);
  const ticks = domain ? niceTicks(lo, hi, 5).filter(t => t >= lo && t <= hi) : niceTicks(lo, hi, 5);
  const extent: [number, number] = domain ?? [ticks[0], ticks[ticks.length - 1]];
  const x = linearScale(extent, [0, 100]);
  const clamp = (value: number) => Math.max(0, Math.min(100, x(value)));
  return { ticks, x: clamp, zero: nullValue === null ? undefined : clamp(nullValue) };
}

/**
 * Whether an interval includes the no-effect value — said in words beside
 * the dot, never by colour alone. A missing bound is open: "at least 25"
 * runs on upwards. `undefined` when there is no interval at all (a central
 * estimate alone) or no no-effect value to cross.
 */
export function crossesNull(row: EstimateBounds, nullValue: number | null = 0): boolean | undefined {
  if (nullValue === null || (row.low === undefined && row.high === undefined)) return undefined;
  return (row.low ?? -Infinity) <= nullValue && (row.high ?? Infinity) >= nullValue;
}

/**
 * Where a row's whisker runs, in percent of the track, or `undefined` for a
 * central estimate with no interval. A lone `low` runs to the axis end and a
 * lone `high` from the axis start, each marked open at that end.
 */
export function whiskerSpan(row: EstimateBounds, x: (value: number) => number): { left: number; right: number; openStart: boolean; openEnd: boolean } | undefined {
  if (row.low === undefined && row.high === undefined) return undefined;
  return {
    left: row.low === undefined ? 0 : x(row.low),
    right: row.high === undefined ? 100 : x(row.high),
    openStart: row.low === undefined,
    openEnd: row.high === undefined,
  };
}
