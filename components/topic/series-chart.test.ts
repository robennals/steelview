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

test('a line with its own source is credited after the reading\'s source, numbered after every reading source', () => {
  const s = oilSeries();
  s.readings[0].lines[1].source = { ...source, publisher: 'Brent publisher' };
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: 'oil', series: s, sourceOffset: 2 }));
  assert.match(html, /Sources: <span><a href="#source-oil-3">Example publisher \[3\]<\/a><\/span><span>; <a href="#source-oil-4">Brent publisher \[4\]<\/a><\/span>/);
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
  const viewpoint = (id: string) => ({ id, name: id, shortName: id, summary: 's', order: 1, body: 'b' });
  const errors = validateTopic({ slug: 't', title: 'T', subtitle: 'S', lastUpdated: '2026-10-29', firstPublished: '2026-08-18', intro: '', facts: [fact], viewpoints: [viewpoint('a'), viewpoint('b')], principles: [], cruxes: [] });
  assert.deepEqual(errors, []);
});

test('a preview draws one reading, without the Graph/Table switch, and links out to the fact page', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-against-the-long-run')!;
  const [people, share] = fact.series!.readings;
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: fact.id, series: fact.series!, preview: { href: '/topics/uk-immigration/facts/immigration-against-the-long-run', reading: share.id } }));
  // Title and graph only: the reading's own label and the credit stay on the full chart.
  assert.doesNotMatch(html, new RegExp(`>${share.label}<`));
  assert.doesNotMatch(html, new RegExp(`>${people.label}<`));
  assert.doesNotMatch(html, /sv-chart__credit/);
  assert.match(html, /data-variant="preview"/);
  assert.match(html, new RegExp(`<figcaption class="sv-chart__caption"><h3 class="sv-graph-heading"><a href="/topics/uk-immigration/facts/immigration-against-the-long-run">${fact.series!.title}</a></h3>`));
  assert.doesNotMatch(html, /aria-pressed/);
  assert.doesNotMatch(html, /href="#/);
});

test('a preview\'s screen-reader description mentions no event strip or method-change section it does not draw', async () => {
  const topic = await loadTopic('us-iran-war');
  const fact = topic.facts.find(f => f.series?.events.length)!;
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: fact.id, series: fact.series!, preview: { href: '/x' } }));
  assert.doesNotMatch(html, /numbered on a strip/);
  assert.doesNotMatch(html, /Method Changes below/);
});

test('a preview with nowhere to link draws its title as plain text', () => {
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: 'oil', series: oilSeries(), preview: {} }));
  assert.match(html, /<h3 class="sv-graph-heading">[^<]+<\/h3>/);
});

test('About this data names a reading’s table and a line’s own coverage note', () => {
  const s = oilSeries();
  s.readings[0].valuesFrom = 'EIA spot price table, column B';
  s.readings[0].lines[1].coverage = { from: '1987', to: '1990', note: 'ICE Brent from its first published day.' };
  const about = renderChart(s).match(/<details class="sv-chart__methodology"[\s\S]*?<\/details>/)?.[0] ?? '';
  assert.match(about, /<h3 class="sv-chart__reading-head">In dollars<\/h3><p class="sv-chart__note">Values from EIA spot price table, column B\.<\/p>/);
  assert.match(about, /<strong>Brent:<\/strong> ICE Brent from its first published day\./);
});

/** Oil prices read two ways, with two dated events and a definitional break. */
function twoPanelSeries(): Series {
  const s = oilSeries();
  s.events = [{ period: '1987', label: 'Cartel meets', sources: [] }, { period: '1989', label: 'Pipeline opens', sources: [] }];
  s.breaks = [{ period: '1988', label: 'New benchmark', note: 'The benchmark changed.' }];
  s.readings = [s.readings[0], { ...s.readings[0], id: 'index', label: 'As an index' }];
  return s;
}

test('every panel carries its own cards, numbering events and measurement changes together by date', () => {
  const html = renderChart(twoPanelSeries());
  for (const panel of html.split('<section class="sv-chart__reading"').slice(1)) {
    const cards = [...panel.matchAll(/popover="auto" role="dialog" aria-label="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(cards, ['Event: Cartel meets', 'Measurement change: New benchmark', 'Event: Pipeline opens']);
  }
});

test('every marker sits on its own dotted line, drawn in each shape of the plot', () => {
  const html = renderChart(twoPanelSeries());
  const [first] = html.split('<section class="sv-chart__reading"').slice(1);
  // One line per marker in each of the two shapes.
  assert.equal(first.match(/<line class="sv-chart__marker-line"/g)?.length, 6);
  assert.equal(first.match(/<line class="sv-chart__marker-line" data-kind="method"/g)?.length, 2);
  assert.doesNotMatch(first, /class="sv-chart__break"/);
  assert.equal(first.match(/<button[^>]*class="sv-markers__marker"/g)?.length, 6);
});

test('a measurement change credits the series source, and has no Method Changes entry', async () => {
  const { FactCharts } = await import('./fact-figures');
  const fact = { id: 'oil', claim: 'Claim.', status: 'well-supported' as const, sources: [source], body: 'Body.', series: twoPanelSeries() };
  const html = renderToStaticMarkup(createElement(FactCharts, { fact }));
  assert.doesNotMatch(html, /<summary>Method Changes<\/summary>/);
  // Citation 2: the fact's one source, then the series source.
  const card = html.match(/data-kind="method" data-marker="2">[\s\S]*?<\/button><\/div>/)?.[0] ?? '';
  assert.match(card, /The benchmark changed\./);
  assert.match(card, /#source-oil-2/);
});

test('a focus window marks only what is inside it, and says how many are not', () => {
  const s = twoPanelSeries();
  s.readings = [s.readings[0]];
  s.focus = { from: '1988', to: '1990', label: 'Recent' };
  const html = renderChart(s);
  const view = (name: string) => html.split(`data-focus-view="${name}"`)[1];
  assert.equal(view('window').split('data-focus-view')[0].match(/popover="auto"/g)?.length, 2);
  assert.match(view('window'), /1 more marked outside this period, shown under Full range\./);
  assert.equal(view('full').match(/popover="auto"/g)?.length, 3);
});
