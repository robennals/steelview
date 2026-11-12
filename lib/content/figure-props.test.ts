import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EUROPE_COUNTRIES, EUROPE_EXTENT } from '@/components/report/geo/europe-countries';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, US_TERRITORY_TILES } from '@/components/report/geo/tiles';
import { UK_ITL1_REGIONS } from '@/components/report/geo/uk-itl1';
import { US_STATES } from '@/components/report/geo/us-states';
import { WORLD_COUNTRIES, WORLD_EXTENT } from '@/components/report/geo/world-countries';
import { WORLD_COUNTRY_TILES } from '@/components/report/geo/world-tiles';
import { figureExamplesFact } from './__fixtures__/figure-examples';
import {
  areaMapProps,
  barChartProps,
  caveatListProps,
  claimCheckProps,
  compositionBarProps,
  dataTableProps,
  estimateRangeProps,
  figureContext,
  keyFiguresProps,
  pairedBarChartProps,
  periodTimelineProps,
  pullQuoteProps,
  quoteBrowserProps,
  quoteComparisonProps,
  scatterPlotProps,
  sliceExplorerProps,
  smallMultiplesProps,
  timelineProps,
  toValueFormat,
} from './figure-props';
import type { Fact, FigureKind, FigureOf } from './types';

const fact = figureExamplesFact();
const context = figureContext(fact, '2026-10-29');

/** The fixture's first figure of `kind`, or the one with `id`. */
function figureOf<K extends FigureKind>(kind: K, id?: string): FigureOf<K> {
  const found = fact.figures?.find((f): f is FigureOf<K> => f.kind === kind && (id === undefined || ('id' in f && f.id === id)));
  if (!found) throw new Error(`no ${kind} figure`);
  return found;
}

test('a citation becomes a credit naming its publisher and linking to its numbered reference', () => {
  assert.deepEqual(context.credit(11), { label: 'Washington State Auditor', href: '#source-figure-examples-11', number: 11 });
});

test('ids carry the fact prefix, the same scheme as comparisons', () => {
  assert.equal(dataTableProps(figureOf('dataTable'), context).id, 'figure-examples--chart-federal-laws');
  assert.equal(barChartProps(figureOf('barChart'), context).id, 'figure-examples--chart-wa-by-race');
  assert.equal(quoteComparisonProps(figureOf('quotes', 'damage-claims'), context).id, 'figure-examples--chart-damage-claims');
});

test('quote ids are numbered within their figure, so quote anchors stay unique on the page', () => {
  assert.deepEqual(quoteComparisonProps(figureOf('quotes', 'damage-claims'), context).quotes.map(q => q.id), [
    'figure-examples--damage-claims-1', 'figure-examples--damage-claims-2', 'figure-examples--damage-claims-3',
  ]);
  assert.equal(pullQuoteProps(figureOf('pullQuote'), context).quote.id, 'figure-examples--carter-baker-1');
});

test('the source line is the union of figure and item citations, deduplicated and ascending', () => {
  assert.deepEqual(dataTableProps(figureOf('dataTable'), context).sources?.map(s => s.number), [16, 24]);
  assert.deepEqual(periodTimelineProps(figureOf('periodTimeline'), context).sources?.map(s => s.number), [2, 3, 4]);
  assert.deepEqual(estimateRangeProps(figureOf('estimateRange'), context).sources?.map(s => s.number), [14, 15, 16, 17]);
});

test('cited table cells keep their value and turn citations into credits', () => {
  const rows = dataTableProps(figureOf('dataTable'), context).rows;
  assert.deepEqual(rows[0].effect, {
    value: 'Documentary proof of citizenship to register',
    sources: [{ label: 'Brennan Center', href: '#source-figure-examples-24', number: 24 }],
  });
  assert.equal(rows[0].year, '2025');
});

test('a table\'s width passes through, leaving the component to default it by column count', () => {
  const table = figureOf('dataTable');
  assert.equal(dataTableProps(table, context).width, undefined);
  assert.equal(dataTableProps({ ...table, width: 'text' }, context).width, 'text');
});

test('item citations become item credits', () => {
  assert.deepEqual(keyFiguresProps(figureOf('keyFigures'), context).figures[0].sources?.map(s => s.number), [11]);
  assert.deepEqual(keyFiguresProps(figureOf('keyFigures'), context).figures[0].value, { value: 7200, qualifier: 'more than', asPublished: 'more than 7,200' });
  assert.equal(timelineProps(figureOf('timeline'), context).events[2].sources?.[0].label, 'Court of First Instance, Antwerp');
  assert.deepEqual(compositionBarProps(figureOf('compositionBar'), context).rows[1].sources?.map(s => s.number), [13]);
  assert.deepEqual(estimateRangeProps(figureOf('estimateRange'), context).estimates[3].sources?.map(s => s.number), [17]);
  assert.deepEqual(caveatListProps(figureOf('caveatList'), context).items[2].sources?.map(s => s.number), [26]);
});

test('open periods end at the topic\'s lastUpdated; closed ones leave the axis alone', () => {
  const periods = figureOf('periodTimeline');
  assert.equal(periodTimelineProps(periods, context).to, '2026-10-29');
  const closed = { ...periods, rows: periods.rows.map(row => ({ ...row, periods: row.periods.map(p => ({ ...p, to: p.to ?? '2026-10-20' })) })) };
  assert.equal(periodTimelineProps(closed, context).to, undefined);
  assert.equal(periodTimelineProps({ ...periods, to: '2026-12' }, context).to, '2026-12');
  // The component reads "still in force" only when the axis ends on this date.
  assert.equal(periodTimelineProps(periods, context).asOf, '2026-10-29');
});

test('period-timeline events are strip events crediting their citation', () => {
  assert.deepEqual(periodTimelineProps(figureOf('periodTimeline'), context).events, [{
    date: '2026-05-01',
    label: 'Letter says hostilities "have terminated"',
    description: undefined,
    sources: [{ label: 'The White House', href: '#source-figure-examples-4', number: 4 }],
  }]);
});

test('an item citing several sources gets a credit for each, in the order written', () => {
  const timeline = figureOf('timeline');
  const several = { ...timeline, events: timeline.events.map((e, i) => (i === 0 ? { ...e, sources: [9, 3] } : e)) };
  assert.deepEqual(timelineProps(several, context).events[0].sources?.map(s => s.number), [9, 3]);
  const periods = figureOf('periodTimeline');
  const cited = { ...periods, rows: periods.rows.map((row, i) => (i === 0 ? { ...row, periods: row.periods.map(p => ({ ...p, sources: [2, 3] })) } : row)) };
  assert.deepEqual(periodTimelineProps(cited, context).rows[0].periods[0].sources?.map(s => s.label), ['Congressional Research Service', 'US Department of State']);
});

test('qualified bar values and table cells reach the components as written', () => {
  const bars = barChartProps(figureOf('barChart', 'deaths-by-region'), context);
  assert.deepEqual(bars.items.map(item => item.value), [
    { value: 159, qualifier: 'at least', asPublished: 'at least 159' },
    { value: 40, qualifier: 'fewer than', asPublished: 'fewer than 40' },
    { value: 90, qualifier: 'about', asPublished: 'about 90' },
    { low: 60, high: 80, asPublished: 'between 60 and 80' },
    120,
  ]);
  const table = figureOf('dataTable');
  const qualified = { ...table, rows: [{ ...table.rows[0], year: { value: 2025, qualifier: 'about' as const, sources: [24] } }, { ...table.rows[1], year: { low: 1964, high: 1965 } }] };
  const rows = dataTableProps(qualified, context).rows;
  assert.deepEqual(rows[0].year, { value: 2025, qualifier: 'about', asPublished: undefined, sources: [context.credit(24)] });
  assert.deepEqual(rows[1].year, { low: 1964, high: 1965, asPublished: undefined, sources: undefined });
});

test('a key figure\'s sibling qualifier folds into its value', () => {
  const keys = figureOf('keyFigures');
  assert.deepEqual(keyFiguresProps(keys, context).figures.map(f => f.value), [{ value: 7200, qualifier: 'more than', asPublished: 'more than 7,200' }, 98.7]);
  const ranged = { ...keys, figures: [{ ...keys.figures[1], value: { low: 98, high: 99 } }] };
  assert.deepEqual(keyFiguresProps(ranged, context).figures[0].value, { low: 98, high: 99 });
});

test('a tileMap is a map that opens on its tiles, its preset resolved to tiles and shapes, bare numbers to data', () => {
  const map = figureOf('map', 'rejection-by-state');
  assert.equal(map.default, 'tiles');
  assert.equal(map.preset, 'us-states');
  const props = areaMapProps(map, context);
  assert.equal(props.defaultView, 'tiles');
  assert.deepEqual(props.tiles, US_STATE_TILES);
  assert.deepEqual(props.regions.map(r => r.id), US_STATE_TILES.map(t => t.id), 'one shape per tile, in tile order');
  assert.deepEqual(props.contextRegions, []);
  assert.ok(props.data, 'a numeric map keeps its data');
  assert.deepEqual(props.data.DE, { value: 5.1 });
  assert.deepEqual(props.data.AR, { value: 8.8, asPublished: '8.8%' });
  assert.equal(props.note?.endsWith('Values from EAVS 2024 Overview Table 1.'), true);
});

test('the US territories join both views only when the figure names one', () => {
  const map = figureOf('map', 'rejection-by-state');
  const props = areaMapProps({ ...map, data: { ...map.data, PR: 1 } }, context);
  assert.deepEqual(props.tiles, [...US_STATE_TILES, ...US_TERRITORY_TILES]);
  assert.deepEqual(props.regions.slice(-5).map(r => [r.id, r.point !== undefined]), ['GU', 'MP', 'AS', 'PR', 'VI'].map(id => [id, true]));
});

test('a categorical map turns bare slugs into assignments and keeps notes', () => {
  const props = areaMapProps(figureOf('map', 'voter-id-rules'), context);
  assert.ok(props.categoryData, 'a categorical map has category data');
  assert.equal(props.data, undefined);
  assert.equal(props.categoryLabel, 'ID asked of voters at the polls');
  assert.deepEqual(props.categoryData.GA, { category: 'strict-photo' });
  assert.deepEqual(props.categoryData.AR, { category: 'strict-photo', note: 'A free voter ID card is issued on request' });
  assert.equal(Object.keys(props.categoryData).length, 51);
  assert.deepEqual(props.categories.map(c => c.mark), ['SP', 'SN', 'P', 'N', '—']);
});

test('a geoMap is a map that opens on its shapes; every preset pairs tiles with shapes, the rest as context', () => {
  const map = figureOf('map', 'postal-voting');
  assert.equal(map.default, 'map');
  const props = areaMapProps(map, context);
  assert.equal(props.id, 'figure-examples--chart-postal-voting');
  assert.equal(props.defaultView, 'map');
  assert.deepEqual(props.tiles, WORLD_COUNTRY_TILES);
  assert.equal(props.regions.length, 197);
  assert.deepEqual((props.contextRegions ?? []).map(r => r.id).sort(), ['AQ', 'CYN', 'EH', 'FK', 'GL', 'NC', 'PR', 'SOL', 'TF']);
  assert.equal(props.extent, WORLD_EXTENT);
  assert.deepEqual(props.highlight, ['US']);
  assert.deepEqual(props.insets, [{ regionIds: ['LU'], label: 'Luxembourg' }]);
  assert.deepEqual(props.categoryData?.AU, { category: 'some', note: 'Voters who cannot attend a polling place' });
  const europe = areaMapProps({ ...map, preset: 'europe' }, context);
  assert.deepEqual(europe.tiles, EUROPE_COUNTRY_TILES);
  assert.equal(europe.regions.length + (europe.contextRegions ?? []).length, EUROPE_COUNTRIES.length);
  assert.equal(europe.extent, EUROPE_EXTENT);
  const uk = areaMapProps({ ...map, preset: 'uk-regions' }, context);
  assert.deepEqual(uk.tiles, UK_REGION_TILES);
  assert.deepEqual(new Set(uk.regions), new Set(UK_ITL1_REGIONS));
  assert.equal(WORLD_COUNTRIES.length, props.regions.length + (props.contextRegions ?? []).length);
  assert.equal(US_STATES.length, 51);
});

test('every preset names an area the same way in both views', () => {
  const map = figureOf('map', 'postal-voting');
  for (const preset of ['us-states', 'europe', 'uk-regions', 'world'] as const) {
    const { tiles, regions } = areaMapProps({ ...map, preset }, context);
    assert.deepEqual(regions.map(r => r.name), tiles.map(t => t.name), preset);
  }
});

test('a numeric map keeps its scale options', () => {
  const props = areaMapProps({
    ...figureOf('map', 'postal-voting'),
    categoryLabel: undefined,
    categories: undefined,
    areas: undefined,
    valueLabel: 'Share',
    format: { unit: 'percent' },
    scale: 'diverging',
    data: { US: 3, GB: { value: 4, label: 'about 4%' } },
  }, context);
  assert.deepEqual(props.data, { US: { value: 3 }, GB: { value: 4, label: 'about 4%' } });
  assert.equal(props.scale, 'diverging');
  assert.deepEqual(props.format, { unit: 'percent' });
});

test('a scatter plot maps axes, groups and points, dropping asPublished', () => {
  const props = scatterPlotProps(figureOf('scatterPlot'), context);
  assert.equal(props.id, 'figure-examples--chart-count-speed');
  assert.deepEqual(props.x, { label: 'Days before Election Day processing may begin', format: { unit: 'number' }, domain: undefined, includeZero: undefined });
  assert.deepEqual(props.points[0], { id: 'az', label: 'AZ', name: 'Arizona', x: 14, y: 147, group: 'mostly-mail', note: '73 hours in 2020.' });
  assert.deepEqual(props.highlight, ['az']);
  assert.deepEqual(props.sources?.map(s => s.number), [29, 30]);
});

test('formats convert to the library type, currency included', () => {
  assert.deepEqual(toValueFormat({ unit: 'currency', currency: 'USD', decimals: 1 }), { unit: 'currency', currency: 'USD', decimals: 1 });
  assert.deepEqual(toValueFormat({ unit: 'percent', decimals: 2 }), { unit: 'percent', decimals: 2 });
});

test('estimates may omit any bound, and a null no-effect value passes through', () => {
  const props = estimateRangeProps(figureOf('estimateRange'), context);
  assert.equal(props.nullValue, null);
  assert.equal(props.itemLabel, 'Estimator');
  assert.deepEqual(props.estimates.map(e => [e.estimate, e.low, e.high]), [[undefined, 25, 35], [40, 34, 42], [38, undefined, undefined], [43.6, undefined, undefined]]);
});

test('claim evidence links like an inline citation: to the parent page when the fact supports another', () => {
  const check = figureOf('claimCheck');
  const facts: Pick<Fact, 'id' | 'supports'>[] = [{ id: 'figure-examples' }, { id: 'mail-ballot-privacy' }];
  assert.equal(claimCheckProps(check, { ...context, slug: 'vbm', facts }).evidence?.href, '/topics/vbm/facts/figure-examples#figure-examples--chart-detected-is-a-floor');
  const supporting = [{ id: 'mail-ballot-privacy', supports: 'mail-voting' }];
  assert.equal(claimCheckProps({ ...check, evidence: { fact: 'mail-ballot-privacy' } }, { ...context, slug: 'vbm', facts: supporting }).evidence?.href, '/topics/vbm/facts/mail-voting#evidence-mail-ballot-privacy');
  assert.equal(claimCheckProps(check, { ...context, slug: 'vbm', facts }).claimSource?.number, 22);
});

test('a quote\'s stance becomes its position, by its category\'s label; language and translation pass through', () => {
  const props = quoteBrowserProps(figureOf('quotes', 'postal-secrecy'), context);
  assert.equal(props.title, 'Does postal voting give up the secrecy of the ballot?');
  assert.equal(props.positionLabel, 'Who is speaking');
  assert.deepEqual(props.quotes.map(q => q.position), ['Courts', 'Courts', 'Government reviews', 'Researchers', 'Researchers']);
  assert.equal(props.quotes[0].lang, 'de');
  assert.match(props.quotes[0].translation ?? '', /^With postal voting/);
  assert.deepEqual(props.sources?.map(s => s.number), [32, 33, 34, 35]);
  assert.equal(quoteComparisonProps(figureOf('quotes', 'damage-claims'), context).quotes[0].position, undefined);
});

test('a bar chart with series becomes paired bars, its end labels and nulls kept', () => {
  const props = pairedBarChartProps(figureOf('barChart', 'pre-vra-registration'), context);
  assert.equal(props.style, 'dumbbell');
  assert.deepEqual(props.series.map(s => s.key), ['earlier', 'latest']);
  assert.deepEqual(props.items[0], { label: 'Alabama', values: { earlier: 14.2, latest: 19.4 }, labels: { earlier: '1958', latest: '1964' }, highlight: undefined, detail: undefined });
  assert.equal(props.id, 'figure-examples--chart-pre-vra-registration');
  assert.throws(() => pairedBarChartProps(figureOf('barChart', 'wa-by-race'), context));
  assert.equal(pairedBarChartProps(figureOf('barChart', 'hours-to-count'), context).items[0].detail, 'Two presidential elections');
  assert.equal(barChartProps(figureOf('barChart', 'wa-by-race'), context).items[1].detail, "The State Auditor's name for the group");
});

test('a slice explorer passes its rows, dimensions and defaults through, and converts measure formats', () => {
  const props = sliceExplorerProps(figureOf('sliceExplorer'), context);
  assert.equal(props.id, 'figure-examples--chart-war-powers-votes');
  assert.equal(props.rows.length, 10);
  assert.equal(props.dimensions[0].combinable, false);
  assert.deepEqual(props.measures, [{ key: 'members', label: 'Members voting', format: { unit: 'count' }, aggregation: undefined }]);
  assert.deepEqual([props.defaultBreakdown, props.defaultSplit], ['party', 'position']);
});

test('small multiples keep panel highlights and own sources, and name each panel\'s coverage note', () => {
  const props = smallMultiplesProps(figureOf('smallMultiples'), context);
  assert.equal(props.panels[0].highlight, true);
  assert.equal(props.panels[0].sources, undefined);
  assert.deepEqual(props.panels[4].sources, [{ label: 'Fixture Ship Tracker', href: '#source-figure-examples-40', number: 40 }]);
  assert.equal(props.note, 'Our monthly means of the daily counts. Kerch Strait: The counter began in July 2026.');
  assert.deepEqual(props.sources?.map(s => s.number), [39, 40]);
});
