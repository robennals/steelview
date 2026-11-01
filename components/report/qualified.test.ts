import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundGlyph, extentValues, pointValue, qualificationOf, qualificationsIn, qualifiedLabel, qualifiedText, rangeText } from './qualified';

test('each qualifier word maps to the mark it is drawn with', () => {
  assert.equal(qualificationOf(159), 'exact');
  assert.equal(qualificationOf({ value: 159 }), 'exact');
  for (const qualifier of ['at least', 'more than', 'over'] as const) assert.equal(qualificationOf({ value: 1, qualifier }), 'lower-bound');
  for (const qualifier of ['at most', 'fewer than', 'under'] as const) assert.equal(qualificationOf({ value: 1, qualifier }), 'upper-bound');
  for (const qualifier of ['about', 'nearly'] as const) assert.equal(qualificationOf({ value: 1, qualifier }), 'approximate');
  assert.equal(qualificationOf({ low: 4, high: 6 }), 'range');
});

test('a range is placed and sorted at its midpoint, and spans both ends for a scale', () => {
  assert.equal(pointValue({ low: 4, high: 6 }), 5);
  assert.equal(pointValue({ value: 159, qualifier: 'at least' }), 159);
  assert.deepEqual(extentValues({ low: 4, high: 6 }), [4, 6]);
  assert.deepEqual(extentValues(7), [7]);
});

test('bounds take a glyph pointing the way the true value lies; nothing else does', () => {
  assert.equal(boundGlyph({ value: 1, qualifier: 'more than' }), '▲');
  assert.equal(boundGlyph({ value: 1, qualifier: 'under' }), '▼');
  assert.equal(boundGlyph({ value: 1, qualifier: 'about' }), undefined);
  assert.equal(boundGlyph({ low: 1, high: 2 }), undefined);
});

test('a range writes its unit once, and spells out "to" when a sign is involved', () => {
  assert.equal(rangeText(4, 6, { unit: 'percent' }), '4–6%');
  assert.equal(rangeText(4e9, 6e9, { unit: 'currency', currency: 'USD', compact: true }), '$4–6bn');
  assert.equal(rangeText(1200, 1500), '1,200–1,500');
  assert.equal(rangeText(-4, 6, { unit: 'percent' }), '−4% to 6%');
});

test('a label puts the qualifier before the number; text prefers the published wording only for a qualified value', () => {
  assert.equal(qualifiedLabel({ value: 159, qualifier: 'at least', asPublished: 'At least 159' }), 'at least 159');
  assert.equal(qualifiedText({ value: 159, qualifier: 'at least', asPublished: 'At least 159' }), 'At least 159');
  assert.equal(qualifiedText({ low: 4, high: 6, asPublished: 'between 4 and 6 per cent' }, { unit: 'percent' }), 'between 4 and 6 per cent');
  assert.equal(qualifiedText({ low: 4, high: 6 }, { unit: 'percent' }), '4–6%');
  // Exact: the wording is for check:figures, the number says the same thing.
  assert.equal(qualifiedText({ value: 76, asPublished: '(76%)' }, { unit: 'percent' }), '76%');
});

test('a legend lists each qualification that appears, once, in a fixed order', () => {
  assert.deepEqual(qualificationsIn([{ low: 1, high: 2 }, 3, { value: 1, qualifier: 'about' }, { value: 2, qualifier: 'over' }, { value: 3, qualifier: 'at least' }]), ['lower-bound', 'approximate', 'range']);
  assert.deepEqual(qualificationsIn([1, 2]), []);
});
