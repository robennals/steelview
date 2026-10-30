/**
 * Sorting for DataTable. Numbers compare as numbers and text with en-GB
 * collation (so "10" does not sort before "9"); missing values always sink
 * to the bottom whichever way the column is sorted, because a blank at the
 * top of a "largest first" table reads as the largest.
 */

import { formatValue } from './format';
import type { SourceCredit, ValueFormat } from './types';

export type CellValue = string | number | null | undefined;
/** A cell with its own footnotes: its value, then "[n]" links to the sources it rests on. */
export type CitedCell = { value: string | number | null; sources: SourceCredit[] };
export type TableCell = CellValue | CitedCell;
export type SortDirection = 'ascending' | 'descending';

const collator = new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' });

/** The value a cell sorts and prints by: a cited cell's `.value`, else the cell itself. */
export function cellValue(cell: TableCell): CellValue {
  return cell !== null && typeof cell === 'object' ? cell.value : cell;
}

export function isEmptyCell(cell: TableCell): boolean {
  const value = cellValue(cell);
  return value === null || value === undefined || value === '';
}

/** What a cell prints: formatted if it is a number, "—" if it is empty. */
export function cellText(cited: TableCell, format?: ValueFormat | 'text'): string {
  if (isEmptyCell(cited)) return '—';
  const cell = cellValue(cited);
  if (typeof cell === 'number' && format !== 'text') {
    // Fixed decimals by default: in a column, "16" beside "26.9" misaligns the digits a reader compares.
    return formatValue(cell, { fixed: true, ...(format ?? { unit: 'number' }) });
  }
  return String(cell);
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
