import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortRows } from './table-sort';

const rows = [
  { name: 'Item 10', n: 3 },
  { name: 'Item 9', n: null },
  { name: 'item 2', n: 10 },
  { name: 'Item 1', n: 1 },
];

test('numbers sort numerically and missing values sink either way', () => {
  assert.deepEqual(sortRows(rows, 'n', 'descending').map(r => r.n), [10, 3, 1, null]);
  assert.deepEqual(sortRows(rows, 'n', 'ascending').map(r => r.n), [1, 3, 10, null]);
});

test('text sorts with numeric, case-insensitive collation', () => {
  assert.deepEqual(sortRows(rows, 'name', 'ascending').map(r => r.name), ['Item 1', 'item 2', 'Item 9', 'Item 10']);
});
