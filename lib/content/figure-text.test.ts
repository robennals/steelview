import { test } from 'node:test';
import assert from 'node:assert/strict';
import { figureExamplesFact } from './__fixtures__/figure-examples';
import { figureProse, figureValues } from './figure-text';
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

test('prose leaves out verbatim quotes and claims, and asPublished', () => {
  const quotes = figureProse(figureOf('quoteComparison'));
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
  assert.ok(figureProse(figureOf('tileMap')).some(s => s.startsWith('Fixture: only six states')));
  assert.ok(figureProse(figureOf('compositionBar')).includes('HRANA, 7 Apr'));
  assert.ok(figureProse(figureOf('estimateRange')).includes('Department of Defense'));
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
  const values = figureValues(figureOf('tileMap'));
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

test('quotes, timelines and caveats draw no numbers', () => {
  for (const kind of ['timeline', 'periodTimeline', 'quoteComparison', 'pullQuote', 'claimCheck', 'caveatList'] as const) {
    assert.deepEqual(figureValues(figureOf(kind)), [], kind);
  }
});
