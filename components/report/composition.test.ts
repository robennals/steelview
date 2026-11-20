import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OTHER_KEY, compose } from './composition';

const categories = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' },
  { key: 'd', label: 'D' },
];

test('shares are of each row total, from counts', () => {
  const { rows } = compose(categories, [{ label: 'r', values: { a: 50, b: 30, c: 15, d: 5 } }]);
  assert.deepEqual(rows[0].segments.map(s => s.share), [50, 30, 15, 5]);
  assert.equal(rows[0].total, 100);
});

test('only categories small in every row fold into Other', () => {
  const { categories: out, rows } = compose(
    categories,
    [
      { label: '2011', values: { a: 80, b: 12, c: 5, d: 3 } },
      { label: '2021', values: { a: 70, b: 4, c: 6, d: 20 } },
    ],
    { otherThreshold: 10 },
  );
  // b is 12% in 2011 and d is 20% in 2021, so only c folds — and a single
  // category is not folded at all.
  assert.deepEqual(out.map(c => c.key), ['a', 'b', 'c', 'd']);
  assert.equal(rows[0].segments.length, 4);
});

test('two or more small categories fold into one Other part at the end', () => {
  const { categories: out, rows } = compose(categories, [{ label: 'r', values: { a: 80, b: 12, c: 5, d: 3 } }], { otherThreshold: 10, otherLabel: 'Rest' });
  assert.deepEqual(out.map(c => c.key), ['a', 'b', OTHER_KEY]);
  assert.deepEqual(rows[0].segments.at(-1), { key: OTHER_KEY, label: 'Rest', value: 8, share: 8 });
});

test('a stated total is the row total; shares stay of the parts, so the bar fills its width', () => {
  const { rows } = compose(categories, [{ label: 'r', values: { a: 33.3, b: 33.3, c: 33.3 }, total: 100 }]);
  assert.equal(rows[0].total, 100);
  assert.ok(Math.abs(rows[0].segments.reduce((sum, s) => sum + s.share, 0) - 100) < 1e-9);
  assert.deepEqual(rows[0].segments[0].published, 33.3);
});

test('a qualified part is sized by its number and keeps its qualification', () => {
  const { rows } = compose(categories, [{ label: 'r', values: { a: { value: 30, qualifier: 'about' }, b: { low: 60, high: 80 } } }]);
  assert.deepEqual(rows[0].segments.slice(0, 2).map(s => s.value), [30, 70]);
  assert.deepEqual(rows[0].segments[0].published, { value: 30, qualifier: 'about' });
});

test('bars of counts share one scale: the largest row fills the width, the rest are drawn to it', () => {
  const { rows } = compose(categories, [
    { label: 'HRANA', values: { a: 1701, b: 1221, c: 714 } },
    { label: 'Hengaw', values: { a: 1030, b: 6620 }, total: 7650 },
    { label: 'Authorities', values: { c: 3375 }, total: 3375 },
  ]);
  assert.equal(rows[1].length, 100);
  assert.ok(Math.abs(rows[0].length - (3636 / 7650) * 100) < 1e-9);
  assert.ok(Math.abs(rows[2].length - (3375 / 7650) * 100) < 1e-9);
});

test('rows with the same total are drawn the same length', () => {
  const { rows } = compose(categories, [
    { label: 'June', values: { a: 21, b: 3, c: 10 } },
    { label: 'September', values: { a: 23, b: 3, c: 8 } },
  ]);
  assert.deepEqual(rows.map(r => r.length), [100, 100]);
});

test('bars of percentages are each a whole, so all are full length even when rounding leaves 101', () => {
  const { rows } = compose(categories, [
    { label: 'All adults', values: { a: 34, b: 63, c: 4 } },
    { label: 'Republicans', values: { a: 79, b: 19, c: 2 } },
  ], { unit: 'percent' });
  assert.deepEqual(rows.map(r => r.length), [100, 100]);
});
