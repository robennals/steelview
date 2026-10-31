import type { ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { barScale, qualifiedSpan } from './bar-layout';
import { BarLegend, BarQualificationKey, BarRows, type BarRowData, type BarSegment } from './bar-rows';
import { ReportFigure } from './figure';
import { extentValues, pointValue, qualificationsIn, qualifiedLabel, qualifiedText, type FigureNumber } from './qualified';
import { seriesColor } from './scale';
import type { FigurePreview, SourceCredit, ValueFormat } from './types';

/** One measure every row gives: "2020", "Winning margin". */
export type PairedBarSeries = { key: string; label: string };

export type PairedBarItem = {
  label: string;
  /** Series key → value; `null` (or missing) where the source publishes no figure, which prints "—" and draws nothing. */
  values: Record<string, FigureNumber | null>;
  /** A dumbbell end's own label by series key, when the measures' dates differ by row: `{ earlier: '1958', latest: '1964' }`. */
  labels?: Record<string, string>;
  /** Set in bold: the row the text is about. Its bars keep their series colours, which carry the key. */
  highlight?: boolean;
  /** What the one-line label leaves out: shown when the row is opened, and in the table. */
  detail?: string;
};

export type PairedBarChartProps = {
  /** Two or more measures in the same unit, in the order they are drawn and keyed. A dumbbell takes exactly two. */
  series: PairedBarSeries[];
  items: PairedBarItem[];
  /** 'paired' draws a bar per measure, one under another (default); 'dumbbell' a dot per measure, joined by a line. */
  style?: 'paired' | 'dumbbell';
  format?: ValueFormat;
  /** What the bars measure, shown above them: "Hours to count 95% of the vote". */
  valueLabel: string;
  /** Header of the label column in the table view. Defaults to "Category". */
  categoryLabel?: string;
  /** 'none' keeps the given order (default); 'value' ranks by the first measure, largest first. */
  sort?: 'none' | 'value';
  /** Extend the axis to at least this value, e.g. 100 for shares. */
  domainMax?: number;
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
   * Draw the compact preview: the linked title, the series key and every
   * row with each measure's figure; over six rows the rows are clamped thin.
   * The axis, the key to qualification marks and the Table view stay on the
   * full figure.
   */
  preview?: FigurePreview;
};

/**
 * Two or more measures per row, side by side — the same states in 2020 and
 * 2024, or a winning margin beside the ballots ruled invalid — so the reader
 * compares each pair directly.
 *
 * Never stacked: a stack reads as parts of a total, and two years or a
 * margin and a count are not parts of anything. Every bar starts at zero,
 * as in BarChart. Paired bars keep their series apart by fill pattern as
 * well as colour, a dumbbell by its dots' shape (ring and disc), and every
 * figure is printed on its own line after its series' mark and again in
 * the table, which has one column per measure.
 */
export function PairedBarChart({
  series,
  items,
  style = 'paired',
  format,
  valueLabel,
  categoryLabel = 'Category',
  sort = 'none',
  domainMax,
  id,
  title,
  description,
  sources,
  note,
  footer,
  panel,
  preview,
}: PairedBarChartProps) {
  const first = series[0].key;
  const valueOf = (item: PairedBarItem, key: string) => item.values[key] ?? null;
  const ranked = (item: PairedBarItem) => {
    const value = valueOf(item, first);
    return value === null ? -Infinity : pointValue(value);
  };
  const ordered = sort === 'value' ? [...items].sort((a, b) => ranked(b) - ranked(a)) : items;
  const allValues = ordered.flatMap(item => series.flatMap(s => {
    const value = valueOf(item, s.key);
    return value === null ? [] : [value];
  }));
  const scale = barScale(allValues.flatMap(extentValues), domainMax);
  const layout = style === 'dumbbell' ? 'dumbbell' : 'grouped';
  const hasDetail = items.some(item => item.detail);

  const rows: BarRowData[] = ordered.map((item, i) => {
    const segments = series.flatMap((s, slot): BarSegment[] => {
      const value = valueOf(item, s.key);
      const mark = { slot: slot + 1, color: seriesColor(slot + 1), name: s.label };
      // A paired row keeps a place for a missing bar, so each measure stays on its own line; a dumbbell simply has one dot.
      if (value === null) return style === 'dumbbell' ? [] : [{ left: scale.zero, width: 0, ...mark }];
      return [{ ...qualifiedSpan(value, scale), ...mark }];
    });
    return {
      key: `${item.label}-${i}`,
      label: item.label,
      valueText: '',
      values: series.map((s, slot) => {
        const value = valueOf(item, s.key);
        return { name: s.label, slot: slot + 1, text: value === null ? '—' : qualifiedLabel(value, format), label: item.labels?.[s.key] };
      }),
      highlight: item.highlight,
      segments,
      detail: item.detail,
    };
  });

  const cell = (item: PairedBarItem, key: string) => {
    const value = valueOf(item, key);
    if (value === null) return '—';
    const label = item.labels?.[key];
    return label ? `${qualifiedText(value, format)} (${label})` : qualifiedText(value, format);
  };

  const legend = <BarLegend mark={style === 'dumbbell' ? 'dot' : 'swatch'} items={series.map((s, slot) => ({ key: s.key, label: s.label, color: seriesColor(slot + 1), slot: slot + 1 }))} />;

  if (preview) {
    return (
      <ReportFigure id={id} title={title} preview={preview} className="sv-bar-chart">
        {legend}
        <BarRows rows={rows} scale={scale} format={format} layout={layout} label={valueLabel} preview />
      </ReportFigure>
    );
  }

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-bar-chart">
      <p className="sv-chart__axis-label">{valueLabel}</p>
      <ChartViewToggle
        label={title ?? valueLabel}
        graph={
          <>
            {legend}
            <BarQualificationKey qualifications={qualificationsIn(allValues)} layout={layout} />
            <BarRows rows={rows} scale={scale} format={format} layout={layout} label={valueLabel} />
          </>
        }
        table={
          <div className="sv-chart__table-scroll">
            <table className="sv-chart__table">
              <caption>{title ? `${title}: ${valueLabel}` : valueLabel}</caption>
              <thead>
                <tr>
                  <th scope="col" className="sv-data__th-text">{categoryLabel}</th>
                  {series.map(s => <th key={s.key} scope="col">{s.label}</th>)}
                  {hasDetail && <th scope="col" className="sv-data__th-text">Detail</th>}
                </tr>
              </thead>
              <tbody>
                {ordered.map((item, i) => (
                  <tr key={`${item.label}-${i}`} data-highlight={item.highlight || undefined}>
                    <th scope="row">{item.label}</th>
                    {series.map(s => <td key={s.key}>{cell(item, s.key)}</td>)}
                    {hasDetail && <td className="sv-data__td-text sv-data__td-long">{item.detail ?? '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </ReportFigure>
  );
}
