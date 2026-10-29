import { test } from 'node:test';
import assert from 'node:assert/strict';
import { US_STATE_TILES } from '@/components/report/geo/tiles';
import { figureExamplesFact } from './__fixtures__/figure-examples';
import {
  barChartProps,
  caveatListProps,
  claimCheckProps,
  compositionBarProps,
  dataTableProps,
  estimateRangeProps,
  figureContext,
  keyFiguresProps,
  periodTimelineProps,
  pullQuoteProps,
  quoteComparisonProps,
  tileMapProps,
  timelineProps,
  toValueFormat,
} from './figure-props';
import type { Fact, FigureKind, FigureOf } from './types';

const fact = figureExamplesFact();
const context = figureContext(fact, '2026-10-29');

function figureOf<K extends FigureKind>(kind: K): FigureOf<K> {
  const found = fact.figures?.find((f): f is FigureOf<K> => f.kind === kind);
  if (!found) throw new Error(`no ${kind} figure`);
  return found;
}

test('a citation becomes a credit naming its publisher and linking to its numbered reference', () => {
  assert.deepEqual(context.credit(11), { label: 'Washington State Auditor', href: '#source-figure-examples-11', number: 11 });
});

test('ids carry the fact prefix, the same scheme as comparisons', () => {
  assert.equal(dataTableProps(figureOf('dataTable'), context).id, 'figure-examples--chart-federal-laws');
  assert.equal(barChartProps(figureOf('barChart'), context).id, 'figure-examples--chart-wa-by-race');
  assert.equal(quoteComparisonProps(figureOf('quoteComparison'), context).id, 'figure-examples--chart-damage-claims');
});

test('quote ids are numbered within their figure, so quote anchors stay unique on the page', () => {
  assert.deepEqual(quoteComparisonProps(figureOf('quoteComparison'), context).quotes.map(q => q.id), [
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

test('item citations become item credits', () => {
  assert.equal(keyFiguresProps(figureOf('keyFigures'), context).figures[0].source?.number, 11);
  assert.equal(keyFiguresProps(figureOf('keyFigures'), context).figures[0].qualifier, 'more than');
  assert.equal(timelineProps(figureOf('timeline'), context).events[1].source?.label, 'Court of First Instance, Antwerp');
  assert.equal(compositionBarProps(figureOf('compositionBar'), context).rows[1].source?.number, 13);
  assert.equal(estimateRangeProps(figureOf('estimateRange'), context).estimates[3].source?.number, 17);
  assert.deepEqual(caveatListProps(figureOf('caveatList'), context).items[2].sources?.map(s => s.number), [26]);
});

test('open periods end at the topic\'s lastUpdated; closed ones leave the axis alone', () => {
  const periods = figureOf('periodTimeline');
  assert.equal(periodTimelineProps(periods, context).to, '2026-10-29');
  const closed = { ...periods, rows: periods.rows.map(row => ({ ...row, periods: row.periods.map(p => ({ ...p, to: p.to ?? '2026-10-20' })) })) };
  assert.equal(periodTimelineProps(closed, context).to, undefined);
  assert.equal(periodTimelineProps({ ...periods, to: '2026-12' }, context).to, '2026-12');
});

test('period-timeline events are strip events crediting their citation', () => {
  assert.deepEqual(periodTimelineProps(figureOf('periodTimeline'), context).events, [{
    date: '2026-05-01',
    label: 'Letter says hostilities "have terminated"',
    description: undefined,
    source: { label: 'The White House', href: '#source-figure-examples-4', number: 4 },
  }]);
});

test('map presets resolve to their tiles and bare numbers become data', () => {
  const props = tileMapProps(figureOf('tileMap'), context);
  assert.equal(props.tiles, US_STATE_TILES);
  assert.ok(props.data, 'a numeric tile map keeps its data');
  assert.deepEqual(props.data.DE, { value: 5.1 });
  assert.deepEqual(props.data.AR, { value: 8.8, label: undefined });
  assert.equal(props.note?.endsWith('Values from EAVS 2024 Overview Table 1.'), true);
});

test('formats convert to the library type, currency included', () => {
  assert.deepEqual(toValueFormat({ unit: 'currency', currency: 'USD', decimals: 1 }), { unit: 'currency', currency: 'USD', decimals: 1 });
  assert.deepEqual(toValueFormat({ unit: 'percent', decimals: 2 }), { unit: 'percent', decimals: 2 });
});

test('estimates may omit any bound, and a null no-effect value passes through', () => {
  const props = estimateRangeProps(figureOf('estimateRange'), context);
  assert.equal(props.nullValue, null);
  assert.deepEqual(props.estimates.map(e => [e.estimate, e.low, e.high]), [[undefined, 25, 35], [40, 34, 42], [38, undefined, undefined], [43.6, undefined, undefined]]);
});

test('claim evidence links like an inline citation: to the parent page when the fact supports another', () => {
  const check = figureOf('claimCheck');
  const facts: Pick<Fact, 'id' | 'supports'>[] = [{ id: 'mail-ballot-privacy' }];
  assert.equal(claimCheckProps(check, { ...context, slug: 'vbm', facts }).evidence?.href, '/topics/vbm/facts/mail-ballot-privacy#mail-ballot-privacy--privacy-surveys');
  const supporting = [{ id: 'mail-ballot-privacy', supports: 'mail-voting' }];
  assert.equal(claimCheckProps({ ...check, evidence: { fact: 'mail-ballot-privacy' } }, { ...context, slug: 'vbm', facts: supporting }).evidence?.href, '/topics/vbm/facts/mail-voting#evidence-mail-ballot-privacy');
  assert.equal(claimCheckProps(check, { ...context, slug: 'vbm', facts }).claimSource?.number, 22);
});
