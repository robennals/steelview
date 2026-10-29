'use client';

import { useState, type ReactNode } from 'react';
import { ReportFigure } from './figure';
import { formatValue } from './format';
import { cellValue, sortRows, type SortDirection, type TableCell } from './table-sort';
import type { SourceCredit, ValueFormat } from './types';

export type DataTableColumn = {
  key: string;
  label: string;
  /** A ValueFormat for numbers; 'text' (the default for string cells) prints the cell as given. */
  format?: ValueFormat | 'text';
  /** Defaults to right for numbers, left for text. */
  align?: 'left' | 'right';
  /** Mark the column that names each row (usually the first); its cells become row headers. */
  rowHeader?: boolean;
  /** Defaults to true. */
  sortable?: boolean;
};

export type { CitedCell, TableCell } from './table-sort';

export type DataTableRow = Record<string, TableCell>;

export type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Said above the table and read first by a screen reader: what one row is. */
  caption: string;
  /** Values of the row-header column to set in bold with an accent rule, e.g. ["United Kingdom"]. */
  highlight?: string[];
  defaultSort?: { key: string; direction: SortDirection };
  /** Rows taller than this scroll inside the figure with the header pinned. Defaults to 28rem. */
  maxHeight?: string;
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
};

/**
 * For when the table is the figure: many columns a reader will want to look
 * up rather than see as a shape. Headers sort (with `aria-sort`, so a
 * screen-reader user hears the current order), numbers are formatted the
 * same way as in every chart, the header stays pinned while the body
 * scrolls, and a wide table scrolls sideways on a phone instead of
 * squeezing its numbers onto two lines.
 *
 * The server renders the default order; sorting is a client enhancement.
 */
export function DataTable({
  columns,
  rows,
  caption,
  highlight = [],
  defaultSort,
  maxHeight = '28rem',
  id,
  title,
  description,
  sources,
  note,
  footer,
}: DataTableProps) {
  const [sort, setSort] = useState(defaultSort);
  const sorted = sort ? sortRows(rows, sort.key, sort.direction) : rows;
  const headerKey = (columns.find(c => c.rowHeader) ?? columns[0]).key;
  const highlighted = new Set(highlight);

  const isNumeric = (column: DataTableColumn) =>
    column.format !== 'text' && (column.format !== undefined || rows.some(row => typeof cellValue(row[column.key]) === 'number'));
  const alignOf = (column: DataTableColumn) => column.align ?? (isNumeric(column) ? 'right' : 'left');
  const cellText = (column: DataTableColumn, cited: TableCell) => {
    const cell = cellValue(cited);
    if (cell === null || cell === undefined || cell === '') return '—';
    if (typeof cell === 'number' && column.format !== 'text') {
      // Fixed decimals by default: in a column, "16" beside "26.9" misaligns the digits a reader compares.
      return formatValue(cell, { fixed: true, ...(column.format ?? { unit: 'number' }) });
    }
    return String(cell);
  };

  const onSort = (column: DataTableColumn) => {
    // Numbers start largest-first, which is the question a reader sorting
    // them usually has; text starts A–Z.
    const first: SortDirection = isNumeric(column) ? 'descending' : 'ascending';
    setSort(current =>
      current?.key === column.key ? { key: column.key, direction: current.direction === 'ascending' ? 'descending' : 'ascending' } : { key: column.key, direction: first },
    );
  };

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} className="sv-data">
      <div className="sv-data__scroll" style={{ maxHeight }} tabIndex={0} role="region" aria-label={caption}>
        <table className="sv-data__table">
          <caption className="sv-data__caption">{caption}</caption>
          <thead>
            <tr>
              {columns.map(column => {
                const active = sort?.key === column.key;
                const sortable = column.sortable !== false;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    data-align={alignOf(column)}
                    aria-sort={active ? sort.direction : sortable ? 'none' : undefined}
                  >
                    {sortable ? (
                      <button type="button" className="sv-data__sort" onClick={() => onSort(column)}>
                        {column.label}
                        <span className="sv-data__sort-mark" aria-hidden="true" data-active={active || undefined}>
                          {active ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={`${String(cellValue(row[headerKey]))}-${i}`} data-highlight={highlighted.has(String(cellValue(row[headerKey]))) || undefined}>
                {columns.map(column => {
                  const Cell = column.key === headerKey ? 'th' : 'td';
                  const cell = row[column.key];
                  return (
                    <Cell key={column.key} scope={Cell === 'th' ? 'row' : undefined} data-align={alignOf(column)}>
                      {cellText(column, cell)}
                      {cell !== null && typeof cell === 'object' && <Footnotes sources={cell.sources} />}
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="sv-report__empty">No rows to show.</p>}
    </ReportFigure>
  );
}

/** A cited cell's " [n]" links, one per source, each to its quoted reference. */
function Footnotes({ sources }: { sources: SourceCredit[] }) {
  return sources.map((source, i) => {
    const text = source.number ? `[${source.number}]` : source.label;
    return (
      <span key={`${source.label}-${i}`}>
        {' '}
        {source.href ? (
          <a className="sv-footnote" href={source.href} aria-label={`Source: ${source.label}${source.number ? ` [${source.number}]` : ''}`}>
            {text}
          </a>
        ) : (
          <span className="sv-footnote">{text}</span>
        )}
      </span>
    );
  });
}
