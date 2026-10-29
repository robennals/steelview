/**
 * Sorting for DataTable. Numbers compare as numbers and text with en-GB
 * collation (so "10" does not sort before "9"); missing values always sink
 * to the bottom whichever way the column is sorted, because a blank at the
 * top of a "largest first" table reads as the largest.
 */

import { formatValue } from './format';
import { isRange, pointValue, qualificationOf, qualifiedText, type QualifiedValue } from './qualified';
import type { SourceCredit, ValueFormat } from './types';

export type CellValue = string | number | null | undefined;
/**
 * A cell object: text, or a number as the source qualifies it ("at least
 * 159", a range "4–6"), with any footnotes — "[n]" links to the sources it
 * rests on.
 */
export type CitedCell = ({ value: string | null } | QualifiedValue) & { sources?: SourceCredit[] };
export type TableCell = CellValue | CitedCell;
export type SortDirection = 'ascending' | 'descending';

const collator = new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' });

/** A cell's number with its qualification, or undefined for text, a blank or a plain number. */
export function qualifiedCell(cell: TableCell): QualifiedValue | undefined {
  if (cell === null || typeof cell !== 'object') return undefined;
  if (isRange(cell)) return cell;
  return isQualifiedPoint(cell) ? cell : undefined;
}

function isQualifiedPoint(cell: CitedCell): cell is Extract<CitedCell, { value: number }> {
  return 'value' in cell && typeof cell.value === 'number';
}

/** The value a cell sorts by: a cell object's `.value` (a range's midpoint), else the cell itself. */
export function cellValue(cell: TableCell): CellValue {
  if (cell === null || typeof cell !== 'object') return cell;
  return isRange(cell) ? pointValue(cell) : cell.value;
}

export function isEmptyCell(cell: TableCell): boolean {
  const value = cellValue(cell);
  return value === null || value === undefined || value === '';
}

/** What a cell prints: as the source qualified it, formatted if it is a number, "—" if it is empty. */
export function cellText(cited: TableCell, format?: ValueFormat | 'text'): string {
  if (isEmptyCell(cited)) return '—';
  // Fixed decimals by default: in a column, "16" beside "26.9" misaligns the digits a reader compares.
  const numberFormat = { fixed: true, ...(typeof format === 'object' ? format : { unit: 'number' as const }) };
  // A qualified number reads as the source wrote it, whatever the column's format.
  const qualified = qualifiedCell(cited);
  if (qualified && qualificationOf(qualified) !== 'exact') return qualifiedText(qualified, numberFormat);
  const cell = cellValue(cited);
  return typeof cell === 'number' && format !== 'text' ? formatValue(cell, numberFormat) : String(cell);
}

export function compareCells(a: TableCell, b: TableCell): number {
  const x = cellValue(a);
  const y = cellValue(b);
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return collator.compare(String(x), String(y));
}

export function sortRows<T extends Record<string, TableCell>>(rows: T[], key: string, direction: SortDirection): T[] {
  const sign = direction === 'ascending' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((x, y) => {
      const a = x.row[key];
      const b = y.row[key];
      if (isEmptyCell(a) || isEmptyCell(b)) return isEmptyCell(a) === isEmptyCell(b) ? x.index - y.index : isEmptyCell(a) ? 1 : -1;
      return compareCells(a, b) * sign || x.index - y.index;
    })
    .map(({ row }) => row);
}
