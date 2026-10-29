/**
 * Sorting for DataTable. Numbers compare as numbers and text with en-GB
 * collation (so "10" does not sort before "9"); missing values always sink
 * to the bottom whichever way the column is sorted, because a blank at the
 * top of a "largest first" table reads as the largest.
 */

import type { SourceCredit } from './types';

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

export function compareCells(a: TableCell, b: TableCell): number {
  const x = cellValue(a);
  const y = cellValue(b);
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return collator.compare(String(x), String(y));
}

export function sortRows<T extends Record<string, TableCell>>(rows: T[], key: string, direction: SortDirection): T[] {
  const sign = direction === 'ascending' ? 1 : -1;
  const missing = (cell: TableCell) => {
    const value = cellValue(cell);
    return value === null || value === undefined || value === '';
  };
  return rows
    .map((row, index) => ({ row, index }))
    .sort((x, y) => {
      const a = x.row[key];
      const b = y.row[key];
      if (missing(a) || missing(b)) return missing(a) === missing(b) ? x.index - y.index : missing(a) ? 1 : -1;
      return compareCells(a, b) * sign || x.index - y.index;
    })
    .map(({ row }) => row);
}
