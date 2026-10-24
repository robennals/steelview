import { compareDates, dateToYear } from './format';
import { linearScale, niceTicks } from './scale';
import type { PartialDate } from './types';

export type PanelPoint = { period: PartialDate; value: number };
export type PanelInput = { name: string; points: PanelPoint[] };

export type PanelLayout = {
  name: string;
  /** Polyline in a 0–100 × 0–100 box (y down), drawn with a stretched viewBox. */
  path: string;
  /** Percent coordinates of the latest point, for an HTML end marker that does not stretch. */
  last: { x: number; y: number; point: PanelPoint } | null;
  ticks: Array<{ value: number; y: number }>;
};

/**
 * Lays out every panel on one shared x range, and by default one shared y
 * scale. Shared is the default because the point of small multiples is
 * comparison: with independent scales a line rising from 5k to 20k looks
 * identical to one rising from 50k to 200k.
 */
export function layoutPanels(
  panels: PanelInput[],
  { independentScales = false, zeroBased = true }: { independentScales?: boolean; zeroBased?: boolean } = {},
): { panels: PanelLayout[]; periods: PartialDate[] } {
  const allPoints = panels.flatMap(panel => panel.points);
  const years = allPoints.map(point => dateToYear(point.period));
  const xScale = linearScale([Math.min(...years), Math.max(...years)], [0, 100]);

  const yTicks = (values: number[]) => {
    if (values.length === 0) return [0, 1];
    const min = zeroBased ? Math.min(0, ...values) : Math.min(...values);
    const max = zeroBased ? Math.max(0, ...values) : Math.max(...values);
    return niceTicks(min, max, 3);
  };
  const shared = yTicks(allPoints.map(point => point.value));

  const periods = [...new Set(allPoints.map(point => point.period))].sort(compareDates);

  return {
    periods,
    panels: panels.map(panel => {
      const ticks = independentScales ? yTicks(panel.points.map(point => point.value)) : shared;
      const yScale = linearScale([ticks[0], ticks[ticks.length - 1]], [100, 0]);
      const points = [...panel.points].sort((a, b) => compareDates(a.period, b.period));
      const coords = points.map(point => ({ x: xScale(dateToYear(point.period)), y: yScale(point.value), point }));
      return {
        name: panel.name,
        path: coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${round(c.x)} ${round(c.y)}`).join(' '),
        last: coords.at(-1) ?? null,
        ticks: ticks.map(value => ({ value, y: yScale(value) })),
      };
    }),
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
