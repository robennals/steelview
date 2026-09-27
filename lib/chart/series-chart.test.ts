import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Series } from '@/lib/content/types';
import {
  CHART_GEOMETRY,
  formatTick,
  formatValue,
  layoutReading,
  niceTicks,
  pathFor,
  seriesSlots,
  seriesStrokeDash,
  seriesTable,
  splitAtBreaks,
  yearTicks,
} from './series-chart';

const source = {
  stance: 'supports' as const,
  quote: 'q',
  title: 't',
  url: 'https://example.org/data.xlsx',
  publisher: 'p',
  date: '2024',
};

/** Four years, one break in the middle, two readings of the same data. */
function series(): Series {
  return {
    title: 'Migration',
    description: 'What it shows.',
    periodLabel: 'Year',
    coverage: { from: '1990', to: '1993' },
    breaks: [{ period: '1992', label: 'method change', note: 'the source changed basis' }],
    source,
    readings: [
      {
        id: 'people',
        label: 'In people',
        unit: 'count',
        valueLabel: 'People a year',
        lines: [
          {
            name: 'Immigration',
            points: [
              { period: '1990', value: 100 },
              { period: '1991', value: 200 },
              { period: '1992', value: 300 },
              { period: '1993', value: 400 },
            ],
          },
          {
            name: 'Net migration',
            points: [
              { period: '1990', value: -50 },
              { period: '1991', value: 0 },
              { period: '1992', value: 50 },
              { period: '1993', value: 100 },
            ],
          },
        ],
      },
      {
        id: 'share',
        label: 'As a share of the population',
        unit: 'percent',
        valueLabel: 'Percentage of the population',
        lines: [
          {
            name: 'Immigration',
            points: [
              { period: '1990', value: 0.1 },
              { period: '1991', value: 0.2 },
              { period: '1992', value: 0.3 },
              { period: '1993', value: 0.4 },
            ],
          },
        ],
      },
    ],
  };
}

test('niceTicks lands on round numbers that span the data', () => {
  const ticks = niceTicks(-87000, 1441000);
  assert.ok(ticks[0] <= -87000, `${ticks[0]}`);
  assert.ok(ticks[ticks.length - 1] >= 1441000, `${ticks[ticks.length - 1]}`);
  assert.ok(ticks.includes(0), ticks.join(','));
  const step = ticks[1] - ticks[0];
  for (let i = 1; i < ticks.length; i += 1) {
    assert.equal(Number((ticks[i] - ticks[i - 1]).toPrecision(12)), step);
  }
});

test('niceTicks does not degenerate on a flat series', () => {
  assert.deepEqual(niceTicks(5, 5), [0, 5, 10]);
  assert.deepEqual(niceTicks(0, 0), [-1, 0, 1]);
});

test('yearTicks labels every year for short series and names both ends of longer ones', () => {
  assert.deepEqual(yearTicks(2021, 2025, 20), [2021, 2022, 2023, 2024, 2025]);
  assert.deepEqual(yearTicks(1964, 2025, 10), [1964, 1970, 1980, 1990, 2000, 2010, 2020, 2025]);
  assert.deepEqual(yearTicks(1964, 2025, 20), [1964, 1980, 2000, 2020, 2025]);
});

test('formatValue is the exact number, formatTick the compact one', () => {
  assert.equal(formatValue(1441000, 'count'), '1,441,000');
  assert.equal(formatValue(-60000, 'count'), '−60,000');
  assert.equal(formatValue(2.1, 'percent'), '2.10%');
  assert.equal(formatValue(-0.11, 'percent'), '−0.11%');
  assert.equal(formatTick(1500000, 'count'), '1.5m');
  assert.equal(formatTick(-250000, 'count'), '−250k');
  assert.equal(formatTick(0, 'count'), '0');
  assert.equal(formatTick(0, 'percent'), '0%');
  assert.equal(formatTick(2.5, 'percent'), '2.5%');
});

test('a line keeps its colour slot across every reading it appears in', () => {
  const slots = seriesSlots(series());
  assert.deepEqual([...slots], [
    ['Immigration', 1],
    ['Net migration', 2],
  ]);
});

test('a substantive four-way breakdown receives a fourth stable colour slot', () => {
  const s = series();
  s.readings[0].lines.push({
    name: 'Third group',
    points: [
      { period: '1990', value: 1 },
      { period: '1991', value: 1 },
      { period: '1992', value: 1 },
      { period: '1993', value: 1 },
    ],
  });
  assert.equal(seriesSlots(s).get('Third group'), 3);
  s.readings[0].lines.push({
    name: 'Fourth group',
    points: [
      { period: '1990', value: 1 },
      { period: '1991', value: 1 },
      { period: '1992', value: 1 },
      { period: '1993', value: 1 },
    ],
  });
  assert.equal(seriesSlots(s).get('Fourth group'), 4);
});

test('later series slots add a distinct non-colour cue', () => {
  assert.equal(seriesStrokeDash(1), undefined);
  assert.equal(seriesStrokeDash(3), undefined);
  assert.equal(seriesStrokeDash(4), '8 3');
  assert.equal(seriesStrokeDash(7), '2 3');
});

test('splitAtBreaks cuts the line at the break and bridges the gap', () => {
  const points = ['1990', '1991', '1992', '1993'].map((period, i) => ({
    x: i,
    y: 0,
    point: { period, value: i },
  }));
  const { runs, bridges } = splitAtBreaks(points, ['1992']);
  assert.deepEqual(
    runs.map((run) => run.map((p) => p.point.period)),
    [
      ['1990', '1991'],
      ['1992', '1993'],
    ]
  );
  assert.equal(bridges.length, 1);
  assert.deepEqual(
    bridges[0].map((p) => p.point.period),
    ['1991', '1992']
  );
});

test('a series with no breaks is one unbroken run', () => {
  const points = ['1990', '1991'].map((period, i) => ({ x: i, y: 0, point: { period, value: i } }));
  const { runs, bridges } = splitAtBreaks(points, []);
  assert.equal(runs.length, 1);
  assert.equal(bridges.length, 0);
});

test('layout puts the coverage ends at the plot edges and marks zero', () => {
  const s = series();
  const g = CHART_GEOMETRY.wide;
  const layout = layoutReading(s, s.readings[0], 'wide');

  const first = layout.lines[0].runs[0][0];
  const last = layout.lines[0].last;
  assert.equal(Number(first.x.toFixed(4)), g.left);
  assert.equal(Number(last.x.toFixed(4)), g.left + g.plotWidth);

  // The shared time-series renderer never leaves the x-axis as anonymous
  // positions: it labels the calendar years represented by the source dates.
  assert.deepEqual(layout.timeTicks.map((tick) => tick.label), ['1990', '1991', '1992', '1993']);

  assert.ok(layout.zeroY !== null);
  assert.ok(layout.zeroY! > g.top && layout.zeroY! < g.top + g.plotHeight);
  assert.equal(layout.breaks.length, 1);
  assert.ok(layout.lines[0].bridges.length === 1);
});

test('both size variants use the same value scale', () => {
  const s = series();
  const narrow = layoutReading(s, s.readings[0], 'narrow');
  const wide = layoutReading(s, s.readings[0], 'wide');
  assert.deepEqual(
    narrow.valueTicks.map((t) => t.value),
    wide.valueTicks.map((t) => t.value)
  );
});

test('the narrow variant drops tick labels but never the zero one', () => {
  const s = series();
  const narrow = layoutReading(s, s.readings[0], 'narrow');
  const zero = narrow.valueTicks.find((t) => t.value === 0);
  assert.equal(zero?.label, '0');
  assert.ok(narrow.valueTicks.some((t) => t.label === null));
});

test('pathFor emits plain segments, never a smoothing curve', () => {
  const d = pathFor([
    { x: 0, y: 1, point: { period: '1990', value: 1 } },
    { x: 2, y: 3, point: { period: '1991', value: 2 } },
  ]);
  assert.equal(d, 'M0.00 1.00 L2.00 3.00');
  assert.ok(!/[CSQTA]/.test(d));
});

test('the data table carries every point of every reading, keyed on period', () => {
  const { columns, rows } = seriesTable(series());
  assert.deepEqual(
    columns.map((c) => `${c.readingId}:${c.name}`),
    ['people:Immigration', 'people:Net migration', 'share:Immigration']
  );
  assert.deepEqual(
    rows.map((r) => r.period),
    ['1990', '1991', '1992', '1993']
  );
  assert.deepEqual(rows[0].cells, ['100', '−50', '0.10%']);
});

test('a period a reading does not cover leaves an empty cell rather than a wrong one', () => {
  const s = series();
  s.readings[1].lines[0].points = s.readings[1].lines[0].points.slice(2);
  const { rows } = seriesTable(s);
  assert.equal(rows[0].cells[2], null);
  assert.equal(rows[2].cells[2], '0.30%');
});
