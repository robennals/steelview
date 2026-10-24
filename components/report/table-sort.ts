/**
 * Sorting for DataTable. Numbers compare as numbers and text with en-GB
 * collation (so "10" does not sort before "9"); missing values always sink
 * to the bottom whichever way the column is sorted, because a blank at the
 * top of a "largest first" table reads as the largest.
 */

export type TableCell = string | number | null | undefined;
export type SortDirection = 'ascending' | 'descending';

const collator = new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' });

export function compareCells(a: TableCell, b: TableCell): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

export function sortRows<T extends Record<string, TableCell>>(rows: T[], key: string, direction: SortDirection): T[] {
  const sign = direction === 'ascending' ? 1 : -1;
  const missing = (cell: TableCell) => cell === null || cell === undefined || cell === '';
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
