import type { ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { OTHER_KEY, compose, type CompositionCategory, type CompositionRowInput } from './composition';
import { ReportFigure } from './figure';
import { formatValue } from './format';
import { seriesColor } from './scale';
import type { SourceCredit, ValueFormat } from './types';

export type { CompositionCategory, CompositionRowInput } from './composition';

export type CompositionBarProps = {
  /** The parts, in the order they stack from the left. Order them the same way the text discusses them. */
  categories: CompositionCategory[];
  /** One bar per row — usually a date ("2011", "2021") or a population. */
  rows: CompositionRowInput[];
  /** Set when `values` are counts, to print them beside the shares. */
  showCounts?: boolean;
  /** How counts are written. Defaults to full counts: a compact "1.4m" can make two different totals look equal. */
  countFormat?: ValueFormat;
  /** Fold categories below this share (percent) in every row into one "Other" part. */
  otherThreshold?: number;
  otherLabel?: string;
  /** Header for the row column in the table view. Defaults to "Group". */
  rowLabel?: string;
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
};

/**
 * Small shares keep one decimal, always shown, so 1.7% and 1.5% do not both
 * print as "2%" and 9.0% sits beside 9.3% rather than reading as "9%".
 */
function formatShare(share: number) {
  return share < 10 ? `${share.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : formatValue(share, { unit: 'percent', decimals: 0 });
}

/**
 * How a whole divides into parts, compared across a few rows: each bar is
 * 100%, so a reader compares shares, not sizes. Labels sit inside a segment
 * only when it is wide enough to hold them; every part is named in the
 * legend and every share (and count) is in the table, so a thin segment is
 * never unlabelled — only labelled elsewhere.
 */
export function CompositionBar({
  categories,
  rows,
  showCounts = false,
  countFormat = { unit: 'count' },
  otherThreshold,
  otherLabel = 'Other',
  rowLabel = 'Group',
  id,
  title,
  description,
  sources,
  note,
}: CompositionBarProps) {
  const composed = compose(categories, rows, { otherThreshold, otherLabel });
  const color = (key: string) => (key === OTHER_KEY ? 'var(--ink-4)' : seriesColor(categories.findIndex(c => c.key === key) + 1));

  const graph = (
    <>
      <ul className="sv-chart__legend sv-data__legend">
        {composed.categories.map(category => (
          <li key={category.key} className="sv-chart__key sv-bars__key">
            <i className="sv-bars__swatch" style={{ background: color(category.key) }} aria-hidden="true" />
            <span className="sv-chart__key-name">{category.label}</span>
          </li>
        ))}
      </ul>
      <ol className="sv-composition__rows">
        {composed.rows.map(row => (
          <li key={row.label} className="sv-composition__row">
            <p className="sv-composition__head">
              <span className="sv-composition__label">{row.label}</span>
              {showCounts && <span className="sv-composition__total">{formatValue(row.total, countFormat)} total</span>}
            </p>
            {/* The text equivalent of the bar, in stacking order. */}
            <p className="sv-visually-hidden">
              {row.segments.map(s => `${s.label} ${formatShare(s.share)}`).join(', ')}
            </p>
            <div className="sv-composition__bar" aria-hidden="true">
              {row.segments.map(segment =>
                segment.share > 0 ? (
                  <span
                    key={segment.key}
                    className="sv-composition__segment"
                    data-fit={segment.share >= 28 ? 'large' : segment.share >= 12 ? 'medium' : segment.share >= 6 ? 'small' : undefined}
                    style={{ width: `${segment.share}%`, background: color(segment.key) }}
                  >
                    <span className="sv-composition__segment-name">{segment.label} </span>
                    <span className="sv-composition__segment-share">{formatShare(segment.share)}</span>
                  </span>
                ) : null,
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );

  const table = (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{title ?? 'Composition'}: share of each {rowLabel.toLowerCase()} total{showCounts ? ', with counts' : ''}</caption>
        <thead>
          <tr>
            <th scope="col" className="sv-data__th-text">{rowLabel}</th>
            {composed.categories.map(category => <th key={category.key} scope="col">{category.label}</th>)}
            {showCounts && <th scope="col">Total</th>}
          </tr>
        </thead>
        <tbody>
          {composed.rows.map(row => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.segments.map(segment => (
                <td key={segment.key}>
                  {segment.share.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                  {showCounts && <span className="sv-composition__count"> ({formatValue(segment.value, countFormat)})</span>}
                </td>
              ))}
              {showCounts && <td>{formatValue(row.total, countFormat)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} className="sv-composition">
      <ChartViewToggle label={title ?? 'Composition'} graph={graph} table={table} />
    </ReportFigure>
  );
}
