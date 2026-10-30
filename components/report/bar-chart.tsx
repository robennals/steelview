import type { ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { barScale, barSpan, orderBars } from './bar-layout';
import { BarRows } from './bar-rows';
import { ReportFigure } from './figure';
import { formatValue } from './format';
import { RankedColumns, fitsRankedColumns } from './ranked-columns';
import type { FigurePreview, SourceCredit, ValueFormat } from './types';

export type BarChartItem = {
  label: string;
  value: number;
  /** Drawn in the accent and set in bold — for the one row the text is about (usually the UK). */
  highlight?: boolean;
};

export type BarChartProps = {
  items: BarChartItem[];
  format?: ValueFormat;
  /** What the bars measure, shown above them: "Applicants per 10,000 residents". */
  valueLabel: string;
  /** Header of the label column in the table view. Defaults to "Category". */
  categoryLabel?: string;
  /** 'value' ranks largest first (default); 'none' keeps the given order, for ordered categories such as age bands. */
  sort?: 'value' | 'none';
  /** Extend the axis to at least this value, e.g. 100 for shares, so two charts side by side share a scale. */
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
   * Draw the compact preview: the linked title and the bars, every item. Over
   * six items the rows are clamped thin; over twelve, with no negatives and
   * at most one highlight, one ranked column per item.
   */
  preview?: FigurePreview;
};

/**
 * One measure across categories as ranked horizontal bars — the default
 * figure for "how does the UK compare". Bars start at zero (a truncated bar
 * turns a small gap into a large one), negative values extend left of a
 * marked zero line, and every value is printed beside its bar and again in
 * the table view, so nothing has to be read off the axis.
 */
export function BarChart({
  items,
  format,
  valueLabel,
  categoryLabel = 'Category',
  sort = 'value',
  domainMax,
  id,
  title,
  description,
  sources,
  note,
  footer,
  panel,
  preview,
}: BarChartProps) {
  const ordered = orderBars(items, sort);
  const scale = barScale(ordered.map(item => item.value), domainMax);
  const rows = ordered.map((item, i) => ({
    key: `${item.label}-${i}`,
    label: item.label,
    valueText: formatValue(item.value, format),
    highlight: item.highlight,
    segments: [barSpan(item.value, scale)],
  }));

  if (preview) {
    const graph = fitsRankedColumns(items)
      ? <RankedColumns items={items} max={scale.domain[1]} format={value => formatValue(value, format)} />
      : <BarRows rows={rows} scale={scale} format={format} label={valueLabel} preview />;
    return <ReportFigure id={id} title={title} preview={preview} className="sv-bar-chart">{items.length > 0 && graph}</ReportFigure>;
  }

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-bar-chart">
      <p className="sv-chart__axis-label">{valueLabel}</p>
      {items.length === 0 ? (
        <p className="sv-report__empty">No values to show.</p>
      ) : (
        <ChartViewToggle
          label={title ?? valueLabel}
          graph={<BarRows rows={rows} scale={scale} format={format} label={valueLabel} />}
          table={
            <div className="sv-chart__table-scroll">
              <table className="sv-chart__table">
                <caption>{title ? `${title}: ${valueLabel}` : valueLabel}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="sv-data__th-text">{categoryLabel}</th>
                    <th scope="col">{valueLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((item, i) => (
                    <tr key={`${item.label}-${i}`} data-highlight={item.highlight || undefined}>
                      <th scope="row">{item.label}</th>
                      <td>{formatValue(item.value, format)}</td>
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
