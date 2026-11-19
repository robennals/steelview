import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brokenScale, brokenTicks, percentAlong, stackLevels, timeTicks, toYear, yearTicks } from './time-axis';

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

test('a broken scale cuts out a long empty stretch, and keeps each stretch to scale', () => {
  // One event in 2011, then a burst from 2021 to 2026.
  const scale = brokenScale([2011.8, 2021.1, 2024.3, 2025.8, 2026.7]);
  assert.equal(scale.breaks.length, 1);
  assert.deepEqual(scale.segments.map(s => [s.from, s.to]), [[2011.8, 2011.8], [2021.1, 2026.7]]);
  // The burst takes most of the axis, not the last third it would to scale.
  assert.ok(scale.at(2026.7) - scale.at(2021.1) > 75);
  // Within a stretch, equal times are equal distances.
  const a = scale.at(2022) - scale.at(2021.5);
  const b = scale.at(2026) - scale.at(2025.5);
  assert.ok(Math.abs(a - b) < 1e-9);
  // The ends are kept clear for markers.
  assert.equal(scale.at(2011.8), 4);
  assert.equal(scale.at(2026.7), 96);
});

test('a scale with no long gap is not broken', () => {
  const scale = brokenScale([2001, 2005, 2006, 2008, 2013, 2015, 2016, 2019, 2022]);
  assert.equal(scale.breaks.length, 0);
  assert.equal(scale.segments.length, 1);
});

test('broken ticks label every stretch and never overlap on a phone-width axis', () => {
  for (const years of [
    [2011.8, 2021.1, 2024.3, 2024.85, 2025.8, 2026.1, 2026.7],
    [1979.99, 1984.05, 2017.9, 2021.03],
    [1888, 1896, 1965.6, 1966, 1970, 1993, 2002],
  ]) {
    const scale = brokenScale(years);
    const ticks = brokenTicks(scale);
    // Every stretch has a label: at its start, or within it where its start is too close to the last stretch's.
    for (const segment of scale.segments) {
      assert.ok(ticks.some(t => t.x >= scale.at(segment.from) - 0.5 && t.x <= scale.at(segment.to) + 0.5), `the stretch from ${segment.from} is labelled`);
    }
    // Rough label widths at 6.4px a character on a 330px axis.
    const extents = ticks.map(t => { const w = (t.label.length * 6.4 * 100) / 330; return [t.x - w / 2, t.x + w / 2]; });
    for (let i = 1; i < extents.length; i++) assert.ok(extents[i][0] > extents[i - 1][1] - 4, `${ticks[i - 1].label} and ${ticks[i].label} do not collide`);
  }
});

test('a short timeline is labelled in months, naming the year only where it changes', () => {
  // The 2026 ceasefire record: April, then June to mid-July.
  const scale = brokenScale([2026.26, 2026.27, 2026.44, 2026.45, 2026.46, 2026.48, 2026.51, 2026.53]);
  const labels = brokenTicks(scale).map(t => t.label);
  assert.equal(labels[0], 'Apr 2026');
  assert.ok(labels.slice(1).every(l => !l.includes('2026')), labels.join(', '));
});
