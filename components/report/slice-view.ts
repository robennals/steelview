import { barScale, barSpan, stackExtent, stackSpans, type BarScale } from './bar-layout';
import type { BarLayout, BarRowData } from './bar-rows';
import { formatValue } from './format';
import { seriesColor } from './scale';
import { appliedFilters, dimensionValues, slice, statusLine, type SliceAggregation, type SliceDimension, type SliceFilters, type SliceResult, type SliceRow } from './slice';
import type { ValueFormat } from './types';

/**
 * One cut of a SliceExplorer's data as bars: what the explorer draws for the
 * reader's current choices, and — from its default choices — what its
 * home-page preview and thumbnail draw. Free of React and of client state,
 * so the server-rendered thumbnail and the explorer cannot disagree.
 */

export type SliceMeasure = {
  key: string;
  /** "Long-term immigrants". */
  label: string;
  format?: ValueFormat;
  /** How rows that fall in the same bar combine. 'sum' for counts, 'mean' for rates. Defaults to 'sum'. */
  aggregation?: SliceAggregation;
};

/** The "Split by" choice that splits nothing. */
export const NO_SPLIT = '__none';

/** The reader's choices: what the bars are, what splits them, which measure, and which rows. */
export type SliceChoices = {
  breakdownKey: string;
  splitKey: string;
  measureKey: string;
  filters: Record<string, string[]>;
  /** The one value shown of each dimension that may not be combined. */
  picks: Record<string, string>;
};

/** The explorer's opening choices: its defaults, else the first dimension, no split and the first measure. */
export function defaultChoices({ dimensions, measures, defaultBreakdown, defaultSplit, defaultMeasure, defaultFilters = {} }: {
  dimensions: SliceDimension[];
  measures: SliceMeasure[];
  defaultBreakdown?: string;
  defaultSplit?: string;
  defaultMeasure?: string;
  defaultFilters?: Record<string, string[]>;
}): SliceChoices {
  return { breakdownKey: defaultBreakdown ?? dimensions[0].key, splitKey: defaultSplit ?? NO_SPLIT, measureKey: defaultMeasure ?? measures[0].key, filters: defaultFilters, picks: {} };
}

export type SliceView = {
  breakdown: SliceDimension;
  split?: SliceDimension;
  /** The filters in force, including the one value held of each dimension that may not be combined. */
  applied: SliceFilters;
  measure: SliceMeasure;
  aggregation: SliceAggregation;
  layout: Extract<BarLayout, 'single' | 'stacked' | 'grouped'>;
  result: SliceResult;
  scale: BarScale;
  barRows: BarRowData[];
  /** The split values in the order they are keyed, each with its colour and slot. */
  splitKeys: Array<{ key: string; color: string; slot: number }>;
  /** What is shown and what has been added together: "Showing 3 of 3 parties · Roll call: House…". */
  status: string;
};

export function sliceView(
  { rows, dimensions, measures, splitLayout = 'stacked' }: { rows: SliceRow[]; dimensions: SliceDimension[]; measures: SliceMeasure[]; splitLayout?: 'stacked' | 'grouped' },
  { breakdownKey, splitKey, measureKey, filters, picks }: SliceChoices,
): SliceView {
  const breakdown = dimensions.find(d => d.key === breakdownKey) ?? dimensions[0];
  const splitCandidate = splitKey !== NO_SPLIT && splitKey !== breakdown.key ? dimensions.find(d => d.key === splitKey) : undefined;
  const split = splitCandidate?.combinable === false ? undefined : splitCandidate;
  const applied = appliedFilters(rows, dimensions, breakdown, filters, picks);
  const measure = measures.find(m => m.key === measureKey) ?? measures[0];
  const aggregation = measure.aggregation ?? 'sum';
  // Stacking means is meaningless — two averages do not add up to a third.
  const layout = !split ? 'single' : aggregation === 'mean' ? 'grouped' : splitLayout;

  const result = slice({ rows, breakdown, split, measure: measure.key, aggregation, filters: applied });
  const allSplitValues = split ? dimensionValues(rows, split) : [];
  const splitSlot = (key: string) => allSplitValues.indexOf(key) + 1;
  const splitColor = (key: string) => seriesColor(splitSlot(key));

  const domainValues = result.groups.flatMap(group =>
    layout === 'stacked' ? stackExtent(group.parts) : layout === 'grouped' ? group.parts.filter((v): v is number => v !== null) : [group.total ?? 0],
  );
  const scale = barScale(domainValues);

  const barRows: BarRowData[] = result.groups.map(group => {
    let segments: BarRowData['segments'];
    if (layout === 'single') segments = [barSpan(group.total ?? 0, scale)];
    else if (layout === 'stacked')
      segments = stackSpans(group.parts, scale).map((span, i) => ({ ...(span ?? { left: 0, width: 0 }), color: splitColor(result.splitKeys[i]), slot: splitSlot(result.splitKeys[i]) }));
    else segments = group.parts.map((value, i) => ({ ...barSpan(value ?? 0, scale), color: splitColor(result.splitKeys[i]), slot: splitSlot(result.splitKeys[i]) }));
    return { key: group.key, label: group.key, valueText: group.total === null ? '—' : formatValue(group.total, measure.format), segments };
  });

  return {
    breakdown,
    split,
    applied,
    measure,
    aggregation,
    layout,
    result,
    scale,
    barRows,
    splitKeys: result.splitKeys.map(key => ({ key, color: splitColor(key), slot: splitSlot(key) })),
    status: statusLine({ rows, dimensions, breakdown, split, filters: applied, shown: result.groups.length, aggregation }),
  };
}
