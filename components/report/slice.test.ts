import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, filterRows, slice, statusLine, type SliceDimension } from './slice';

const rows = [
  { reason: 'Study', year: '2024', people: 274 },
  { reason: 'Study', year: '2025', people: 294 },
  { reason: 'Work', year: '2024', people: 272 },
  { reason: 'Work', year: '2025', people: 146 },
  { reason: 'Asylum', year: '2025', people: 88 },
];
const reason: SliceDimension = { key: 'reason', label: 'Reason', plural: 'reasons' };
const year: SliceDimension = { key: 'year', label: 'Year', plural: 'years', values: ['2024', '2025'] };

test('aggregate sums or averages, and returns null when nothing is numeric', () => {
  assert.equal(aggregate(rows, 'people'), 1074);
  assert.equal(aggregate(rows.slice(0, 2), 'people', 'mean'), 284);
  assert.equal(aggregate([{ a: 'x' }], 'a'), null);
});

test('an empty filter means all rows', () => {
  assert.equal(filterRows(rows, { year: [] }).length, rows.length);
  assert.equal(filterRows(rows, { year: ['2025'] }).length, 3);
});

test('slice ranks categorical groups by value', () => {
  const result = slice({ rows, breakdown: reason, measure: 'people', filters: { year: ['2025'] } });
  assert.deepEqual(result.groups.map(g => [g.key, g.total]), [['Study', 294], ['Work', 146], ['Asylum', 88]]);
});

test('slice keeps declared order for ordered dimensions and splits within each group', () => {
  const result = slice({ rows, breakdown: year, split: reason, measure: 'people' });
  assert.deepEqual(result.splitKeys, ['Study', 'Work', 'Asylum']);
  assert.deepEqual(result.groups.map(g => g.key), ['2024', '2025']);
  // Asylum has no 2024 row: a gap, not a zero.
  assert.deepEqual(result.groups[0].parts, [274, 272, null]);
  assert.deepEqual(result.groups[1].parts, [294, 146, 88]);
});

test('filtering the split dimension narrows the split keys', () => {
  const result = slice({ rows, breakdown: year, split: reason, measure: 'people', filters: { reason: ['Work'] } });
  assert.deepEqual(result.splitKeys, ['Work']);
  assert.deepEqual(result.groups.map(g => g.total), [272, 146]);
});

test('groups with no data after filtering are dropped', () => {
  const result = slice({ rows, breakdown: reason, measure: 'people', filters: { year: ['2024'] } });
  assert.deepEqual(result.groups.map(g => g.key), ['Study', 'Work']);
});

test('status line says what is shown and what was added together', () => {
  const base = { rows, dimensions: [reason, year], breakdown: reason, aggregation: 'sum' as const };
  assert.equal(statusLine({ ...base, filters: { year: ['2025'] }, shown: 3 }), 'Showing 3 of 3 reasons · Year: 2025');
  assert.equal(statusLine({ ...base, filters: {}, shown: 3 }), 'Showing 3 of 3 reasons · Year: all 2 added together');
  assert.equal(
    statusLine({ ...base, breakdown: year, split: reason, filters: { reason: ['Work'] }, shown: 2 }),
    'Showing 2 of 2 years · split by reason (Work)',
  );
});

test('pinned residuals stay last however the bars are ranked', () => {
  const result = slice({ rows, breakdown: { ...reason, last: ['Study'] }, measure: 'people' });
  assert.deepEqual(result.groups.map(g => g.key), ['Work', 'Asylum', 'Study']);
});
