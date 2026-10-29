import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTopic } from '@/lib/content/load';
import type { Series } from '@/lib/content/types';
import { validateTopic } from '@/lib/content/validate';
import { BRENT_FOCUS_WINDOW } from '@/components/report/stories/fixtures/series-capabilities';
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

/** WTI alone, with an estimate in 1987 and forecasts for 1989–1990. */
function statusSeries(): Series {
  const s = oilSeries();
  s.coverage = { ...s.coverage, note: 'STEO forecast of September 1989' };
  s.readings[0].lines = [{
    name: 'WTI',
    points: yearly(1986, 1990).map(p => ({ ...p, status: p.period === '1987' ? 'estimate' as const : p.period >= '1989' ? 'forecast' as const : undefined })),
  }];
  return s;
}

test('estimates and forecasts are marked in the table and named in a key line', () => {
  const html = renderChart(statusSeries());
  assert.match(html, /<td>7 \(<abbr title="estimate">est\.<\/abbr>\)<\/td>/);
  assert.match(html, /<td>9 \(<abbr title="forecast">forecast<\/abbr>\)<\/td>/);
  assert.match(html, /Dotted: estimates or provisional values\. Shaded: forecasts \(STEO forecast of September 1989\)\./);
  assert.match(html, />Forecast<\/text>/);
  assert.match(html, /1 value is an estimate or provisional and 2 are forecasts from 1989\./);
});

test('a "not measured since" band has a key line, a final table row and a description sentence', () => {
  const s = oilSeries();
  s.readings[0].lines = [s.readings[0].lines[0]];
  s.notMeasuredSince = { label: 'Not verified since access ended', note: 'Inspectors left.', until: '1992-10-29', source: 1 };
  const html = renderChart(s);
  assert.match(html, /Hatched: Not verified since access ended, 1990 – 29 Oct 1992\. <a data-evidence-link="true" href="#oil--price-not-measured">Why<\/a>/);
  assert.match(html, /<tr data-unmeasured=""><th scope="row">1990–29 Oct 1992<\/th><td colSpan="1">Not measured: Not verified since access ended<\/td><\/tr>/);
  assert.match(html, /No values after 1990: Not verified since access ended\./);
  assert.match(html, /fill="url\(#sv-chart-oil-price-desc-wide-hatch\)"/);
});

test('a focus window renders the strip, both plots with the full range hidden, and says so in words', () => {
  const html = renderChart(BRENT_FOCUS_WINDOW);
  assert.match(html, /<div class="sv-chart__context" aria-hidden="true">/);
  assert.match(html, /Below: 27 Oct 2025–27 Oct 2026, of the full range May 1987–Oct 2026/);
  assert.match(html, /<div data-focus-view="window">/);
  assert.match(html, /<div data-focus-view="full" hidden="">/);
  assert.equal((html.match(/class="sv-chart__svg" data-variant="wide" data-window=""/g) ?? []).length, 1);
  assert.match(html, /The graph shows 27 Oct 2025–27 Oct 2026; a strip above it shows the full published range 20 May 1987–27 Oct 2026\./);
  assert.match(html, /All 9,117 daily values, 20 May 1987–27 Oct 2026\. The graph shows 27 Oct 2025–27 Oct 2026/);
  // Every value is in the table, undecimated: one row per trading day.
  assert.equal((html.match(/<tr><th scope="row">/g) ?? []).length, 9117);
});

test('the Brent fixture passes the series rules', () => {
  const fact = { id: 'brent', claim: 'Claim.', status: 'well-supported' as const, sources: [source], body: 'Body.', series: BRENT_FOCUS_WINDOW };
  const viewpoint = (id: string) => ({ id, name: id, summary: 's', order: 1, body: 'b' });
  const errors = validateTopic({ slug: 't', title: 'T', subtitle: 'S', lastUpdated: '2026-10-29', intro: '', facts: [fact], viewpoints: [viewpoint('a'), viewpoint('b')], principles: [], cruxes: [] });
  assert.deepEqual(errors, []);
});

test('a preview draws every reading, without the Graph/Table switch, and links out to the fact page', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-against-the-long-run')!;
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: fact.id, series: fact.series!, preview: { href: '/topics/uk-immigration/facts/immigration-against-the-long-run' } }));
  for (const reading of fact.series!.readings) assert.match(html, new RegExp(`<h3 class="sv-graph-heading">${reading.label}</h3>`));
  assert.match(html, new RegExp(`<h3 class="sv-chart__title">${fact.series!.title}</h3>`));
  assert.doesNotMatch(html, /aria-pressed/);
  assert.match(html, /href="\/topics\/uk-immigration\/facts\/immigration-against-the-long-run#source-immigration-against-the-long-run-\d+"/);
  assert.doesNotMatch(html, /href="#/);
});
