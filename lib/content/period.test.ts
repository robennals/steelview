import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareCoarseFirst, comparePeriods, datePlacement, isApproximateDate, normalizePeriod, periodToYear, periodYear } from './period';

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

test('a table date sorts chronologically, a coarser date before the finer dates inside it', () => {
  const dates = ['2026-06-12', '2025', '2026-06', '2026', '2026-01-31', '2026-03'];
  assert.deepEqual([...dates].sort(compareCoarseFirst), ['2025', '2026', '2026-01-31', '2026-03', '2026-06', '2026-06-12']);
});

test('an approximate date is a decade or a circa year, placed at its decade\'s start or its year', () => {
  assert.ok(isApproximateDate('1850s'));
  assert.ok(isApproximateDate('c. 1888'));
  assert.ok(!isApproximateDate('1855s'));
  assert.ok(!isApproximateDate('1880s–1890s'));
  assert.ok(!isApproximateDate('1888'));
  assert.equal(datePlacement('1850s'), '1850');
  assert.equal(datePlacement('c. 1888'), '1888');
  assert.equal(datePlacement('2024-11'), '2024-11');
});
