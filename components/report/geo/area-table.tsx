'use client';

import { useId, useState } from 'react';
import { countOf } from '../format';
import { sortRows, type SortDirection } from '../table-sort';
import { filterRows, NO_FILTERS, type AreaFilters, type AreaRow } from './area-rows';

type SortKey = 'name' | 'value' | 'note';
type Sort = { key: SortKey; direction: SortDirection };

function SortHeader({ label, column, sort, firstDirection, align, onSort }: { label: string; column: SortKey; sort: Sort; firstDirection: SortDirection; align?: 'right'; onSort: (next: Sort) => void }) {
  const active = sort.key === column;
  const flipped = sort.direction === 'ascending' ? 'descending' : 'ascending';
  return (
    <th scope="col" data-align={align} className={align ? undefined : 'sv-data__th-text'} aria-sort={active ? sort.direction : 'none'}>
      <button type="button" className="sv-data__sort" onClick={() => onSort({ key: column, direction: active ? flipped : firstDirection })}>
        {label}
        <span className="sv-data__sort-mark" aria-hidden="true" data-active={active || undefined}>
          {active ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </th>
  );
}

/**
 * A map as one table: a row per area and a column for its figure or category,
 * plus any notes. Every column sorts and filters, and areas with no data sink
 * to the bottom whichever way a column runs, so the table answers "which
 * areas?" as well as "what does this area have?". A number filters by a range,
 * a category by a list, and text by what it contains.
 *
 * Rendered on the server in its default order; without script it is simply
 * complete, and the filters are hidden. It is the map's checkable form: a
 * reader who doubts a shade can find the number.
 */
export function AreaTable({
  caption,
  areaLabel,
  valueLabel,
  rows,
  choices,
}: {
  caption: string;
  areaLabel: string;
  /** The data column's heading: what the figure or category is. */
  valueLabel: string;
  rows: AreaRow[];
  /** A categorical map's categories, in order, "No data" last when any area has it; absent for a numeric map. */
  choices?: string[];
}) {
  const baseId = useId();
  const numeric = choices === undefined;
  const [sort, setSort] = useState<Sort>({ key: 'value', direction: numeric ? 'descending' : 'ascending' });
  const [filters, setFilters] = useState<AreaFilters>(NO_FILTERS);
  const hasNotes = rows.some(row => row.note);
  const shown = sortRows(filterRows(rows, filters), sort.key, sort.direction);
  const update = (change: Partial<AreaFilters>) => setFilters(current => ({ ...current, ...change }));

  return (
    <div className="sv-area-table">
      <div className="sv-area-table__filters" role="group" aria-label={`Filter ${countOf(rows.length, areaLabel)}`}>
        <label>
          {areaLabel}
          <input type="search" value={filters.name} onChange={event => update({ name: event.target.value })} placeholder="Name contains" />
        </label>
        {numeric ? (
          <>
            <label>
              At least
              <input type="number" value={filters.min} onChange={event => update({ min: event.target.value })} aria-label={`${valueLabel}: at least`} />
            </label>
            <label>
              At most
              <input type="number" value={filters.max} onChange={event => update({ max: event.target.value })} aria-label={`${valueLabel}: at most`} />
            </label>
          </>
        ) : (
          <label>
            {valueLabel}
            <select value={filters.choice} onChange={event => update({ choice: event.target.value })}>
              <option value="">All</option>
              {choices.map(choice => <option key={choice} value={choice}>{choice}</option>)}
            </select>
          </label>
        )}
        {hasNotes && (
          <label>
            Note
            <input type="search" value={filters.note} onChange={event => update({ note: event.target.value })} placeholder="Note contains" />
          </label>
        )}
        <p className="sv-area-table__count" id={`${baseId}-count`} aria-live="polite">
          {shown.length === rows.length ? countOf(rows.length, areaLabel) : `${shown.length} of ${countOf(rows.length, areaLabel)}`}
        </p>
      </div>
      <div className="sv-chart__table-scroll">
        <table className="sv-chart__table sv-area-table__table" aria-describedby={`${baseId}-count`}>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <SortHeader label={areaLabel} column="name" sort={sort} firstDirection="ascending" onSort={setSort} />
              <SortHeader label={valueLabel} column="value" sort={sort} firstDirection={numeric ? 'descending' : 'ascending'} align={numeric ? 'right' : undefined} onSort={setSort} />
              {hasNotes && <SortHeader label="Note" column="note" sort={sort} firstDirection="ascending" onSort={setSort} />}
            </tr>
          </thead>
          <tbody>
            {shown.map(row => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                {numeric ? (
                  <td data-missing={row.value === undefined ? 'true' : undefined}>{row.text}</td>
                ) : (
                  <td className="sv-data__td-text" data-missing={row.value === undefined ? 'true' : undefined}>
                    <span className="sv-area-table__category">
                      {row.slot === undefined ? (
                        <span className="sv-map-legend__hatch sv-category-legend__swatch" aria-hidden="true" />
                      ) : (
                        <span className="sv-category-legend__swatch sv-cat-fill" data-slot={row.slot} aria-hidden="true"><span>{row.mark}</span></span>
                      )}
                      {row.text}
                    </span>
                  </td>
                )}
                {hasNotes && <td className="sv-data__td-text sv-area-table__note">{row.note ?? ''}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p className="sv-report__empty">{countOf(0, areaLabel)} match these filters.</p>}
    </div>
  );
}
