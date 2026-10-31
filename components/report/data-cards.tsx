import { Footnotes, type DataTableColumn, type DataTableProps, type DataTableRow } from './data-table';
import { ReportFigure } from './figure';
import { isWholeQuote, splitQuoted } from './quoted-text';
import { cellText, cellValue, sortRows } from './table-sort';

export type DataCardsProps = Pick<
  DataTableProps,
  'columns' | 'rows' | 'caption' | 'highlight' | 'defaultSort' | 'id' | 'title' | 'description' | 'sources' | 'note' | 'footer'
> & {
  /** 'timeline' strings the cards along a rule, for rows that run in order of time. */
  layout: 'cards' | 'timeline';
  /** The column set as the card's main text. */
  leadColumn?: string;
  /** The column printed above the card's title, usually when it happened. */
  dateColumn?: string;
};

/**
 * A table's rows as cards, for when a reader reads each row rather than
 * compares a column: rulings, laws and studies, whose cells run to sentences
 * and quote their sources. The row header is the card's title, the lead column
 * its main text, and every other column a labelled line beneath it.
 *
 * Quoted words are set in the serif, the voice the library's quotes use, so
 * the source's words stand apart from the summary around them. Cards do not
 * sort: their order is the author's, or `defaultSort`.
 */
export function DataCards({
  columns,
  rows,
  caption,
  highlight = [],
  defaultSort,
  layout,
  leadColumn,
  dateColumn,
  id,
  title,
  description,
  sources,
  note,
  footer,
}: DataCardsProps) {
  const ordered = defaultSort ? sortRows(rows, defaultSort.key, defaultSort.direction) : rows;
  const header = columns.find(c => c.rowHeader) ?? columns[0];
  const date = columns.find(c => c.key === dateColumn);
  const lead = columns.find(c => c.key === leadColumn);
  const fields = columns.filter(c => c !== header && c !== date && c !== lead);
  const highlighted = new Set(highlight);
  const List = layout === 'timeline' ? 'ol' : 'ul';
  // A blank line says nothing on a card, whether the cell is empty or an author's "—".
  const filled = (row: DataTableRow, column: DataTableColumn | undefined): column is DataTableColumn => column !== undefined && cellText(row[column.key], column.format) !== '—';

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} className="sv-cards">
      <List className="sv-cards__list" data-layout={layout} aria-label={caption}>
        {ordered.map((row, i) => {
          const name = String(cellValue(row[header.key]));
          const present = fields.filter(column => filled(row, column));
          return (
            <li key={`${name}-${i}`} className="sv-cards__item" data-row={name} data-highlight={highlighted.has(name) || undefined}>
              {filled(row, date) && <p className="sv-cards__date"><CellContent row={row} column={date} /></p>}
              <p className="sv-cards__title"><CellContent row={row} column={header} /></p>
              {filled(row, lead) && (
                <p className="sv-cards__lead" data-quote={isWholeQuote(splitQuoted(cellText(row[lead.key], lead.format))) || undefined}>
                  <CellContent row={row} column={lead} />
                </p>
              )}
              {present.length > 0 && (
                <dl className="sv-cards__fields">
                  {present.map(column => (
                    <div key={column.key}>
                      <dt>{column.label}</dt>
                      <dd><CellContent row={row} column={column} /></dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          );
        })}
      </List>
    </ReportFigure>
  );
}

/** A cell's text with its quotations marked, then its footnotes. */
function CellContent({ row, column }: { row: DataTableRow; column: DataTableColumn }) {
  const cell = row[column.key];
  return (
    <>
      {splitQuoted(cellText(cell, column.format)).map((part, i) => (part.quoted ? <q key={i}>{part.text}</q> : part.text))}
      {cell !== null && typeof cell === 'object' && <Footnotes sources={cell.sources} />}
    </>
  );
}
