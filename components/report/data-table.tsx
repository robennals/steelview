'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ReportFigure } from './figure';
import { cellText, cellValue, comparisonFor, sortRows, type SortDirection, type TableCell } from './table-sort';
import type { SourceCredit, ValueFormat } from './types';

export type DataTableColumn = {
  key: string;
  label: string;
  /**
   * A ValueFormat for numbers; 'text' (the default for string cells) prints
   * the cell as given; 'date' takes "2026", "2026-06" or "2026-06-12", prints
   * "2026", "Jun 2026", "12 Jun 2026" and sorts by date.
   */
  format?: ValueFormat | 'text' | 'date';
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
  /**
   * 'wide' lets the table run past the text column to the page width on a
   * wide screen. Defaults to 'wide' for more than three columns.
   */
  width?: 'text' | 'wide';
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
};

/** Up to this many rows a table shows in full; longer ones show a preview. */
const FULL_TABLE_ROWS = 15;
/** The rows a long table shows before "Show all N rows". */
const PREVIEW_ROWS = 10;

/**
 * For when the table is the figure: many columns a reader will want to look
 * up rather than see as a shape. Headers sort (with `aria-sort`, so a
 * screen-reader user hears the current order), numbers are formatted the
 * same way as in every chart, and a wide table scrolls sideways on a phone
 * instead of squeezing its numbers onto two lines, with a shadow on the side
 * that has more.
 *
 * Nothing is hidden without saying so. Up to fifteen rows render in full;
 * a longer table shows its first ten, fading out, above a "Show all N rows"
 * button. Every row is still in the markup: CSS hides the rest only when
 * scripting is on, so with JavaScript off the table is simply complete.
 *
 * The server renders the default order; sorting is a client enhancement.
 */
export function DataTable({
  columns,
  rows,
  caption,
  highlight = [],
  defaultSort,
  width = columns.length > 3 ? 'wide' : 'text',
  id,
  title,
  description,
  sources,
  note,
  footer,
  panel,
}: DataTableProps) {
  const [sort, setSort] = useState(defaultSort);
  const [expanded, setExpanded] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const overflow = useOverflowEdges(scroll);
  const bodyId = `${useId()}-rows`;
  const sorted = sort ? sortRows(rows, sort.key, sort.direction, comparisonFor(columns, sort.key)) : rows;
  const long = rows.length > FULL_TABLE_ROWS;
  const collapsed = long && !expanded;
  const headerKey = (columns.find(c => c.rowHeader) ?? columns[0]).key;
  const highlighted = new Set(highlight);

  const isNumeric = (column: DataTableColumn) =>
    column.format !== 'text' && column.format !== 'date' && (column.format !== undefined || rows.some(row => typeof cellValue(row[column.key]) === 'number'));
  const alignOf = (column: DataTableColumn) => column.align ?? (isNumeric(column) ? 'right' : 'left');

  const onSort = (column: DataTableColumn) => {
    // Numbers start largest-first, which is the question a reader sorting
    // them usually has; text starts A–Z and dates earliest first.
    const first: SortDirection = isNumeric(column) ? 'descending' : 'ascending';
    setSort(current =>
      current?.key === column.key ? { key: column.key, direction: current.direction === 'ascending' ? 'descending' : 'ascending' } : { key: column.key, direction: first },
    );
  };

  const onToggleRows = () => {
    setExpanded(!expanded);
    // Collapsing pulls the button up past the reader's view; keep it in sight.
    if (expanded) requestAnimationFrame(() => more.current?.scrollIntoView({ block: 'nearest' }));
  };

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} className={width === 'wide' ? 'sv-data sv-data--wide' : 'sv-data'}>
      <div className="sv-data__frame" data-collapsed={collapsed || undefined} data-overflow-start={overflow.start || undefined} data-overflow-end={overflow.end || undefined}>
        <div className="sv-data__scroll" ref={scroll} tabIndex={0} role="region" aria-label={caption}>
          <table className="sv-data__table">
            <caption className="sv-data__caption">
              {caption}
              {collapsed && <span className="sv-data__shown sv-visually-hidden">, first {PREVIEW_ROWS} of {rows.length} rows shown</span>}
            </caption>
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
            <tbody id={bodyId}>
              {sorted.map((row, i) => (
                <tr
                  key={`${String(cellValue(row[headerKey]))}-${i}`}
                  data-row={String(cellValue(row[headerKey]))}
                  data-highlight={highlighted.has(String(cellValue(row[headerKey]))) || undefined}
                  data-beyond-preview={(long && i >= PREVIEW_ROWS) || undefined}
                >
                  {columns.map(column => {
                    const Cell = column.key === headerKey ? 'th' : 'td';
                    const cell = row[column.key];
                    return (
                      <Cell key={column.key} scope={Cell === 'th' ? 'row' : undefined} data-align={alignOf(column)}>
                        {cellText(cell, column.format)}
                        {cell !== null && typeof cell === 'object' && cell.sources && <Footnotes sources={cell.sources} />}
                      </Cell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {long && (
        <button type="button" className="sv-data__more" ref={more} aria-expanded={expanded} aria-controls={bodyId} onClick={onToggleRows}>
          {expanded ? `Show the first ${PREVIEW_ROWS} rows` : `Show all ${rows.length} rows`}
        </button>
      )}
      {rows.length === 0 && <p className="sv-report__empty">No rows to show.</p>}
    </ReportFigure>
  );
}

/**
 * Whether the scrolled element has more content off its start or end edge,
 * kept current as it scrolls or resizes, so the frame can shade that side.
 * Both false until mounted: with JavaScript off the table simply scrolls.
 */
function useOverflowEdges(ref: RefObject<HTMLDivElement | null>) {
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const start = element.scrollLeft > 1;
      const end = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
      setEdges(current => (current.start === start && current.end === end ? current : { start, end }));
    };
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => {
      element.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [ref]);
  return edges;
}

/** A cited cell's " [n]" links, one per source, each to its quoted reference. */
export function Footnotes({ sources }: { sources: SourceCredit[] }) {
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
