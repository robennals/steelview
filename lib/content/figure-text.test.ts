import { test } from 'node:test';
import assert from 'node:assert/strict';
import { figureExamplesFact } from './__fixtures__/figure-examples';
import { chartProse, figureProse, figureValues } from './figure-text';
import type { Figure, FigureKind, FigureOf } from './types';

const fact = figureExamplesFact();

function figureOf<K extends FigureKind>(kind: K): FigureOf<K> {
  const found = fact.figures?.find((f): f is FigureOf<K> => f.kind === kind);
  if (!found) throw new Error(`no ${kind} figure`);
  return found;
}

test('references have no prose or values of their own', () => {
  for (const figure of [{ kind: 'series' }, { kind: 'comparison', id: 'x' }, { kind: 'featured', fact: 'y' }, { kind: 'section', id: 'z' }] satisfies Figure[]) {
    assert.deepEqual(figureProse(figure), []);
    assert.deepEqual(figureValues(figure), []);
  }
});

test('table prose: title, description, caption, column labels and every string cell, cited or plain', () => {
  const prose = figureProse(figureOf('dataTable'));
  assert.ok(prose.includes('Federal voting laws and bills on registration and ID, 1965–2026'));
  assert.ok(prose.includes('One row per law, bill or ruling'));
  assert.ok(prose.includes('Law, bill or ruling'));
  assert.ok(prose.includes('1965'));
  assert.ok(prose.includes('Passed House, 220–208, 10 Apr 2025'));
});

test('a row\'s detail is prose, in a figure and, for the advisory, in a comparison', () => {
  const bars = fact.figures?.find((f): f is FigureOf<'barChart'> => f.kind === 'barChart' && f.id === 'wa-by-race');
  assert.ok(bars && figureProse(bars).includes("The State Auditor's name for the group"));
  const comparison = chartProse(fact).find(c => c.chart === 'comparison senate-votes');
  assert.ok(comparison?.prose.includes('As the roll call records it'));
});

test('prose leaves out verbatim quotes and claims, and asPublished', () => {
  const quotes = figureProse(figureOf('quotes'));
  assert.ok(quotes.includes("What did the strikes do to Iran's enriched uranium?"));
  assert.ok(quotes.includes('Secretary of Defense'));
  assert.ok(quotes.includes('Report to the Board of Governors'));
  assert.ok(!quotes.some(s => s.includes("we're watching")));
  const claim = figureProse(figureOf('claimCheck'));
  assert.deepEqual(claim, [figureOf('claimCheck').finding]);
  assert.ok(!figureProse(figureOf('keyFigures')).includes('more than 7,200'));
});

test('prose covers each kind\'s reader-facing strings', () => {
  assert.ok(figureProse(figureOf('keyFigures')).includes('November 2020 general election'));
  assert.ok(figureProse(figureOf('timeline')).includes('Assadi convicted in Antwerp'));
  const periods = figureProse(figureOf('periodTimeline'));
  assert.ok(periods.includes('US naval blockade') && periods.includes('First blockade') && periods.includes('Letter says hostilities "have terminated"'));
  assert.ok(figureProse(figureById('map', 'rejection-by-state')).some(s => s.startsWith('Fixture: only six states')));
  assert.ok(figureProse(figureOf('compositionBar')).includes('HRANA, 7 Apr'));
  assert.ok(figureProse(figureOf('estimateRange')).includes('Department of Defense'));
  const secrecy = fact.figures?.find((f): f is FigureOf<'quotes'> => f.kind === 'quotes' && f.id === 'postal-secrecy');
  assert.ok(secrecy);
  const secrecyProse = figureProse(secrecy);
  assert.ok(secrecyProse.includes('Who is speaking') && secrecyProse.includes('Government reviews'));
  assert.ok(secrecyProse.some(s => s.startsWith('With postal voting, public control')), 'a translation is prose');
  assert.ok(!secrecyProse.some(s => s.startsWith('Bei der Briefwahl')), 'the verbatim quote is not');
  assert.ok(figureProse(figureOf('pullQuote')).includes('The same report found "no evidence of extensive fraud" in US elections.'));
  assert.deepEqual(figureProse(figureOf('caveatList')).slice(0, 3), ['Detected fraud is a floor, not a measure', 'Household pressure', 'Pressure inside a home is rarely reported, so it rarely becomes a case.']);
});

test('key figure values carry their own citation and asPublished', () => {
  assert.deepEqual(figureValues(figureOf('keyFigures'))[0], {
    where: 'key figure "signatures re-examined"',
    value: 7200,
    format: { unit: 'count' },
    citations: [11],
    asPublished: 'more than 7,200',
    valuesFrom: undefined,
  });
});

test('map data falls back to the figure\'s sources and carries its valuesFrom', () => {
  const values = figureValues(figureById('map', 'rejection-by-state'));
  assert.equal(values.length, 6);
  assert.deepEqual(values[0], {
    where: 'map area AR',
    value: 8.8,
    format: { unit: 'percent', decimals: 1 },
    citations: [5],
    asPublished: '8.8%',
    valuesFrom: 'EAVS 2024 Overview Table 1',
  });
  assert.equal(values[1].asPublished, undefined);
});

test('bars, composition parts and estimate bounds are each one value', () => {
  assert.deepEqual(figureValues(figureOf('barChart')).map(v => v.value), [2.49, 1.59, 1.57, 1.24, 0.63]);
  const parts = figureValues(figureOf('compositionBar'));
  assert.deepEqual(parts.map(v => [v.where, v.citations]), [
    ['composition row "HRANA, 7 Apr" civilian', [12]],
    ['composition row "HRANA, 7 Apr" military', [12]],
    ['composition row "HRANA, 7 Apr" unclassified', [12]],
    ['composition row "Hengaw, 8 Apr" civilian', [13]],
    ['composition row "Hengaw, 8 Apr" other', [13]],
  ]);
  assert.deepEqual(figureValues(figureOf('estimateRange')).map(v => v.where), [
    'estimate "AEI" low', 'estimate "AEI" high',
    'estimate "CSIS" estimate', 'estimate "CSIS" low', 'estimate "CSIS" high',
    'estimate "CBO" estimate', 'estimate "Department of Defense" estimate',
  ]);
});

test('a percent composition bar is traced as the published percentages, whatever its countFormat', () => {
  const bar: FigureOf<'compositionBar'> = {
    kind: 'compositionBar',
    id: 'gain',
    title: 't',
    description: 'd',
    sources: [2],
    rowLabel: 'Cohort',
    unit: 'percent',
    countFormat: { unit: 'count' },
    categories: [{ key: 'top', label: 'Top' }, { key: 'rest', label: 'Rest' }],
    rows: [{ label: 'All', values: { top: 72.25, rest: 27.75 }, sources: [] }],
  };
  assert.deepEqual(figureValues(bar).map(v => [v.where, v.value, v.format]), [
    ['composition row "All" top', 72.25, { unit: 'percent', decimals: 4 }],
    ['composition row "All" rest', 27.75, { unit: 'percent', decimals: 4 }],
  ]);
  assert.deepEqual(figureValues({ ...bar, unit: 'count' }).map(v => v.format), [{ unit: 'count' }, { unit: 'count' }]);
});

test('numeric table cells are values; a cited cell uses its own sources', () => {
  const table: FigureOf<'dataTable'> = {
    kind: 'dataTable',
    id: 'counts',
    title: 't',
    description: 'd',
    caption: 'One row per state',
    sources: [3],
    highlight: [],
    valuesFrom: 'Table 2',
    columns: [{ key: 'state', label: 'State', rowHeader: true }, { key: 'n', label: 'Count', format: { unit: 'count' } }],
    rows: [{ state: 'Texas', n: 1200 }, { state: 'Ohio', n: { value: 900, sources: [4], asPublished: 'about 900' } }, { state: 'Utah', n: null }],
  };
  assert.deepEqual(figureValues(table), [
    { where: 'table row "Texas" column n', value: 1200, format: { unit: 'count' }, citations: [3], asPublished: undefined, valuesFrom: 'Table 2' },
    { where: 'table row "Ohio" column n', value: 900, format: { unit: 'count' }, citations: [4], asPublished: 'about 900', valuesFrom: 'Table 2' },
  ]);
  assert.deepEqual(figureValues(figureOf('dataTable')), []);
});

/** The fixture's figure of `kind` with this id. */
function figureById<K extends FigureKind>(kind: K, id: string): FigureOf<K> {
  const found = fact.figures?.find((f): f is FigureOf<K> => f.kind === kind && 'id' in f && f.id === id);
  if (!found) throw new Error(`no ${kind} figure ${id}`);
  return found;
}

test('categorical map prose: category labels and area notes, but not bare slugs', () => {
  const prose = figureProse(figureById('map', 'voter-id-rules'));
  assert.ok(prose.includes('ID asked of voters at the polls, by state, 2026'));
  assert.ok(prose.includes('Strict photo ID') && prose.includes('No document requested'));
  assert.ok(prose.includes('A free voter ID card is issued on request'));
  assert.ok(prose.includes('First-time voters show ID'));
  assert.ok(!prose.includes('strict-photo'));
});

test('map prose adds inset labels', () => {
  const prose = figureProse(figureById('map', 'postal-voting'));
  assert.ok(prose.includes('Some voters'));
  assert.ok(prose.includes('Voters who cannot attend a polling place'));
  assert.ok(prose.includes('Luxembourg'));
});

test('scatter prose: point names and notes, and group labels', () => {
  const prose = figureProse(figureOf('scatterPlot'));
  assert.ok(prose.includes('Arizona') && prose.includes('North Carolina'));
  assert.ok(prose.includes('73 hours in 2020.'));
  assert.ok(prose.includes('Mostly mail'));
  assert.ok(!prose.includes('147 hours'));
});

test('a categorical map draws no numbers', () => {
  assert.deepEqual(figureValues(figureById('map', 'voter-id-rules')), []);
  assert.deepEqual(figureValues(figureById('map', 'postal-voting')), []);
});

test('a numeric map\'s data are values, whichever view it opens on', () => {
  const map: FigureOf<'map'> = {
    kind: 'map',
    id: 'share',
    title: 't',
    description: 'd',
    sources: [2],
    preset: 'uk-regions',
    default: 'map',
    areaLabel: 'Region',
    highlight: [],
    valueLabel: 'Share',
    format: { unit: 'percent' },
    data: { london: { value: 41, asPublished: '41 per cent' }, wales: 7 },
  };
  assert.deepEqual(figureValues(map), [
    { where: 'map area london', value: 41, format: { unit: 'percent' }, citations: [2], asPublished: '41 per cent', valuesFrom: undefined },
    { where: 'map area wales', value: 7, format: { unit: 'percent' }, citations: [2], asPublished: undefined, valuesFrom: undefined },
  ]);
});

test('a scatter point is two values, x and y, each with its own asPublished', () => {
  const values = figureValues(figureOf('scatterPlot'));
  assert.equal(values.length, 10);
  assert.deepEqual(values.slice(0, 2), [
    { where: 'point "Arizona" x', value: 14, format: { unit: 'number' }, citations: [29, 30], asPublished: undefined, valuesFrom: undefined },
    { where: 'point "Arizona" y', value: 147, format: { unit: 'number' }, citations: [29, 30], asPublished: '147 hours', valuesFrom: undefined },
  ]);
});

test('quotes, timelines and caveats draw no numbers', () => {
  for (const kind of ['timeline', 'periodTimeline', 'quotes', 'pullQuote', 'claimCheck', 'caveatList'] as const) {
    assert.deepEqual(figureValues(figureOf(kind)), [], kind);
  }
});

test('a qualified value is traced by its own wording; a range by both its ends', () => {
  const bars = fact.figures?.find((f): f is FigureOf<'barChart'> => f.kind === 'barChart' && f.id === 'deaths-by-region');
  assert.ok(bars);
  assert.deepEqual(figureValues(bars).map(v => [v.where, v.value, v.asPublished]), [
    ['bar "North"', 159, 'at least 159'],
    ['bar "West"', 40, 'fewer than 40'],
    ['bar "South"', 90, 'about 90'],
    ['bar "East" low', 60, 'between 60 and 80'],
    ['bar "East" high', 80, 'between 60 and 80'],
    ['bar "Capital"', 120, undefined],
  ]);
});

test('a range table cell is two values, each citing the cell\'s sources', () => {
  const table: FigureOf<'dataTable'> = {
    kind: 'dataTable', id: 't', title: 't', description: 'd', sources: [1], caption: 'c', highlight: [],
    columns: [{ key: 'name', label: 'Name' }, { key: 'share', label: 'Share', format: { unit: 'percent' } }],
    rows: [{ name: 'A', share: { low: 4, high: 6, sources: [3] } }, { name: 'B', share: { value: 5, qualifier: 'about', asPublished: 'about 5%' } }],
  };
  assert.deepEqual(figureValues(table).map(v => [v.where, v.value, v.citations, v.asPublished]), [
    ['table row "A" column share low', 4, [3], undefined],
    ['table row "A" column share high', 6, [3], undefined],
    ['table row "B" column share', 5, [1], 'about 5%'],
  ]);
});

test('a date column\'s years are not audited as figures', () => {
  const table = { ...figureOf('dataTable'), columns: [{ key: 'year', label: 'Year', format: 'date' as const }, { key: 'count', label: 'Count', format: { unit: 'count' as const } }], rows: [{ year: 2025, count: 7 }] };
  assert.deepEqual(figureValues(table).map(v => v.where), ['table row "2025" column count']);
});

test('a composition row\'s stated total is a value like its parts', () => {
  const composition = { ...figureOf('compositionBar'), rows: [{ label: 'r', values: { civilian: 2, military: 3 }, total: 5, sources: [12] }] };
  assert.deepEqual(figureValues(composition).map(v => v.where), ['composition row "r" civilian', 'composition row "r" military', 'composition row "r" total']);
});

test('a paired bar row is one value per measure, its qualified ones by their own wording', () => {
  const paired = fact.figures?.find((f): f is FigureOf<'barChart'> => f.kind === 'barChart' && f.id === 'hours-to-count');
  assert.ok(paired);
  assert.deepEqual(figureValues(paired).slice(-3).map(v => [v.where, v.value, v.asPublished]), [
    ['bar "Pennsylvania" y2024', 8, undefined],
    ['bar "Georgia" y2020', 18, 'at least 18 hours'],
    ['bar "Georgia" y2024', 5, 'about 5'],
  ]);
  assert.ok(figureProse(paired).includes('2024'));
});

test('a slice explorer\'s numbers are its rows\' measures; its prose its labels and each dimension value once', () => {
  const slices = figureOf('sliceExplorer');
  const values = figureValues(slices);
  assert.equal(values.length, 10);
  assert.deepEqual(values[0], { where: 'slice row "House, 15 Sep 2026, Republican, Yes" members', value: 7, format: { unit: 'count' }, citations: [38], asPublished: undefined, valuesFrom: undefined });
  const prose = figureProse(slices);
  assert.equal(prose.filter(s => s === 'House, 15 Sep 2026').length, 1);
  assert.ok(prose.includes('Members voting') && prose.includes('roll calls'));
});

test('small-multiple points are values, a panel with its own source traced to it', () => {
  const multiples = figureOf('smallMultiples');
  const values = figureValues(multiples);
  assert.equal(values.length, 19);
  assert.deepEqual(values[0], { where: 'panel "Strait of Hormuz" 2026-06', value: 31, format: { unit: 'number', decimals: 0 }, citations: [39], asPublished: undefined, valuesFrom: undefined });
  assert.deepEqual(values.at(-1)?.citations, [40]);
  assert.ok(figureProse(multiples).includes('Kerch Strait') && figureProse(multiples).includes('The counter began in July 2026.'));
});
