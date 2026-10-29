import { formatValue } from '../format';
import { binColor, rampBins, rampColor } from '../scale';
import type { ValueFormat } from '../types';

/**
 * The arithmetic GeoMap and TileMap share: one value per area, a stepped
 * colour scale over round boundaries, and the text a reader sees for an area.
 * Kept apart from the markup so the two maps provably colour the same value
 * the same way, and so it can be tested without a renderer.
 */

/** One area's figure. `label` overrides the formatted value, e.g. "<0.1". */
export type MapDatum = { value: number; label?: string };

/** Figures keyed by area id. An id that is absent is "No data", never zero. */
export type MapData = Record<string, MapDatum>;

export type MapScaleKind = 'sequential' | 'diverging';

/** How GeoMap and TileMap shade areas by a number. The alternative is `CategoryEncoding` (categorical.ts). */
export type MapValueEncoding = {
  /** Figures keyed by area id. An area with no entry is hatched and reads "No data". */
  data: MapData;
  /** What the figure is, e.g. "Share of residents born abroad". */
  valueLabel: string;
  format?: ValueFormat;
  scale?: MapScaleKind;
  steps?: number;
  domain?: [number, number];
  /** Explicit, possibly uneven, bin boundaries for skewed data. Overrides `steps` and `domain`. */
  breaks?: number[];
};

export type MapScaleOptions = {
  kind?: MapScaleKind;
  /** Number of colour steps. Defaults to 5 (sequential) or 6 (diverging, so zero is a boundary). */
  steps?: number;
  /** Fix the scale ends, e.g. to share one scale across several maps. */
  domain?: [number, number];
  /**
   * Explicit bin boundaries, lowest to highest, for skewed data: when two
   * countries sit far above the rest, equal steps leave everyone else in the
   * palest bin. Overrides `steps` and `domain`. The legend still draws equal
   * swatches and writes each boundary, so uneven steps are never hidden.
   */
  breaks?: number[];
};

export type MapScale = {
  kind: MapScaleKind;
  domain: [number, number];
  bins: ReturnType<typeof rampBins>;
  color: (value: number) => string;
};

/** The 1-2-2.5-5-10 ladder, so every legend boundary is a number a reader can say aloud. */
const LADDER = [1, 2, 2.5, 5, 10];

function niceStepAtLeast(raw: number): number {
  if (!(raw > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = LADDER.find(n => n * magnitude >= raw - 1e-12) ?? 10;
  return step * magnitude;
}

/**
 * A domain split into `steps` equal bins with round boundaries that covers
 * every value. Sequential scales start at a round number at or below the
 * minimum rather than at zero: on a map of shares that all sit between 6%
 * and 41%, a scale from zero would spend its first step on no area at all.
 * Diverging scales are symmetric about zero, so the same depth of colour
 * means the same size of change either way.
 */
export function niceMapDomain(values: number[], kind: MapScaleKind, steps: number): [number, number] {
  if (values.length === 0) return kind === 'diverging' ? [-1, 1] : [0, 1];
  if (kind === 'diverging') {
    const half = Math.max(1, Math.floor(steps / 2));
    const reach = Math.max(...values.map(Math.abs));
    const step = niceStepAtLeast(reach / half);
    return [-step * half, step * half];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  let step = niceStepAtLeast((max - min) / steps || Math.abs(max) / steps || 1);
  for (let guard = 0; guard < 20; guard++) {
    const lo = Math.floor(min / step) * step;
    if (lo + step * steps >= max) return [lo, lo + step * steps];
    step = niceStepAtLeast(step * 1.0001);
  }
  return [min, max];
}

export function mapScale(data: MapData, { kind = 'sequential', steps, domain, breaks }: MapScaleOptions = {}): MapScale {
  if (breaks && breaks.length >= 2) {
    const n = breaks.length - 1;
    const reach = Math.max(Math.abs(breaks[0]), Math.abs(breaks[n])) || 1;
    const bins = breaks.slice(0, -1).map((from, i) => {
      const to = breaks[i + 1];
      const t = kind === 'diverging' ? (from + to) / 2 / reach : (i + 0.5) / n;
      return { from, to, color: rampColor(t, kind) };
    });
    return { kind, domain: [breaks[0], breaks[n]], bins, color: (value: number) => binColor(value, bins) };
  }
  const count = steps ?? (kind === 'diverging' ? 6 : 5);
  const values = Object.values(data).map(d => d.value);
  const resolved = domain ?? niceMapDomain(values, kind, count);
  const bins = rampBins(resolved, count, kind);
  return { kind, domain: resolved, bins, color: (value: number) => binColor(value, bins) };
}

/** The figure as written in a readout, a tile or a table cell. */
export function datumText(datum: MapDatum | undefined, format: ValueFormat = {}): string {
  if (!datum) return 'No data';
  return datum.label ?? formatValue(datum.value, format);
}

/** "London: 40.6%" — what the readout says, and what a focused area is called. */
export function readoutText(name: string, datum: MapDatum | undefined, format: ValueFormat = {}): string {
  return `${name}: ${datumText(datum, format)}`;
}

/**
 * The screen-reader description both maps point at: what is shaded, the
 * extremes, and which areas the source does not cover.
 */
export function mapSummary(
  intro: string,
  areas: Array<{ id: string; name: string }>,
  data: MapData,
  format: ValueFormat = {},
  extra?: string,
): string {
  const ranked = areas.filter(area => data[area.id]).sort((a, b) => data[b.id].value - data[a.id].value);
  const missing = areas.filter(area => !data[area.id]);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  return [
    intro,
    highest ? `Highest: ${readoutText(highest.name, data[highest.id], format)}. Lowest: ${readoutText(lowest.name, data[lowest.id], format)}.` : null,
    missing.length > 0 ? `No data for ${missing.map(area => area.name).join(', ')}.` : null,
    extra,
    'Use the Table switch to see every value.',
  ].filter(Boolean).join(' ');
}
