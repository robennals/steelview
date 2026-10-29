import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTopic } from '@/lib/content/load';
import type { Series } from '@/lib/content/types';
import { SeriesChart } from './series-chart';

// Depends on authored us-voter-id content: the fact
// `voter-id-rules-in-the-us-and-abroad` carries the NCSL ID-law series whose
// period label is "Year of NCSL count".
test('the axis caption keeps an acronym in the period label', async () => {
  const topic = await loadTopic('us-voter-id');
  const fact = topic.facts.find(f => f.id === 'voter-id-rules-in-the-us-and-abroad');
  assert.ok(fact?.series, 'expected the ID-law series');
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: fact.id, series: fact.series }));
  assert.match(html, /<p class="sv-chart__axis-label">[^<]*, by year of NCSL count<\/p>/);
});

const source = {
  stance: 'supports' as const,
  quote: 'q',
  title: 't',
  url: 'https://example.org/data.xlsx',
  publisher: 'Example publisher',
  date: '2024',
};

const yearly = (from: number, to: number, value = (year: number) => year - 1980) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ period: String(from + i), value: value(from + i) }));

/** WTI from 1986 beside Brent from 1987, on one axis. */
function oilSeries(): Series {
  return {
    title: 'Oil prices',
    description: 'Two benchmarks.',
    periodLabel: 'Year',
    coverage: { from: '1986', to: '1990' },
    breaks: [],
    events: [],
    source,
    readings: [{
      id: 'price',
      label: 'In dollars',
      unit: 'count',
      valueLabel: 'Dollars a barrel',
      lines: [
        { name: 'WTI', points: yearly(1986, 1990) },
        { name: 'Brent', coverage: { from: '1987', to: '1990' }, points: yearly(1987, 1990) },
      ],
    }],
  };
}

const renderChart = (series: Series) => renderToStaticMarkup(createElement(SeriesChart, { factId: 'oil', series }));

test('a line with its own range names it in the legend, the table and About this data', () => {
  const html = renderChart(oilSeries());
  assert.match(html, /<span class="sv-chart__key-name">Brent \(from 1987\)<\/span>/);
  assert.match(html, /<span class="sv-chart__key-name">WTI<\/span>/);
  assert.match(html, /— : outside this source’s published range<\/caption>/);
  assert.match(html, /<th scope="row">1986<\/th><td>6<\/td><td data-outside="true">—<\/td>/);
  assert.match(html, /WTI, 1986–1990; Brent, 1987–1990/);
});
