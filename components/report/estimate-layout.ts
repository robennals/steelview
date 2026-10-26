import { linearScale, niceTicks } from './scale';

/**
 * The axis for a forest plot: wide enough for every interval and always
 * including the no-effect value, so a reader can see at a glance which
 * intervals cross it. An axis that stopped short of zero would hide exactly
 * the thing the figure is for.
 */
export function estimateScale(
  rows: Array<{ estimate: number; low: number; high: number }>,
  nullValue = 0,
  domain?: [number, number],
) {
  const lo = domain?.[0] ?? Math.min(nullValue, ...rows.map(row => row.low));
  const hi = domain?.[1] ?? Math.max(nullValue, ...rows.map(row => row.high));
  const ticks = domain ? niceTicks(lo, hi, 5).filter(t => t >= lo && t <= hi) : niceTicks(lo, hi, 5);
  const extent: [number, number] = domain ?? [ticks[0], ticks[ticks.length - 1]];
  const x = linearScale(extent, [0, 100]);
  const clamp = (value: number) => Math.max(0, Math.min(100, x(value)));
  return { ticks, x: clamp, zero: clamp(nullValue) };
}

/** Whether an interval excludes the no-effect value — said in words beside the dot, never by colour alone. */
export function crossesNull(row: { low: number; high: number }, nullValue = 0): boolean {
  return row.low <= nullValue && row.high >= nullValue;
}
