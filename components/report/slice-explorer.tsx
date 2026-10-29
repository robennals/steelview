'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { barScale, barSpan, stackExtent, stackSpans } from './bar-layout';
import { BarLegend, BarRows, type BarRowData } from './bar-rows';
import { ChoiceGroup, FilterChips } from './controls';
import { ReportFigure } from './figure';
import { formatValue } from './format';
import { seriesColor } from './scale';
import { dimensionValues, pluralOf, slice, statusLine, type SliceAggregation, type SliceDimension, type SliceRow } from './slice';
import type { SourceCredit, ValueFormat } from './types';

export type { SliceDimension, SliceRow } from './slice';


export type SliceMeasure = {
  key: string;
  /** "Long-term immigrants". */
  label: string;
  format?: ValueFormat;
  /** How rows that fall in the same bar combine. 'sum' for counts, 'mean' for rates. Defaults to 'sum'. */
  aggregation?: SliceAggregation;
};

export type SliceExplorerProps = {
  /** Tidy data: one row per combination of dimension values, measures as number columns. */
  rows: SliceRow[];
  dimensions: SliceDimension[];
  measures: SliceMeasure[];
  defaultBreakdown?: string;
  /** A second dimension to stack or group within each bar. */
  defaultSplit?: string;
  defaultMeasure?: string;
  /** Initial filter selections by dimension key; missing or empty means "all". */
  defaultFilters?: Record<string, string[]>;
  /** Offer the "Split by" control. Defaults to true when there are two or more dimensions. */
  allowSplit?: boolean;
  /** How split values are drawn: stacked into one bar (default) or side by side. Mean measures are always side by side. */
  splitLayout?: 'stacked' | 'grouped';
  /** Above this many values a dimension's filter becomes a compact select instead of chips. Defaults to 8. */
  chipLimit?: number;
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
};

const NONE = '__none';

/**
 * A reader-driven breakdown of one dataset: pick what the bars are ("Break
 * down by"), narrow the rows ("Filter"), and optionally split each bar by a
 * second dimension. It exists so a report can hand the reader the whole
 * table instead of the one cut that suits the argument — while the status
 * line always says what is being shown and what has been added together, so
 * a filtered view never passes for the whole picture.
 *
 * The default state is a complete, ordinary bar chart, rendered on the
 * server; the controls only change which cut is shown.
 */
export function SliceExplorer({
  rows,
  dimensions,
  measures,
  defaultBreakdown,
  defaultSplit,
  defaultMeasure,
  defaultFilters = {},
  allowSplit = dimensions.length >= 2,
  splitLayout = 'stacked',
  chipLimit = 8,
  id,
  title,
  description,
  sources,
  note,
}: SliceExplorerProps) {
  const [breakdownKey, setBreakdownKey] = useState(defaultBreakdown ?? dimensions[0].key);
  const [splitKey, setSplitKey] = useState(defaultSplit ?? NONE);
  const [measureKey, setMeasureKey] = useState(defaultMeasure ?? measures[0].key);
  const [filters, setFilters] = useState<Record<string, string[]>>(defaultFilters);
  const statusId = useId();

  const breakdown = dimensions.find(d => d.key === breakdownKey) ?? dimensions[0];
  const split = splitKey !== NONE && splitKey !== breakdown.key ? dimensions.find(d => d.key === splitKey) : undefined;
  const measure = measures.find(m => m.key === measureKey) ?? measures[0];
  const aggregation = measure.aggregation ?? 'sum';
  // Stacking means is meaningless — two averages do not add up to a third.
  const layout = !split ? 'single' : aggregation === 'mean' ? 'grouped' : splitLayout;

  const result = slice({ rows, breakdown, split, measure: measure.key, aggregation, filters });
  const allSplitValues = split ? dimensionValues(rows, split) : [];
  const splitColor = (key: string) => seriesColor(allSplitValues.indexOf(key) + 1);

  const domainValues = result.groups.flatMap(group =>
    layout === 'stacked' ? stackExtent(group.parts) : layout === 'grouped' ? group.parts.filter((v): v is number => v !== null) : [group.total ?? 0],
  );
  const scale = barScale(domainValues);
  const format = measure.format;

  const barRows: BarRowData[] = result.groups.map(group => {
    let segments: BarRowData['segments'];
    if (layout === 'single') segments = [barSpan(group.total ?? 0, scale)];
    else if (layout === 'stacked')
      segments = stackSpans(group.parts, scale).map((span, i) => ({ ...(span ?? { left: 0, width: 0 }), color: splitColor(result.splitKeys[i]) }));
    else segments = group.parts.map((value, i) => ({ ...barSpan(value ?? 0, scale), color: splitColor(result.splitKeys[i]) }));
    return { key: group.key, label: group.key, valueText: group.total === null ? '—' : formatValue(group.total, format), segments };
  });

  const status = statusLine({ rows, dimensions, breakdown, split, filters, shown: result.groups.length, aggregation });

  const setFilter = (key: string, values: string[]) => setFilters(current => ({ ...current, [key]: values }));
  const valueOrDash = (value: number | null) => (value === null ? '—' : formatValue(value, format));

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} className="sv-slice">
      <div className="sv-slice__controls">
        {dimensions.length > 1 && (
          <ChoiceGroup
            label="Break down by"
            value={breakdown.key}
            choices={dimensions.map(d => ({ value: d.key, label: d.label }))}
            onChange={key => {
              setBreakdownKey(key);
              if (key === splitKey) setSplitKey(NONE);
            }}
          />
        )}
        {allowSplit && dimensions.length > 1 && (
          <ChoiceGroup
            label="Split by"
            value={split ? split.key : NONE}
            choices={[{ value: NONE, label: 'None' }, ...dimensions.filter(d => d.key !== breakdown.key).map(d => ({ value: d.key, label: d.label }))]}
            onChange={setSplitKey}
          />
        )}
        {measures.length > 1 && (
          <ChoiceGroup label="Measure" value={measure.key} choices={measures.map(m => ({ value: m.key, label: m.label }))} onChange={setMeasureKey} />
        )}
        <fieldset className="sv-slice__filters">
          <legend className="sv-slice__filters-legend">Filter</legend>
          {dimensions.map(dimension => {
            const values = dimensionValues(rows, dimension);
            const selected = filters[dimension.key] ?? [];
            return values.length > chipLimit ? (
              <FilterSelect key={dimension.key} dimension={dimension} values={values} selected={selected} onChange={next => setFilter(dimension.key, next)} />
            ) : (
              <FilterChips
                key={dimension.key}
                label={dimension.label}
                choices={values.map(value => ({ value, label: value }))}
                selected={new Set(selected)}
                onChange={next => setFilter(dimension.key, [...next])}
              />
            );
          })}
        </fieldset>
      </div>

      <p className="sv-control__status" id={statusId} aria-live="polite">{status}</p>
      <p className="sv-chart__axis-label">{measure.label}</p>

      {result.groups.length === 0 ? (
        <p className="sv-report__empty">No rows match these filters. Clear a filter to see data.</p>
      ) : (
        <ChartViewToggle
          label={title ?? measure.label}
          graph={
            <>
              {split && <BarLegend items={result.splitKeys.map(key => ({ key, label: key, color: splitColor(key) }))} />}
              <BarRows rows={barRows} scale={scale} format={format} layout={layout} label={`${measure.label} by ${breakdown.label.toLowerCase()}`} />
            </>
          }
          table={
            <div className="sv-chart__table-scroll">
              <table className="sv-chart__table" aria-describedby={statusId}>
                <caption>
                  {measure.label} by {breakdown.label.toLowerCase()}
                  {split ? ` and ${split.label.toLowerCase()}` : ''}
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="sv-data__th-text">{breakdown.label}</th>
                    {split ? result.splitKeys.map(key => <th key={key} scope="col">{key}</th>) : null}
                    <th scope="col">{split ? (aggregation === 'mean' ? 'All' : 'Total') : measure.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.groups.map(group => (
                    <tr key={group.key}>
                      <th scope="row">{group.key}</th>
                      {group.parts.map((value, i) => <td key={result.splitKeys[i]}>{valueOrDash(value)}</td>)}
                      <td>{valueOrDash(group.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}
    </ReportFigure>
  );
}

/** A single-choice filter for dimensions with too many values for a row of chips. */
function FilterSelect({
  dimension,
  values,
  selected,
  onChange,
}: {
  dimension: SliceDimension;
  values: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const id = useId();
  return (
    <div className="sv-control">
      <label className="sv-control__label" htmlFor={id}>{dimension.label}</label>
      <select
        id={id}
        className="sv-control__search sv-slice__select"
        value={selected.length === 1 ? selected[0] : ''}
        onChange={event => onChange(event.target.value ? [event.target.value] : [])}
      >
        <option value="">All {pluralOf(dimension)}</option>
        {values.map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
  );
}
