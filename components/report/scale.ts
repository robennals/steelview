import { niceTicks } from '@/lib/chart/series-chart';

export { niceTicks };

/** A linear map from a data domain onto a pixel (or percentage) range. */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

/**
 * A domain that always contains zero, then widened to round tick values.
 * Bars measure from zero, so a bar domain that starts at 40 would make a
 * 41-against-42 difference look like a doubling.
 */
export function zeroBasedDomain(values: number[], fixedMax?: number): { domain: [number, number]; ticks: number[] } {
  const min = Math.min(0, ...values);
  const max = Math.max(0, fixedMax ?? 0, ...values);
  const ticks = niceTicks(min, max === min ? min + 1 : max, 5);
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}

/** The colour of chart series slot `n` (1-based, wraps after eight). */
export function seriesColor(slot: number): string {
  return `var(--sv-series-${((slot - 1) % 8) + 1})`;
}

/**
 * A colour for a value on a sequential or diverging scale, built from the
 * page's own tokens with `color-mix` so it re-steps for dark mode with no
 * extra palette. `t` is 0..1 for sequential, −1..1 for diverging.
 */
export function rampColor(t: number, kind: 'sequential' | 'diverging' = 'sequential'): string {
  if (kind === 'diverging') {
    const end = t < 0 ? 'var(--sv-series-7)' : 'var(--sv-series-1)';
    const strength = Math.round(Math.min(1, Math.abs(t)) * 88);
    return `color-mix(in oklab, ${end} ${strength}%, var(--paper-sunk))`;
  }
  const strength = Math.round(10 + Math.min(1, Math.max(0, t)) * 82);
  return `color-mix(in oklab, var(--sv-series-1) ${strength}%, var(--paper-sunk))`;
}

/**
 * Splits a domain into `steps` equal bins and returns each bin's bounds and
 * colour — the legend for a stepped choropleth. Stepped rather than
 * continuous because a reader can match five swatches by eye; they cannot
 * match a gradient.
 */
export function rampBins([min, max]: [number, number], steps: number, kind: 'sequential' | 'diverging' = 'sequential') {
  const width = (max - min) / steps;
  return Array.from({ length: steps }, (_, i) => {
    const from = min + i * width;
    const to = from + width;
    const mid = (from + to) / 2;
    const t = kind === 'diverging' ? mid / Math.max(Math.abs(min), Math.abs(max)) : (i + 0.5) / steps;
    return { from, to, color: rampColor(t, kind) };
  });
}

/** The colour of the bin a value falls into. */
export function binColor(value: number, bins: ReturnType<typeof rampBins>): string {
  const bin = bins.find(b => value < b.to) ?? bins[bins.length - 1];
  return bin.color;
}
