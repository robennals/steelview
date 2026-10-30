import { comparePeriods, normalizePeriod, periodToYear, periodYear } from '@/lib/content/period';
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

/**
 * A series can also be drawn at preview size, for a carousel slide or a
 * walkthrough step, sized so its type stays readable there rather than
 * shrinking a full-size chart into the space. A preview is drawn at several
 * shapes, from very wide to nearly square, and the page shows whichever best
 * fills the space it has, so the chart is never squeezed into a band.
 */
export type PreviewVariant = 'preview-wide' | 'preview' | 'preview-medium' | 'preview-tall';
export type SeriesVariant = ChartVariant | PreviewVariant;

/** Every preview shape, widest first. */
export const PREVIEW_VARIANTS: PreviewVariant[] = ['preview-wide', 'preview', 'preview-medium', 'preview-tall'];

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
  /** In a focus window shorter than three years, a tick every this many months. */
  monthTickStep: number;
};

/** A preview's geometry at a given size, with the same insets and type size at every shape. */
const previewGeometry = (width: number, height: number): ChartGeometry => ({
  width,
  height,
  left: 48,
  top: 10,
  plotWidth: width - 48 - 24,
  plotHeight: height - 10 - 26,
  fontSize: 12,
  markerRadius: 4,
  valueLabelEvery: 1,
  yearTickStep: 10,
  monthTickStep: 2,
});

export const CHART_GEOMETRY: Record<SeriesVariant, ChartGeometry> = {
  'preview-wide': previewGeometry(760, 190),
  preview: previewGeometry(600, 190),
  'preview-medium': previewGeometry(600, 300),
  'preview-tall': previewGeometry(520, 390),
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
    monthTickStep: 3,
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
    monthTickStep: 1,
  },
};

/**
 * The small strip of the full range drawn above a focus window. Same left
 * inset and plot width as the main plot at each size, so a year on the strip
 * sits over the same column as on the plot below it.
 */
export type ContextGeometry = Pick<ChartGeometry, 'width' | 'height' | 'left' | 'top' | 'plotWidth' | 'plotHeight' | 'fontSize'>;

export const CONTEXT_GEOMETRY: Record<ChartVariant, ContextGeometry> = {
  narrow: { width: 360, height: 56, left: 44, top: 6, plotWidth: 306, plotHeight: 32, fontSize: 10 },
  wide: { width: 720, height: 64, left: 56, top: 6, plotWidth: 650, plotHeight: 38, fontSize: 11 },
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

/** About 0.6em per digit in the sans tick face, plus a gap. */
export function tickLabelWidth(label: string, fontSize: number): number {
  return label.length * fontSize * 0.6 + 6;
}

/**
 * Drop interior ticks too close to either end tick to fit their labels. The
 * ends are always kept: they name the published range. A 1950–2026 axis at
 * 390px otherwise prints "2020" over "2026".
 */
export function dropCrowdedTicks<T extends { x: number; label: string }>(ticks: T[], fontSize: number): T[] {
  if (ticks.length <= 2) return ticks;
  const first = ticks[0];
  const last = ticks[ticks.length - 1];
  const fits = (a: T, b: T) =>
    Math.abs(a.x - b.x) >= (tickLabelWidth(a.label, fontSize) + tickLabelWidth(b.label, fontSize)) / 2;
  return ticks.filter((tick, index) => index === 0 || index === ticks.length - 1 || (fits(tick, first) && fits(tick, last)));
}

const MONTH_NAMES = new Set([
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]);

/**
 * Lower-case only the first letter, so a label can follow "by" mid-sentence:
 * "Year of NCSL count" → "year of NCSL count". Leaves the label as written
 * when its first word is an acronym (two or more capitals: "EAVS cycle") or
 * a month ("November general election").
 */
export function midSentence(label: string): string {
  const firstWord = label.split(/\s/, 1)[0];
  if ((firstWord.match(/[A-Z]/g) ?? []).length >= 2 || MONTH_NAMES.has(firstWord)) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

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

/**
 * How a stretch of line is drawn. `estimate` covers estimates and
 * provisional values alike — both are dotted; only the table tells them apart.
 */
export type RunKind = 'measured' | 'estimate' | 'forecast';

export type PlottedRun = { kind: RunKind; points: PlottedPoint[] };

export type PlottedLine = {
  name: string;
  slot: number;
  /** Contiguous stretches of the line, split at breaks and wherever the drawing changes kind. */
  runs: PlottedRun[];
  /** The segments that step across a break — drawn dashed, never as smooth line. */
  bridges: Array<[PlottedPoint, PlottedPoint]>;
  /** Estimate and provisional points, drawn as hollow circles when the reading is sparse enough to mark points. */
  hollow: PlottedPoint[];
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
  /** Where the forecast zone starts: the first forecast period on any line. It runs to the plot's right edge. */
  forecastX: number | null;
  /** The "not measured since" band, from the last point to where the band ends. */
  unmeasured: { x0: number; x1: number } | null;
};

/** Hollow markers are drawn only when a reading is sparse enough that points read as points. */
export const HOLLOW_MARKER_LIMIT = 120;

export function runKind(point: SeriesPoint): RunKind {
  if (point.status === 'forecast') return 'forecast';
  return point.status ? 'estimate' : 'measured';
}

const KIND_RANK: Record<RunKind, number> = { measured: 0, estimate: 1, forecast: 2 };

/**
 * Cut a line into runs, at definitional breaks and wherever its drawing
 * changes.
 *
 * At a break the two points either side are still drawn, and still joined —
 * but by a dashed bridge rather than by the same solid stroke as the rest, so
 * the reader can see that the two ends of it were not measured the same way.
 * Smoothing over a definitional break is how a chart lies without any number
 * being wrong.
 *
 * Within a stretch, a segment takes the weaker of its two ends' kinds — a
 * segment touching an estimate is dotted, one touching a forecast is a
 * forecast — so runs of different kinds share their joining point and the
 * line stays unbroken.
 */
export function splitRuns(
  points: PlottedPoint[],
  breakPeriods: string[]
): { runs: PlottedRun[]; bridges: Array<[PlottedPoint, PlottedPoint]> } {
  const runs: PlottedRun[] = [];
  const bridges: Array<[PlottedPoint, PlottedPoint]> = [];
  let run: PlottedRun | null = null;

  for (const plotted of points) {
    if (run === null) {
      run = { kind: runKind(plotted.point), points: [plotted] };
      continue;
    }
    const previous: PlottedPoint = run.points[run.points.length - 1];
    const crossed = breakPeriods.some(
      (period) =>
        comparePeriods(previous.point.period, period) < 0 &&
        comparePeriods(period, plotted.point.period) <= 0
    );
    if (crossed) {
      bridges.push([previous, plotted]);
      runs.push(run);
      run = { kind: runKind(plotted.point), points: [plotted] };
      continue;
    }
    const a = runKind(previous.point);
    const b = runKind(plotted.point);
    const kind = KIND_RANK[a] >= KIND_RANK[b] ? a : b;
    // A run's first segment decides its kind.
    if (run.points.length === 1) run.kind = kind;
    if (run.kind === kind) {
      run.points.push(plotted);
    } else {
      runs.push(run);
      run = { kind, points: [previous, plotted] };
    }
  }
  if (run !== null) runs.push(run);
  return { runs, bridges };
}

/**
 * Where the time axis ends: the series coverage, or the end of a "not
 * measured since" band. The loader fills the band's `until` from the topic's
 * `lastUpdated` when the author leaves it out.
 */
export function axisEnd(series: Series): string {
  const until = series.notMeasuredSince?.until;
  return until !== undefined && comparePeriods(until, series.coverage.to) > 0 ? until : series.coverage.to;
}

export type UnmeasuredSpan = { from: string; until: string; label: string; note: string; source: number };

/** The "not measured since" band as dates, or undefined when the series has none (or it has no length). */
export function unmeasuredSpan(series: Series): UnmeasuredSpan | undefined {
  const band = series.notMeasuredSince;
  const until = axisEnd(series);
  if (!band || until === series.coverage.to) return undefined;
  return { from: series.coverage.to, until, label: band.label, note: band.note, source: band.source };
}

/* ------------------------------------------------------------ focus window */

export type FocusWindow = { from: string; to: string };

/** The period a series' `focus` draws at readable scale, or null when it has none. */
export function focusWindow(series: Series): FocusWindow | null {
  return series.focus ? { from: series.focus.from, to: series.focus.to ?? series.coverage.to } : null;
}

/** Whether `period` falls inside `[from, to]`, with a year- or month-precision end running to its own end. */
export function periodWithin(period: string, { from, to }: FocusWindow): boolean {
  return comparePeriods(period, from) >= 0 && (comparePeriods(period, to) <= 0 || period.startsWith(to));
}

/**
 * The points of a line inside the window, plus the nearest point either
 * side, so the line runs in from the plot's edges (clipped there) rather
 * than starting at the first in-window value as if nothing came before.
 */
export function pointsAround(points: SeriesPoint[], window: FocusWindow): SeriesPoint[] {
  const first = points.findIndex((p) => comparePeriods(p.period, window.from) >= 0);
  if (first < 0) return points.slice(-1);
  let last = first;
  while (last + 1 < points.length && periodWithin(points[last + 1].period, window)) last += 1;
  return points.slice(Math.max(0, first - 1), Math.min(points.length, last + 2));
}

/**
 * Thin a dense line to what a plot `columns` pixels wide can show: the first
 * and last points, and the lowest and highest point in each pixel column, in
 * order. Keeping both extremes of every column is what lets a one-day spike
 * survive; an average or every-nth sample would sand it off.
 */
export function decimate(points: SeriesPoint[], columns: number): SeriesPoint[] {
  if (points.length <= 2 || columns < 1) return points;
  const t0 = periodToYear(points[0].period);
  const span = periodToYear(points[points.length - 1].period) - t0 || 1;
  const keep = new Set<number>([0, points.length - 1]);
  let column = -1;
  let low = 0;
  let high = 0;
  points.forEach((point, index) => {
    const c = Math.min(columns - 1, Math.floor(((periodToYear(point.period) - t0) / span) * columns));
    if (c !== column) {
      if (column >= 0) keep.add(low).add(high);
      column = c;
      low = index;
      high = index;
      return;
    }
    if (point.value < points[low].value) low = index;
    if (point.value > points[high].value) high = index;
  });
  keep.add(low).add(high);
  return [...keep].sort((a, b) => a - b).map((index) => points[index]);
}

/** Decimate only when a line has more than twice as many points as the plot is wide. */
function thinned(points: SeriesPoint[], plotWidth: number): SeriesPoint[] {
  return points.length > 2 * plotWidth ? decimate(points, Math.round(plotWidth)) : points;
}

const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Time ticks for a focus window: whole years when it spans three years or
 * more; otherwise the first of every `monthTickStep`th month (every month
 * wide, Jan/Apr/Jul/Oct narrow), naming the year on the first tick and on
 * every January.
 */
export function windowTicks(
  window: FocusWindow,
  geometry: ChartGeometry,
  x: (period: string) => number
): TimeTick[] {
  const from = periodToYear(window.from);
  const to = periodToYear(window.to);
  if (to - from >= 3) {
    return yearTicks(Math.ceil(from), Math.floor(to), geometry.yearTickStep).map((year) => ({ year, x: x(String(year)), label: String(year) }));
  }
  const ticks: TimeTick[] = [];
  const [startYear, startMonth] = normalizePeriod(window.from).split('-').map(Number);
  for (let index = startYear * 12 + startMonth - 1; ; index += 1) {
    const year = Math.floor(index / 12);
    const month = index % 12;
    const period = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (periodToYear(period) < from) continue;
    if (periodToYear(period) > to) break;
    if (month % geometry.monthTickStep !== 0) continue;
    const named = ticks.length === 0 || month === 0;
    ticks.push({ year: periodToYear(period), x: x(period), label: named ? `${MONTH_ABBREVIATIONS[month]} ${year}` : MONTH_ABBREVIATIONS[month] });
  }
  return ticks;
}

/**
 * Lay out one reading's plot. With a `window`, the x domain is the window and
 * the y domain is fitted to the values inside it (plus the nearest point
 * either side); the caller clips the lines at the plot edges. Without one,
 * the domain is the full published range and a dense line is decimated.
 */
export function layoutReading(
  series: Series,
  reading: SeriesReading,
  variant: SeriesVariant,
  window?: FocusWindow
): ReadingLayout {
  const geometry = CHART_GEOMETRY[variant];
  const slots = seriesSlots(series);

  const shown = reading.lines.map((line: SeriesLine) =>
    window ? pointsAround(line.points, window) : thinned(line.points, geometry.plotWidth)
  );
  const values = shown.flatMap((points) => points.map((p) => p.value));
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const valueMin = ticks[0];
  const valueMax = ticks[ticks.length - 1];

  // The declared coverage, not the data, sets the time domain: the two are
  // equal by rule 14, and saying so here means the axis is drawn from the
  // promise the series makes about its source. A "not measured since" band
  // extends it to the band's end, so the gap has room to be seen.
  const end = window ? window.to : axisEnd(series);
  // A monthly series under three years long gets month ticks too: year ticks
  // would label a one-year series "2026" and nothing else.
  const shortMonthly = !window && series.coverage.from.includes('-') && periodToYear(end) - periodToYear(series.coverage.from) < 3;
  const start = window ? window.from : series.coverage.from;
  const fromYear = periodToYear(start);
  const toYear = periodToYear(end);

  const x = (period: string) =>
    geometry.left +
    ((periodToYear(period) - fromYear) / (toYear - fromYear || 1)) * geometry.plotWidth;
  const y = (value: number) =>
    geometry.top +
    geometry.plotHeight -
    ((value - valueMin) / (valueMax - valueMin || 1)) * geometry.plotHeight;

  const breakPeriods = series.breaks.map((b) => b.period);
  const markPoints = shown.reduce((n, points) => n + points.length, 0) <= HOLLOW_MARKER_LIMIT;

  const lines: PlottedLine[] = reading.lines.map((line, index) => {
    const plotted = shown[index].map((point) => ({ x: x(point.period), y: y(point.value), point }));
    const { runs, bridges } = splitRuns(plotted, breakPeriods);
    return {
      name: line.name,
      slot: slots.get(line.name) ?? 1,
      runs,
      bridges,
      hollow: markPoints ? plotted.filter((p) => runKind(p.point) === 'estimate') : [],
      last: plotted[plotted.length - 1],
    };
  });

  const forecastXs = lines.flatMap((line) => {
    const first = line.runs.flatMap((run) => run.points).find((p) => p.point.status === 'forecast');
    return first ? [first.x] : [];
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
    timeTicks: dropCrowdedTicks(
      window || shortMonthly
        ? windowTicks(window ?? { from: series.coverage.from, to: end }, geometry, x)
        : yearTicks(periodYear(series.coverage.from), periodYear(end), geometry.yearTickStep).map(
            (year) => ({ year, x: x(String(year)), label: String(year) })
          ),
      geometry.fontSize
    ),
    breaks: series.breaks
      .filter((gap) => !window || periodWithin(gap.period, window))
      .map((gap) => ({ ...gap, x: x(gap.period) })),
    zeroY: valueMin <= 0 && valueMax >= 0 ? y(0) : null,
    // A forecast that starts before the window starts at the window's edge.
    forecastX: forecastXs.length > 0 ? Math.max(geometry.left, Math.min(...forecastXs)) : null,
    // The window lies inside the coverage, so a band past it is only drawn on the full range.
    unmeasured: window || end === series.coverage.to ? null : { x0: x(series.coverage.to), x1: x(end) },
  };
}

export type ContextLayout = {
  geometry: ContextGeometry;
  lines: Array<{ name: string; slot: number; points: PlottedPoint[] }>;
  timeTicks: TimeTick[];
  /** Breaks, drawn as short ticks on the strip's baseline. */
  breaks: number[];
  /** The focus window, outlined on the strip. */
  window: { x0: number; x1: number };
};

/**
 * The context strip above a focus window: every line over the full range,
 * decimated, with year ticks and the window marked. No value labels — the
 * strip says where the window sits, the plot below says what it shows.
 */
export function layoutContext(
  series: Series,
  reading: SeriesReading,
  variant: ChartVariant,
  window: FocusWindow
): ContextLayout {
  const geometry = CONTEXT_GEOMETRY[variant];
  const slots = seriesSlots(series);
  const shown = reading.lines.map((line) => thinned(line.points, geometry.plotWidth));
  const values = shown.flatMap((points) => points.map((p) => p.value));
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const end = axisEnd(series);
  const fromYear = periodToYear(series.coverage.from);
  const toYear = periodToYear(end);
  const x = (period: string) =>
    geometry.left + ((periodToYear(period) - fromYear) / (toYear - fromYear || 1)) * geometry.plotWidth;
  const y = (value: number) =>
    geometry.top + geometry.plotHeight - ((value - ticks[0]) / (ticks[ticks.length - 1] - ticks[0] || 1)) * geometry.plotHeight;
  return {
    geometry,
    lines: reading.lines.map((line, index) => ({
      name: line.name,
      slot: slots.get(line.name) ?? 1,
      points: shown[index].map((point) => ({ x: x(point.period), y: y(point.value), point })),
    })),
    timeTicks: dropCrowdedTicks(
      yearTicks(periodYear(series.coverage.from), periodYear(end), CHART_GEOMETRY[variant].yearTickStep).map(
        (year) => ({ year, x: x(String(year)), label: String(year) })
      ),
      geometry.fontSize
    ),
    breaks: series.breaks.map((gap) => x(gap.period)),
    window: { x0: x(window.from), x1: x(window.to) },
  };
}

/** An SVG `d` for a run of points — plain line segments, never a smoothing curve. */
export function pathFor(run: PlottedPoint[]): string {
  return run
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

/* --------------------------------------------------------- per-line range */

/** The range a line's source publishes: its own coverage, else the series'. */
export function lineSpan(series: Series, line: SeriesLine): { from: string; to: string } {
  return line.coverage ?? series.coverage;
}

/** Whether any line in the series declares a range of its own that differs from the series. */
export function hasOwnSpans(series: Series): boolean {
  return series.readings.some(reading => reading.lines.some(line => {
    const span = lineSpan(series, line);
    return comparePeriods(span.from, series.coverage.from) !== 0 || comparePeriods(span.to, series.coverage.to) !== 0;
  }));
}

/* ------------------------------------------------------------------- table */

/** A table cell: the point, a period outside the line's own range, or no value published. */
export type ReadingCell = SeriesPoint | 'outside' | null;

/**
 * One reading's table: a row for every period any line has, in order. Lines
 * that start or end at different dates would lose the earlier years if the
 * rows came from one line only; outside a line's own range the cell says so,
 * rather than looking like a value the source left out.
 */
export function readingRows(series: Series, reading: SeriesReading): Array<{ period: string; cells: ReadingCell[] }> {
  const periods = [...new Set(reading.lines.flatMap(line => line.points.map(point => point.period)))].sort(comparePeriods);
  const byLine = reading.lines.map(line => new Map(line.points.map(point => [point.period, point])));
  return periods.map(period => ({
    period,
    cells: reading.lines.map((line, index) => {
      const span = lineSpan(series, line);
      if (comparePeriods(period, span.from) < 0 || comparePeriods(period, span.to) > 0) return 'outside';
      return byLine[index].get(period) ?? null;
    }),
  }));
}

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
