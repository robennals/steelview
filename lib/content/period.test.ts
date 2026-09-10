import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparePeriods, normalizePeriod, periodToYear, periodYear } from './period';

test('a partial date normalizes to the first instant it can mean', () => {
  assert.equal(normalizePeriod('1964'), '1964-01-01');
  assert.equal(normalizePeriod('2021-06'), '2021-06-01');
  assert.equal(normalizePeriod('2021-06-30'), '2021-06-30');
});

test('ordering treats a bare year and its January as the same instant', () => {
  assert.equal(comparePeriods('1964', '1964-01'), 0);
  assert.ok(comparePeriods('1964', '1965') < 0);
  assert.ok(comparePeriods('2021-06', '2021') > 0);
  assert.ok(comparePeriods('2012', '2011-12') > 0);
});

test('placement puts a mid-year break in the middle of its year', () => {
  assert.equal(periodToYear('1964'), 1964);
  assert.ok(periodToYear('2021-06') > 2021.4 && periodToYear('2021-06') < 2021.45);
  assert.ok(periodToYear('2021-06') < periodToYear('2021-07'));
});

test('periodYear is the year a period falls in', () => {
  assert.equal(periodYear('2021-06-30'), 2021);
});
