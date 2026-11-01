import { test } from 'node:test';
import assert from 'node:assert/strict';
import { percentAlong, stackLevels, timeTicks, toYear, yearTicks } from './time-axis';

test('toYear accepts numbers and partial dates', () => {
  assert.equal(toYear(2020), 2020);
  assert.equal(toYear('2022-02'), 2022 + 1 / 12);
});

test('percentAlong maps the span to 0–100 and clamps', () => {
  const span = { from: 2020, to: 2030 };
  assert.equal(percentAlong(2025, span), 50);
  assert.equal(percentAlong(2010, span), 0);
  assert.equal(percentAlong(2040, span), 100);
});

test('yearTicks picks a 1-2-5 step and alternates minor ticks', () => {
  assert.deepEqual(yearTicks({ from: 2019, to: 2026 }).map(t => t.year), [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  assert.deepEqual(yearTicks({ from: 2001, to: 2025 }, 8).map(t => t.year), [2005, 2010, 2015, 2020, 2025]);
  assert.deepEqual(yearTicks({ from: 2019, to: 2022 }).map(t => t.minor), [false, true, false, true]);
});

test('stackLevels lifts only the markers that would collide', () => {
  assert.deepEqual(stackLevels([0, 10, 20], 5), [0, 0, 0]);
  assert.deepEqual(stackLevels([0, 2, 4, 30], 5), [0, 1, 2, 0]);
  assert.deepEqual(stackLevels([0, 1, 2, 3], 5, 2), [0, 1, 0, 1]);
});

test('timeTicks labels months on a span under eighteen months, naming the year on the first and on each January', () => {
  const eightMonths = { from: toYear('2026-02-28'), to: toYear('2026-10-29') };
  assert.deepEqual(timeTicks(eightMonths).map(t => t.label), ['Mar 2026', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']);
  assert.equal(timeTicks(eightMonths)[0].at, toYear('2026-03'));
  const fifteenMonths = { from: toYear('2025-10'), to: toYear('2027-01') };
  assert.deepEqual(timeTicks(fifteenMonths).map(t => t.label), ['Nov 2025', 'Jan 2026', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Jan 2027']);
  assert.deepEqual(timeTicks(fifteenMonths).map(t => t.minor), [false, true, false, true, false, true, false, true]);
});

test('timeTicks keeps whole years from eighteen months up', () => {
  assert.deepEqual(timeTicks({ from: 2019, to: 2026 }).map(t => t.label), ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']);
  assert.deepEqual(timeTicks({ from: toYear('2024-07'), to: 2026 }).map(t => t.label), ['2025', '2026']);
});
