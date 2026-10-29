'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { BarLegend, BarRows } from './bar-rows';
import { ChoiceGroup, FilterChips } from './controls';
import { ReportFigure } from './figure';
import { formatValue } from './format';
import { dimensionValues, pluralOf, type SliceDimension, type SliceRow } from './slice';
import { NO_SPLIT, defaultChoices, sliceView, type SliceMeasure } from './slice-view';
import type { FigurePreview, SourceCredit } from './types';

export type { SliceDimension, SliceRow } from './slice';
export type { SliceMeasure } from './slice-view';

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
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  /**
   * Draw the compact preview: the linked title, the opening cut's status line
   * — what is shown and what is added together — its key and every bar. The
   * controls, the Table view and the list of all rows stay on the full figure.
   */
  preview?: FigurePreview;
};

/**
 * A reader-driven breakdown of one dataset: pick what the bars are ("Break
 * down by"), narrow the rows ("Filter"), and optionally split each bar by a
 * second dimension. It exists so a report can hand the reader the whole
 * table instead of the one cut that suits the argument — while the status
 * line always says what is being shown and what has been added together, so
 * a filtered view never passes for the whole picture.
 *
 * The default state is a complete, ordinary bar chart, rendered on the
 * server; the controls only change which cut is shown. Every row of the
 * data is also listed under "All N rows", so the whole table can be read
 * without JavaScript and without trusting any cut.
 *
 * A dimension marked `combinable: false` (separate roll calls, separate
 * polls) is never added together: unless the bars are its values, the
 * reader picks one of them, and it is never offered to split by.
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
  footer,
  panel,
  preview,
}: SliceExplorerProps) {
  const opening = defaultChoices({ dimensions, measures, defaultBreakdown, defaultSplit, defaultMeasure, defaultFilters });
  const [breakdownKey, setBreakdownKey] = useState(opening.breakdownKey);
  const [splitKey, setSplitKey] = useState(opening.splitKey);
  const [measureKey, setMeasureKey] = useState(opening.measureKey);
  const [filters, setFilters] = useState<Record<string, string[]>>(opening.filters);
  const [picks, setPicks] = useState<Record<string, string>>(opening.picks);
  const statusId = useId();

  const { breakdown, split, applied, measure, aggregation, layout, result, scale, barRows, splitKeys, status } = sliceView(
    { rows, dimensions, measures, splitLayout },
    { breakdownKey, splitKey, measureKey, filters, picks },
  );
  const format = measure.format;
  const legend = split && <BarLegend items={splitKeys.map(({ key, color, slot }) => ({ key, label: key, color, slot }))} />;
  const bars = (compact: boolean) => <BarRows rows={barRows} scale={scale} format={format} layout={layout} label={`${measure.label} by ${breakdown.label.toLowerCase()}`} preview={compact} />;

  if (preview) {
    return (
      <ReportFigure id={id} title={title} preview={preview} className="sv-slice">
        <p className="sv-control__status">{status}</p>
        {legend}
        {result.groups.length > 0 && bars(true)}
      </ReportFigure>
    );
  }

  const setFilter = (key: string, values: string[]) => setFilters(current => ({ ...current, [key]: values }));
  const valueOrDash = (value: number | null) => (value === null ? '—' : formatValue(value, format));

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-slice">
      <div className="sv-slice__controls">
        {dimensions.length > 1 && (
          <ChoiceGroup
            label="Break down by"
            value={breakdown.key}
            choices={dimensions.map(d => ({ value: d.key, label: d.label }))}
            onChange={key => {
              setBreakdownKey(key);
              if (key === splitKey) setSplitKey(NO_SPLIT);
            }}
          />
        )}
        {allowSplit && dimensions.length > 1 && (
          <ChoiceGroup
            label="Split by"
            value={split ? split.key : NO_SPLIT}
            choices={[{ value: NO_SPLIT, label: 'None' }, ...dimensions.filter(d => d.key !== breakdown.key && d.combinable !== false).map(d => ({ value: d.key, label: d.label }))]}
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
            if (dimension.combinable === false && dimension.key !== breakdown.key) {
              const picked = applied[dimension.key]?.[0] ?? values[0];
              const pick = (value: string) => setPicks(current => ({ ...current, [dimension.key]: value }));
              return values.length > chipLimit ? (
                <FilterSelect key={dimension.key} dimension={dimension} values={values} selected={[picked]} onChange={next => pick(next[0])} allowAll={false} />
              ) : (
                <ChoiceGroup key={dimension.key} label={dimension.label} value={picked} choices={values.map(value => ({ value, label: value }))} onChange={pick} />
              );
            }
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
              {legend}
              {bars(false)}
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
      <AllRows rows={rows} dimensions={dimensions} measures={measures} />
    </ReportFigure>
  );
}

/** The whole tidy table, collapsed: every row as published, whatever cut the chart shows. */
function AllRows({ rows, dimensions, measures }: { rows: SliceRow[]; dimensions: SliceDimension[]; measures: SliceMeasure[] }) {
  return (
    <details className="sv-chart__data sv-slice__all-rows">
      <summary className="sv-chart__data-summary">All {rows.length} rows of the data</summary>
      <div className="sv-chart__table-scroll">
        <table className="sv-chart__table">
          <caption>Every row, as published</caption>
          <thead>
            <tr>
              {dimensions.map(d => <th key={d.key} scope="col" className="sv-data__th-text">{d.label}</th>)}
              {measures.map(m => <th key={m.key} scope="col">{m.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {dimensions.map(d => <td key={d.key} className="sv-data__td-text">{row[d.key] ?? '—'}</td>)}
                {measures.map(m => {
                  const value = row[m.key];
                  return <td key={m.key}>{typeof value === 'number' ? formatValue(value, m.format) : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** A single-choice filter for dimensions with too many values for a row of chips. */
function FilterSelect({
  dimension,
  values,
  selected,
  onChange,
  allowAll = true,
}: {
  dimension: SliceDimension;
  values: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  /** Offer "All …"; off for a dimension whose values may not be combined. */
  allowAll?: boolean;
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
        {allowAll && <option value="">All {pluralOf(dimension)}</option>}
        {values.map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
  );
}
