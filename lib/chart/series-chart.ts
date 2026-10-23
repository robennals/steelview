import { comparePeriods, periodToYear, periodYear } from '@/lib/content/period';
import type { Series, SeriesLine, SeriesPoint, SeriesReading } from '@/lib/content/types';

/**
 * Everything about a series chart that is arithmetic rather than markup:
 * scales, ticks, the split of a line at a definitional break, and the merged
 * table of numbers. Kept out of the component so it can be tested without a
 * renderer, and so the two size variants provably share one set of scales.
 *
 * The chart is server-rendered SVG with no client JavaScript — the pages are
 * statically generated, and a chart that needs a bundle to appear is a chart
 * that is missing when the reader has JavaScript off, when the page prints,
 * and when the panel is read by a screen reader that never runs the script.
 */

/**
 * Two size variants, both rendered, one shown by a CSS media query.
 *
 * An SVG with a `viewBox` scales its *text* along with everything else, so a
 * single chart tuned for a 660px desktop panel arrives at 7px type in a 390px
 * modal, and one tuned for 390px arrives at cartoon size on desktop. Rendering
 * both and letting CSS choose costs two path strings and keeps the labels at a
 * readable size at either end. The hidden one is `display: none`, so it is out
 * of the accessibility tree rather than duplicated in it.
 */
export type ChartVariant = 'narrow' | 'wide';

export type ChartGeometry = {
  width: number;
  height: number;
  /** Plot rectangle inside the viewBox. */
  left: number;
  top: number;
  plotWidth: number;
  plotHeight: number;
  fontSize: number;
  markerRadius: number;
  /** Label every nth value tick — narrow charts cannot fit them all. */
  valueLabelEvery: number;
  /** Time-axis ticks land on multiples of this many years. */
  yearTickStep: number;
};

export const CHART_GEOMETRY: Record<ChartVariant, ChartGeometry> = {
  narrow: {
    width: 360,
    height: 250,
    left: 44,
    top: 12,
    plotWidth: 360 - 44 - 10,
    plotHeight: 250 - 12 - 30,
    fontSize: 11,
    markerRadius: 4,
    valueLabelEvery: 2,
    yearTickStep: 20,
  },
  wide: {
    width: 720,
    height: 300,
    left: 56,
    top: 14,
    plotWidth: 720 - 56 - 14,
    plotHeight: 300 - 14 - 34,
    fontSize: 13,
    markerRadius: 4.5,
    valueLabelEvery: 1,
    yearTickStep: 10,
  },
};

/* -------------------------------------------------------------------- ticks */

/** The 1-2-2.5-5-10 ladder: a step a reader can do mental arithmetic in. */
function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const stepped = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return stepped * magnitude;
}

/** Round off the accumulated float error that `lo + i * step` picks up. */
function tidy(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * Ticks covering `[min, max]` on round numbers, roughly `target` of them. The
 * outermost ticks become the value domain, so the axis always ends on a
 * number the reader can name.
 */
export function niceTicks(min: number, max: number, target = 7): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (max === min) {
    const step = niceStep(Math.abs(max) || 1);
    return [tidy(min - step), tidy(min), tidy(min + step)];
  }
  const step = niceStep((max - min) / target);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = lo; value <= hi + step / 1e6; value += step) ticks.push(tidy(value));
  return ticks;
}

/**
 * Labels on the time axis. Short annual series label each year: using only
 * decade ticks for a 2019–2025 chart silently produces no labels at all.
 * Longer series retain the sparse decade-style ticks, while always naming
 * both ends of the published range.
 */
export function yearTicks(fromYear: number, toYear: number, step: number): number[] {
  if (toYear - fromYear <= 10) {
    return Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  }

  const ticks: number[] = [];
  for (let year = Math.ceil(fromYear / step) * step; year <= toYear; year += step) ticks.push(year);
  return [...new Set([fromYear, ...ticks, toYear])].sort((a, b) => a - b);
}

/* ------------------------------------------------------------- formatting */

export type SeriesUnit = SeriesReading['unit'];

const MINUS = '−';

function withSign(magnitude: string, negative: boolean): string {
  return negative ? `${MINUS}${magnitude}` : magnitude;
}

/** The exact value, for the data table: `1,441,000` · `2.10%`. */
export function formatValue(value: number, unit: SeriesUnit): string {
  if (unit === 'percent') return withSign(`${Math.abs(value).toFixed(2)}%`, value < 0);
  return withSign(Math.abs(value).toLocaleString('en-GB'), value < 0);
}

/** The compact value, for an axis tick: `1.5m` · `250k` · `0` · `2.5%`. */
export function formatTick(value: number, unit: SeriesUnit): string {
  if (unit === 'percent') {
    if (value === 0) return '0%';
    return withSign(`${tidy(Math.abs(value))}%`, value < 0);
  }
  const magnitude = Math.abs(value);
  if (magnitude === 0) return '0';
  if (magnitude >= 1_000_000) return withSign(`${tidy(magnitude / 1_000_000)}m`, value < 0);
  if (magnitude >= 1000) return withSign(`${tidy(magnitude / 1000)}k`, value < 0);
  return withSign(String(magnitude), value < 0);
}

/* ------------------------------------------------------------------ colour */

/**
 * Colour follows the entity, not its position in a list: a line called
 * "Immigration" gets the same slot in the absolute chart and the
 * share-of-population chart, so a reader learns the key once. Slots are
 * assigned in first-appearance order across the whole series and never
 * recycled. The shared palette carries eight slots, enough for substantive
 * breakdowns while keeping a line's colour stable across every reading.
 */
export function seriesSlots(series: Series): Map<string, number> {
  const slots = new Map<string, number>();
  for (const reading of series.readings) {
    for (const line of reading.lines) {
      if (!slots.has(line.name)) slots.set(line.name, slots.size + 1);
    }
  }
  return slots;
}

/** A second, non-colour cue once a chart has more than three lines. */
export function seriesStrokeDash(slot: number): string | undefined {
  return [undefined, undefined, undefined, undefined, '8 3', '4 2', '10 3 2 3', '2 3'][slot];
}

/* ------------------------------------------------------------------ layout */

export type PlottedPoint = { x: number; y: number; point: SeriesPoint };

export type PlottedLine = {
  name: string;
  slot: number;
  /** Contiguous stretches of the line, one per stretch between breaks. */
  runs: PlottedPoint[][];
  /** The segments that step across a break — drawn dashed, never as smooth line. */
  bridges: Array<[PlottedPoint, PlottedPoint]>;
  last: PlottedPoint;
};

export type ValueTick = { value: number; y: number; label: string | null };
export type TimeTick = { year: number; x: number; label: string };
export type BreakMark = { period: string; label: string; note: string; x: number };

export type ReadingLayout = {
  geometry: ChartGeometry;
  lines: PlottedLine[];
  valueTicks: ValueTick[];
  timeTicks: TimeTick[];
  breaks: BreakMark[];
  /** The y of value 0, when zero is inside the domain — the line a net series crosses. */
  zeroY: number | null;
};

/**
 * Cut a line where a break falls between two consecutive points. The two
 * points either side are still drawn, and still joined — but by a dashed
 * bridge rather than by the same solid stroke as the rest, so the reader can
 * see that the two ends of it were not measured the same way. Smoothing over
 * a definitional break is how a chart lies without any number being wrong.
 */
export function splitAtBreaks(
  points: PlottedPoint[],
  breakPeriods: string[]
): { runs: PlottedPoint[][]; bridges: Array<[PlottedPoint, PlottedPoint]> } {
  const runs: PlottedPoint[][] = [];
  const bridges: Array<[PlottedPoint, PlottedPoint]> = [];
  let run: PlottedPoint[] = [];

  for (const plotted of points) {
    if (run.length === 0) {
      run.push(plotted);
      continue;
    }
    const previous = run[run.length - 1];
    const crossed = breakPeriods.some(
      (period) =>
        comparePeriods(previous.point.period, period) < 0 &&
        comparePeriods(period, plotted.point.period) <= 0
    );
    if (crossed) {
      bridges.push([previous, plotted]);
      runs.push(run);
      run = [plotted];
    } else {
      run.push(plotted);
    }
  }
  if (run.length > 0) runs.push(run);
  return { runs, bridges };
}

export function layoutReading(
  series: Series,
  reading: SeriesReading,
  variant: ChartVariant
): ReadingLayout {
  const geometry = CHART_GEOMETRY[variant];
  const slots = seriesSlots(series);

  const values = reading.lines.flatMap((line: SeriesLine) => line.points.map((p) => p.value));
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const valueMin = ticks[0];
  const valueMax = ticks[ticks.length - 1];

  // The declared coverage, not the data, sets the time domain: the two are
  // equal by rule 14, and saying so here means the axis is drawn from the
  // promise the series makes about its source.
  const fromYear = periodToYear(series.coverage.from);
  const toYear = periodToYear(series.coverage.to);

  const x = (period: string) =>
    geometry.left +
    ((periodToYear(period) - fromYear) / (toYear - fromYear || 1)) * geometry.plotWidth;
  const y = (value: number) =>
    geometry.top +
    geometry.plotHeight -
    ((value - valueMin) / (valueMax - valueMin || 1)) * geometry.plotHeight;

  const breakPeriods = series.breaks.map((b) => b.period);

  const lines: PlottedLine[] = reading.lines.map((line) => {
    const plotted = line.points.map((point) => ({ x: x(point.period), y: y(point.value), point }));
    const { runs, bridges } = splitAtBreaks(plotted, breakPeriods);
    return {
      name: line.name,
      slot: slots.get(line.name) ?? 1,
      runs,
      bridges,
      last: plotted[plotted.length - 1],
    };
  });

  const zeroIndex = ticks.indexOf(0);
  // Keep zero labelled whichever ticks the narrow variant drops: it is the
  // line a net-migration series crosses, and an unlabelled one is a chart
  // that hides its own sign change.
  const labelOffset = zeroIndex >= 0 ? zeroIndex % geometry.valueLabelEvery : 0;

  return {
    geometry,
    lines,
    valueTicks: ticks.map((value, index) => ({
      value,
      y: y(value),
      label:
        index % geometry.valueLabelEvery === labelOffset ? formatTick(value, reading.unit) : null,
    })),
    timeTicks: yearTicks(periodYear(series.coverage.from), periodYear(series.coverage.to), geometry.yearTickStep).map(
      (year) => ({ year, x: x(String(year)), label: String(year) })
    ),
    breaks: series.breaks.map((gap) => ({ ...gap, x: x(gap.period) })),
    zeroY: valueMin <= 0 && valueMax >= 0 ? y(0) : null,
  };
}

/** An SVG `d` for a run of points — plain line segments, never a smoothing curve. */
export function pathFor(run: PlottedPoint[]): string {
  return run
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

/* ------------------------------------------------------------------- table */

export type TableColumn = { readingId: string; readingLabel: string; name: string; unit: SeriesUnit };
export type TableRow = { period: string; cells: Array<string | null> };

/**
 * The chart's numbers as one table, keyed on period, with a column per line
 * per reading. It is both the screen-reader alternative and the thing a
 * sceptical reader checks the line against — which is why it carries every
 * point, not a sample.
 */
export function seriesTable(series: Series): { columns: TableColumn[]; rows: TableRow[] } {
  const columns: TableColumn[] = series.readings.flatMap((reading) =>
    reading.lines.map((line) => ({
      readingId: reading.id,
      readingLabel: reading.label,
      name: line.name,
      unit: reading.unit,
    }))
  );

  const byPeriod = new Map<string, Array<string | null>>();
  const blank = () => columns.map(() => null);
  columns.forEach((column, index) => {
    const reading = series.readings.find((r) => r.id === column.readingId);
    const line = reading?.lines.find((l) => l.name === column.name);
    for (const point of line?.points ?? []) {
      const cells = byPeriod.get(point.period) ?? blank();
      cells[index] = formatValue(point.value, column.unit);
      byPeriod.set(point.period, cells);
    }
  });

  const rows = [...byPeriod.entries()]
    .sort(([a], [b]) => comparePeriods(a, b))
    .map(([period, cells]) => ({ period, cells }));

  return { columns, rows };
}
