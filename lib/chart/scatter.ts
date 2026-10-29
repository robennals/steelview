import { CHART_GEOMETRY, dropCrowdedTicks, niceTicks, type ChartGeometry, type ChartVariant } from './series-chart';

/**
 * Everything about a labelled scatter plot that is arithmetic rather than
 * markup: the two value scales, tick positions, and where each point's label
 * goes. Pure, so it is tested without a renderer and the two size variants
 * provably share one pair of scales.
 *
 * Same widths and left/right insets as the series chart, so a scatter plot
 * stacked under a time series lines up with it; taller, because both axes
 * carry data.
 */

export type ScatterGeometry = ChartGeometry & {
  pointRadius: number;
  /** Font size of the point labels, in viewBox units. */
  labelSize: number;
};

export const SCATTER_GEOMETRY: Record<ChartVariant, ScatterGeometry> = {
  narrow: { ...CHART_GEOMETRY.narrow, height: 300, plotHeight: 300 - 12 - 30, pointRadius: 4, labelSize: 10 },
  wide: { ...CHART_GEOMETRY.wide, height: 420, plotHeight: 420 - 14 - 34, pointRadius: 5, labelSize: 12 },
};

export type ScatterScaleOptions = {
  /** Fix the axis ends exactly. Ticks are the round numbers inside it. */
  domain?: [number, number];
  /** Defaults to true: a scatter of rates from zero shows how far apart they really are. */
  includeZero?: boolean;
};

export type ScatterScale = { ticks: number[]; domain: [number, number] };

/**
 * Round ticks covering the values (and zero, unless `includeZero: false`);
 * the outermost ticks become the domain, so each axis ends on a number the
 * reader can name. An explicit `domain` is used as given.
 */
export function scatterScale(values: number[], { domain, includeZero = true }: ScatterScaleOptions = {}): ScatterScale {
  if (domain) {
    const [lo, hi] = domain;
    const slack = (hi - lo) * 1e-9;
    return { ticks: niceTicks(lo, hi).filter(tick => tick >= lo - slack && tick <= hi + slack), domain };
  }
  let lo = values.length > 0 ? Math.min(...values) : 0;
  let hi = values.length > 0 ? Math.max(...values) : 0;
  if (includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  const ticks = niceTicks(lo, hi);
  return { ticks, domain: [ticks[0], ticks[ticks.length - 1]] };
}

/* --------------------------------------------------------------- labels */

export type Box = { x: number; y: number; width: number; height: number };

export type LabelPosition = 'right' | 'left' | 'above' | 'below' | 'above-right' | 'above-left' | 'below-right' | 'below-left';

/** In the order they are tried. */
export const LABEL_POSITIONS: LabelPosition[] = ['right', 'left', 'above', 'below', 'above-right', 'above-left', 'below-right', 'below-left'];

export type LabelInput = { id: string; label: string; cx: number; cy: number; highlight?: boolean };

export type PlacedLabel = {
  id: string;
  /** Where the text is drawn: `x` is its anchor point, `y` its vertical centre. */
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  position: LabelPosition;
  box: Box;
  /** No position was free: the least-overlapping one was taken, and the label is drawn with a paper halo. */
  crowded: boolean;
};

/** About 0.6em per character in the sans face — the same estimate the axis ticks use. */
export function labelBox(label: string, labelSize: number): { width: number; height: number } {
  return { width: label.length * 0.6 * labelSize, height: labelSize };
}

/** The gap between a point's edge and its label. */
const LABEL_GAP = 3;

function candidate(point: LabelInput, position: LabelPosition, geometry: ScatterGeometry): Omit<PlacedLabel, 'id' | 'crowded'> {
  const { width, height } = labelBox(point.label, geometry.labelSize);
  const d = geometry.pointRadius + LABEL_GAP;
  // Diagonals sit on the corner of the point's square, so they clear it
  // without drifting as far away as the straight positions.
  const dd = d * 0.75;
  const { cx, cy } = point;
  const boxes: Record<LabelPosition, [number, number]> = {
    right: [cx + d, cy - height / 2],
    left: [cx - d - width, cy - height / 2],
    above: [cx - width / 2, cy - d - height],
    below: [cx - width / 2, cy + d],
    'above-right': [cx + dd, cy - dd - height],
    'above-left': [cx - dd - width, cy - dd - height],
    'below-right': [cx + dd, cy + dd],
    'below-left': [cx - dd - width, cy + dd],
  };
  const [x, y] = boxes[position];
  const box = { x, y, width, height };
  const anchor = position === 'above' || position === 'below' ? 'middle' : position.endsWith('left') ? 'end' : 'start';
  return { position, box, anchor, ...textPoint(box, anchor) };
}

function textPoint(box: Box, anchor: PlacedLabel['anchor']) {
  const x = anchor === 'start' ? box.x : anchor === 'end' ? box.x + box.width : box.x + box.width / 2;
  return { x, y: box.y + box.height / 2 };
}

function overlap(a: Box, b: Box): number {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

function plotBox(geometry: ScatterGeometry): Box {
  return { x: geometry.left, y: geometry.top, width: geometry.plotWidth, height: geometry.plotHeight };
}

function inside(box: Box, plot: Box): boolean {
  return box.x >= plot.x && box.y >= plot.y && box.x + box.width <= plot.x + plot.width && box.y + box.height <= plot.y + plot.height;
}

/** Shift a box the least distance that puts it inside the plot. */
function clampInto(box: Box, plot: Box): Box {
  return {
    ...box,
    x: Math.min(Math.max(box.x, plot.x), plot.x + plot.width - box.width),
    y: Math.min(Math.max(box.y, plot.y), plot.y + plot.height - box.height),
  };
}

/**
 * A label for every point, beside it and clear of the others. Each point
 * tries right, left, above, below, then the four diagonals, and takes the
 * first that stays inside the plot and touches no placed label and no other
 * point. Highlighted points choose first, then the rest from left to right,
 * so the result is the same on every render. A point with no free position
 * takes the least-overlapping one inside the plot and comes back `crowded`.
 *
 * Returned in the order the points were given.
 */
export function placeLabels(points: LabelInput[], geometry: ScatterGeometry): PlacedLabel[] {
  const plot = plotBox(geometry);
  const r = geometry.pointRadius;
  const pointBoxes = new Map(points.map(point => [point.id, { x: point.cx - r, y: point.cy - r, width: 2 * r, height: 2 * r }]));
  const order = [...points].sort((a, b) =>
    Number(Boolean(b.highlight)) - Number(Boolean(a.highlight)) || a.cx - b.cx || a.id.localeCompare(b.id),
  );
  const placed = new Map<string, PlacedLabel>();

  for (const point of order) {
    const others = [...pointBoxes].filter(([id]) => id !== point.id).map(([, box]) => box);
    const cost = (box: Box) =>
      [...placed.values()].reduce((sum, label) => sum + overlap(box, label.box), 0) + others.reduce((sum, other) => sum + overlap(box, other), 0);
    const candidates = LABEL_POSITIONS.map(position => candidate(point, position, geometry));
    const free = candidates.find(c => inside(c.box, plot) && cost(c.box) === 0);
    if (free) {
      placed.set(point.id, { id: point.id, ...free, crowded: false });
      continue;
    }
    const fitting = candidates.filter(c => inside(c.box, plot));
    const pool = fitting.length > 0
      ? fitting
      : candidates.map(c => {
          const box = clampInto(c.box, plot);
          return { ...c, box, ...textPoint(box, c.anchor) };
        });
    // Stable minimum: the earliest position wins a tie.
    const best = pool.reduce((a, b) => (cost(b.box) < cost(a.box) ? b : a));
    placed.set(point.id, { id: point.id, ...best, crowded: true });
  }

  return points.map(point => {
    const label = placed.get(point.id);
    if (!label) throw new Error(`No label placed for ${point.id}`);
    return label;
  });
}

/* --------------------------------------------------------------- layout */

export type ScatterLayoutPoint = { id: string; cx: number; cy: number; label: PlacedLabel };

export type ScatterLayout = {
  geometry: ScatterGeometry;
  xScale: ScatterScale;
  yScale: ScatterScale;
  /** Gridline positions for every tick; labels already thinned where they would collide. */
  xTicks: Array<{ value: number; x: number; label: string | null }>;
  yTicks: Array<{ value: number; y: number; label: string | null }>;
  /** Where zero falls, when it is inside the plot rather than on its edge. */
  xZero: number | null;
  yZero: number | null;
  points: ScatterLayoutPoint[];
};

export type ScatterLayoutAxis = ScatterScaleOptions & { format: (value: number) => string };

/**
 * Both scales come from the data alone, so the narrow and wide variants
 * share them; only positions, label thinning and label placement differ.
 */
export function layoutScatter(
  points: Array<{ id: string; label: string; x: number; y: number; highlight?: boolean }>,
  axes: { x: ScatterLayoutAxis; y: ScatterLayoutAxis },
  variant: ChartVariant,
): ScatterLayout {
  const geometry = SCATTER_GEOMETRY[variant];
  const xScale = scatterScale(points.map(point => point.x), axes.x);
  const yScale = scatterScale(points.map(point => point.y), axes.y);
  const [x0, x1] = xScale.domain;
  const [y0, y1] = yScale.domain;
  const toX = (value: number) => geometry.left + ((value - x0) / (x1 - x0 || 1)) * geometry.plotWidth;
  const toY = (value: number) => geometry.top + geometry.plotHeight - ((value - y0) / (y1 - y0 || 1)) * geometry.plotHeight;

  const xLabelled = new Set(dropCrowdedTicks(xScale.ticks.map(value => ({ value, x: toX(value), label: axes.x.format(value) })), geometry.fontSize).map(tick => tick.value));
  // Keep zero labelled whichever ticks the narrow variant drops, as the series chart does.
  const zeroIndex = yScale.ticks.indexOf(0);
  const labelOffset = zeroIndex >= 0 ? zeroIndex % geometry.valueLabelEvery : 0;

  const plotted = points.map(point => ({ ...point, cx: toX(point.x), cy: toY(point.y) }));
  const labels = placeLabels(plotted, geometry);

  return {
    geometry,
    xScale,
    yScale,
    xTicks: xScale.ticks.map(value => ({ value, x: toX(value), label: xLabelled.has(value) ? axes.x.format(value) : null })),
    yTicks: yScale.ticks.map((value, index) => ({
      value,
      y: toY(value),
      label: index % geometry.valueLabelEvery === labelOffset ? axes.y.format(value) : null,
    })),
    xZero: x0 < 0 && x1 > 0 ? toX(0) : null,
    yZero: y0 < 0 && y1 > 0 ? toY(0) : null,
    points: plotted.map((point, i) => ({ id: point.id, cx: point.cx, cy: point.cy, label: labels[i] })),
  };
}
