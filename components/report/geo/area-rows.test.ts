import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryRows, filterRows, NO_FILTERS, numericRows } from './area-rows';

const areas = [{ id: 'b', name: 'Belgium' }, { id: 'a', name: 'Austria' }, { id: 'c', name: 'Chad' }];

test('numeric rows carry the figure as the source qualified it, in name order', () => {
  const rows = numericRows(areas, { a: { value: 3, qualifier: 'at least' }, b: { value: 7 } }, { unit: 'percent' });
  assert.deepEqual(rows.map(row => [row.name, row.value, row.text]), [['Austria', 3, 'at least 3%'], ['Belgium', 7, '7%'], ['Chad', undefined, 'No data']]);
});

const encoding = {
  categoryLabel: 'Rule',
  categories: [{ id: 'x', label: 'Strict', mark: 'S' }, { id: 'y', label: 'Lax', mark: 'L' }],
  categoryData: { a: { category: 'y', note: 'Since 2020' }, b: { category: 'x' } },
};

test('category rows sort in the author\'s order and carry the mark and note', () => {
  const rows = categoryRows(areas, encoding, new Map([['x', 1], ['y', 2]]));
  assert.deepEqual(rows.map(row => [row.name, row.value, row.text, row.slot, row.mark, row.note]), [
    ['Austria', 1, 'Lax', 2, 'L', 'Since 2020'],
    ['Belgium', 0, 'Strict', 1, 'S', undefined],
    ['Chad', undefined, 'No data', undefined, undefined, undefined],
  ]);
});

test('each filter narrows by its own column, whatever the case', () => {
  const rows = categoryRows(areas, encoding, new Map([['x', 1], ['y', 2]]));
  const names = (filters: Partial<typeof NO_FILTERS>) => filterRows(rows, { ...NO_FILTERS, ...filters }).map(row => row.name);
  assert.deepEqual(names({}), ['Austria', 'Belgium', 'Chad']);
  assert.deepEqual(names({ name: ' BEL ' }), ['Belgium']);
  assert.deepEqual(names({ choice: 'No data' }), ['Chad']);
  assert.deepEqual(names({ choice: 'Lax', note: '2020' }), ['Austria']);
  assert.deepEqual(names({ choice: 'Strict', note: '2020' }), []);
});

test('a bound on the figure leaves out areas with none, and half-typed input filters nothing', () => {
  const rows = numericRows(areas, { a: { value: 3 }, b: { value: 7 } });
  const names = (filters: Partial<typeof NO_FILTERS>) => filterRows(rows, { ...NO_FILTERS, ...filters }).map(row => row.name);
  assert.deepEqual(names({ min: '4' }), ['Belgium']);
  assert.deepEqual(names({ max: '3' }), ['Austria']);
  assert.deepEqual(names({ min: '3', max: '7' }), ['Austria', 'Belgium']);
  assert.deepEqual(names({ min: '-' }), ['Austria', 'Belgium', 'Chad']);
});
