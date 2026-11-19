import type { ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { compose, compositionColor, type CompositionCategory, type CompositionRow, type CompositionRowInput, type CompositionSegment } from './composition';
import { ReportFigure, SourceCredits } from './figure';
import { formatValue } from './format';
import { qualifiedLabel, qualifiedText } from './qualified';
import { COMPACT_PREVIEW_ITEMS, DENSE_PREVIEW_ITEMS } from './ranked-columns';
import { DetailRow, RowDetailHint } from './row-detail';
import type { FigurePreview, SourceCredit, ValueFormat } from './types';

export type { CompositionCategory, CompositionRowInput } from './composition';

export type CompositionBarProps = {
  /**
   * `percent`: the values are the source's own percentages, and labels print
   * them as published (33.3% stays 33.3%, not a recomputed 33.4%). Otherwise
   * labels show each part's computed share of the row.
   */
  unit?: 'percent' | 'count';
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
  /** A short line under the title: the period, cases or source (see ReportFigure). */
  subtitle?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  /** Draw the compact preview: the linked title, the key and every bar; row sources stay on the full figure. */
  preview?: FigurePreview;
};

/**
 * Small shares keep one decimal, always shown, so 1.7% and 1.5% do not both
 * print as "2%" and 9.0% sits beside 9.3% rather than reading as "9%".
 */
function formatShare(share: number): string {
  return share < 10 ? `${share.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : formatValue(share, { unit: 'percent', decimals: 0 });
}

/**
 * How a whole divides into parts, compared across a few rows. Bars of counts
 * share one scale, so a bar's length is its row's total and two bars of the
 * same length stand for the same amount; bars of percentages are each 100%
 * and so all the same length. Labels sit inside a segment
 * only when it is wide enough to hold them; every part is named in the
 * legend and every share (and count) is in the table, so a thin segment is
 * never unlabelled — only labelled elsewhere.
 */
export function CompositionBar({
  categories,
  rows,
  unit,
  showCounts = false,
  countFormat = { unit: 'count' },
  otherThreshold,
  otherLabel = 'Other',
  rowLabel = 'Group',
  id,
  title,
  subtitle,
  description,
  sources,
  note,
  footer,
  panel,
  preview,
}: CompositionBarProps) {
  const composed = compose(categories, rows, { otherThreshold, otherLabel, unit });
  // Up to four places, so a published 12.25% is not rounded to 12.3%.
  const published = { unit: 'percent', decimals: 4 } as const;
  const shareLabel = (segment: CompositionSegment) =>
    unit === 'percent' && segment.published !== undefined ? qualifiedLabel(segment.published, published) : formatShare(segment.share);
  const shareText = (segment: CompositionSegment) =>
    unit === 'percent' && segment.published !== undefined
      ? qualifiedText(segment.published, published)
      : `${segment.share.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const color = (key: string) => compositionColor(categories, key);
  const totalText = (total: number) => formatValue(total, countFormat);
  const countText = (segment: CompositionSegment) => (segment.published === undefined ? formatValue(segment.value, countFormat) : qualifiedText(segment.published, countFormat));
  // Drawn to scale, a small row's parts can be too thin to see, so on the
  // full chart each row opens to show its own split at full width.
  const opens = !preview && composed.rows.some(row => row.length < 100);

  /** A row's bar, `length` percent of the width, each part labelled where it has room. */
  const bar = (row: CompositionRow, length: number) => (
    <div className="sv-composition__bar" style={{ width: `${length}%` }} aria-hidden="true">
      {row.segments.map(segment => {
        // Room for a label depends on the segment's width on the page, not its share of a short bar.
        const width = (segment.share * length) / 100;
        return segment.share > 0 ? (
          <span
            key={segment.key}
            className="sv-composition__segment"
            data-fit={width >= 28 ? 'large' : width >= 12 ? 'medium' : width >= 6 ? 'small' : undefined}
            style={{ width: `${segment.share}%`, background: color(segment.key) }}
          >
            <span className="sv-composition__segment-name">{segment.label} </span>
            <span className="sv-composition__segment-share">{shareLabel(segment)}</span>
          </span>
        ) : null;
      })}
    </div>
  );

  /**
   * A row's name, total and bar to scale, with the bar's words for a screen
   * reader. A row that opens carries its sources in what it opens to, since
   * a link inside the clickable summary cannot be reached reliably.
   */
  const rowSummary = (row: CompositionRow, withSources: boolean) => (
    <>
      <p className="sv-composition__head">
        <span className="sv-composition__label">
          {row.label}
          {row.sources && withSources && <SourceCredits sources={row.sources} />}
        </span>
        {showCounts && <span className="sv-composition__total">{totalText(row.total)}<span className="sv-composition__total-word"> total</span></span>}
      </p>
      {/* The text equivalent of the bar, in stacking order. */}
      <p className="sv-visually-hidden">
        {row.segments.map(s => `${s.label} ${shareLabel(s)}`).join(', ')}
      </p>
      {bar(row, row.length)}
    </>
  );

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
      {opens && <RowDetailHint />}
      <ol
        className="sv-composition__rows"
        data-compact={(preview && composed.rows.length > COMPACT_PREVIEW_ITEMS) || undefined}
        data-dense={(preview && composed.rows.length > DENSE_PREVIEW_ITEMS) || undefined}
        style={showCounts ? { '--sv-composition-total': `${Math.max(...composed.rows.map(row => totalText(row.total).length)) + 1}ch` } : undefined}
      >
        {composed.rows.map(row => (
          <li key={row.label} className="sv-composition__row" data-row={row.label}>
            {opens ? (
              <DetailRow rowClass="sv-composition__summary" summary={rowSummary(row, false)}>
                {/* The row on its own, at full width, so a thin part can be seen and counted. */}
                <p className="sv-composition__detail-caption">{row.label}: each part&rsquo;s share of {showCounts ? `its ${totalText(row.total)}` : 'the row'}</p>
                {bar(row, 100)}
                <ul className="sv-composition__detail-parts">
                  {/* Parts this row has none of are left out; the table lists every part. */}
                  {row.segments.filter(segment => segment.value > 0).map(segment => (
                    <li key={segment.key}>
                      <i className="sv-bars__swatch" style={{ background: color(segment.key) }} aria-hidden="true" />
                      {segment.label}: {shareText(segment)}{showCounts && ` (${countText(segment)})`}
                    </li>
                  ))}
                </ul>
                {row.sources && <p className="sv-composition__detail-sources">Source: <SourceCredits sources={row.sources} /></p>}
              </DetailRow>
            ) : rowSummary(row, !preview)}
          </li>
        ))}
      </ol>
    </>
  );

  if (preview) return <ReportFigure id={id} title={title} subtitle={subtitle} preview={preview} className="sv-composition">{graph}</ReportFigure>;

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
              <th scope="row">
                {row.label}
                {row.sources && <SourceCredits sources={row.sources} />}
              </th>
              {row.segments.map(segment => (
                <td key={segment.key}>
                  {shareText(segment)}
                  {showCounts && <span className="sv-composition__count"> ({countText(segment)})</span>}
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
    <ReportFigure id={id} title={title} subtitle={subtitle} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-composition">
      <ChartViewToggle label={title ?? 'Composition'} graph={graph} table={table} />
    </ReportFigure>
  );
}
