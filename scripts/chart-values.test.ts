import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditValue, chartValues, figureRenderings, fromFigureValues, isWeakMatch, type ChartedFact, type ChartValue } from './chart-values';
import { auditTopic, type AuditItem } from './check-figures';
import { quoteCorpus } from './figures';
import { verifiedDerivedFigures } from './derived-figures';
import type { Series, Source } from '../lib/content/types';

const NO_DERIVED = quoteCorpus([]);

function source(quote: string): Source {
  return { stance: 'supports', quote, title: 'T', url: 'https://example.org', publisher: 'P', date: '2024' };
}

function series(quote: string, values: number[], valuesFrom?: string): Series {
  return {
    title: 'Rejections',
    description: 'd',
    periodLabel: 'Year',
    coverage: { from: '2020', to: String(2019 + values.length) },
    breaks: [],
    events: [],
    readings: [{
      id: 'rejection-rate',
      label: 'Rate',
      unit: 'percent',
      valueLabel: '%',
      valuesFrom,
      lines: [{ name: 'Texas', points: values.map((value, i) => ({ period: String(2020 + i), value })) }],
    }],
    source: source(quote),
  };
}

function fact(parts: Partial<ChartedFact>): ChartedFact {
  return { sources: [], ...parts };
}

test('a series point quoted in its reading’s source is quoted', () => {
  const [first, second] = chartValues(fact({ series: series('rejected 3.4 percent of ballots', [3.4, 2.1]) }));
  assert.equal(first.where, 'series reading rejection-rate line Texas 2020');
  assert.equal(auditValue(first, NO_DERIVED), 'quoted');
  assert.equal(auditValue(second, NO_DERIVED), 'untraced');
});

test('a reading’s own source takes the place of the series source', () => {
  const s = series('nothing numeric', [3.4, 2.1]);
  s.readings[0].source = source('3.4% and 2.1%');
  assert.deepEqual(chartValues(fact({ series: s })).map((v) => auditValue(v, NO_DERIVED)), ['quoted', 'quoted']);
});

test('the same value quoted only in another fact is untraced', () => {
  const items: AuditItem[] = [
    { kind: 'fact', id: 'a', body: '', data: { claim: 'c', status: 'well-supported', sources: [source('n/a')], series: series('nothing numeric', [3.4, 2.1]) } },
    { kind: 'fact', id: 'b', body: '', data: { claim: 'c', status: 'well-supported', sources: [source('3.4% and 2.1%')] } },
  ];
  const { values } = auditTopic(items);
  assert.deepEqual(values.map((v) => [v.item, v.verdict]), [['fact/a', 'untraced'], ['fact/a', 'untraced']]);
});

test('a value covered by valuesFrom rests on a named table', () => {
  const [value] = chartValues(fact({ series: series('nothing numeric', [3.4, 2.1], 'EAVS 2024 Overview Table 1') }));
  assert.equal(value.valuesFrom, 'EAVS 2024 Overview Table 1');
  assert.equal(auditValue(value, NO_DERIVED), 'table');
});

test('a value matching a verified ratio-percent derivation is derived', () => {
  const data = {
    sources: [source('317,191 of 585,457 ballots were cured')],
    derivedFigures: [{ method: 'ratio-percent', figure: '54.2%', numerator: 317191, denominator: 585457, decimals: 1 }],
  };
  const derived = quoteCorpus(verifiedDerivedFigures(data));
  const [value] = chartValues(fact({
    sources: data.sources,
    comparisons: [{
      id: 'cured', title: 't', description: 'd', unit: 'percent', valueLabel: '%', sources: [1],
      items: [{ label: 'Cured', value: 54.2 }, { label: 'Not cured', value: 45.8 }],
    }],
  }));
  assert.equal(auditValue(value, derived), 'derived');
});

test('asPublished passes against a quote with the source’s own wording', () => {
  const value: ChartValue = {
    chart: 'figure petitions',
    where: 'figure petitions signatures',
    renderings: ['7,200'],
    asPublished: 'more than 7,200',
    allowedQuotes: ['the petition gathered more than 7,200 signatures'],
  };
  assert.equal(auditValue(value, NO_DERIVED), 'quoted');
  assert.equal(auditValue({ ...value, allowedQuotes: ['about 7,200 signatures'] }, NO_DERIVED), 'untraced');
});

test('a grouped comparison audits each group’s value as well as the total', () => {
  const values = chartValues(fact({
    sources: [source('Of 8 cases, 6 involved officials; 2 involved judges')],
    comparisons: [{
      id: 'case-methods', title: 't', description: 'd', unit: 'count', valueLabel: 'Cases', sources: [1],
      groups: ['No', 'Partly'],
      items: [{ label: 'Officials', value: 8, values: [6, 2] }, { label: 'Other', value: 30, values: [30, 0] }],
    }],
  }));
  assert.deepEqual(
    values.map((v) => [v.where, auditValue(v, NO_DERIVED)]),
    [
      ['comparison case-methods Officials', 'quoted'],
      ['comparison case-methods Officials No', 'quoted'],
      ['comparison case-methods Officials Partly', 'quoted'],
      ['comparison case-methods Other', 'untraced'],
      ['comparison case-methods Other No', 'untraced'],
      ['comparison case-methods Other Partly', 'untraced'],
    ]
  );
  // Bare integers under 10 match any quote that mentions them, so they are flagged.
  assert.equal(isWeakMatch(values[0]), true);
});

test('a comparison may only use the sources it cites', () => {
  const [value] = chartValues(fact({
    sources: [source('nothing numeric'), source('fees of £50')],
    comparisons: [{
      id: 'fees', title: 't', description: 'd', unit: 'pounds', valueLabel: '£', sources: [1],
      items: [{ label: 'A', value: 50 }, { label: 'B', value: 60 }],
    }],
  }));
  assert.deepEqual(value.renderings, ['£50']);
  assert.equal(auditValue(value, NO_DERIVED), 'untraced');
});

test('count values are tried as digits and in their compact axis form, without a sign', () => {
  const s = series('net migration of 1.4 million', [-1_400_000, 250_000]);
  s.readings[0].unit = 'count';
  const [first] = chartValues(fact({ series: s }));
  assert.deepEqual(first.renderings, ['1400000', '1.4m']);
  assert.equal(auditValue(first, NO_DERIVED), 'quoted');
});

test('figure values are tried as formatValue writes them, with and without compact', () => {
  assert.deepEqual(figureRenderings(1_441_000, { unit: 'currency', currency: 'USD' }), ['$1,441,000', '$1.4m']);
  const [value] = fromFigureValues('fees', [{ where: 'Texas', value: 50, format: { unit: 'currency', currency: 'USD' }, citations: [2] }], [source('n/a'), source('a $50 fee')]);
  assert.equal(value.where, 'figure fees Texas');
  assert.equal(auditValue(value, NO_DERIVED), 'quoted');
});
