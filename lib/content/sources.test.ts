import { test } from 'node:test';
import assert from 'node:assert/strict';
import { factSources, figureCitations, lineSourceNumbers, seriesSourceNumber, seriesSourceOffset } from './sources';
import type { Fact, Series, Source } from './types';

const source = (name: string): Source => ({ stance: 'supports', quote: name, title: name, url: `https://example.org/${name}`, publisher: name, date: '2024' });

function series(name: string, readingSources: boolean[]): Series {
  return {
    title: name,
    description: name,
    periodLabel: 'Year',
    coverage: { from: '2020', to: '2021' },
    breaks: [],
    events: [],
    readings: readingSources.map((sourced, i) => ({
      id: `${name}-${i}`,
      label: `${name} ${i}`,
      unit: 'count',
      valueLabel: 'People',
      ...(sourced ? { source: source(`${name}-reading-${i}`) } : {}),
      lines: [{ name: 'All', points: [{ period: '2020', value: 1 }, { period: '2021', value: 2 }] }],
    })),
    source: source(`${name}-source`),
  };
}

const fact: Fact = {
  id: 'example',
  claim: 'c',
  status: 'well-supported',
  body: 'b',
  sources: [source('fact-1'), source('fact-2')],
  series: series('main', [false, true]),
  additionalSeries: [{ id: 'extra-a', ...series('a', [true, false, true]) }, { id: 'extra-b', ...series('b', [false]) }],
};

test('fact sources, then each series source followed by its reading sources', () => {
  assert.deepEqual(factSources(fact).map(s => s.publisher), [
    'fact-1', 'fact-2',
    'main-source', 'main-reading-1',
    'a-source', 'a-reading-0', 'a-reading-2',
    'b-source',
  ]);
});

/** The arithmetic fact-article.tsx and SeriesChart used before sources.ts, kept here as the reference. */
function oldSourceNumber(f: Fact, seriesIndex: number, readingIndex: number): number {
  const s = seriesIndex < 0 ? f.series! : f.additionalSeries![seriesIndex];
  const sourceOffset = seriesIndex < 0
    ? f.sources.length
    : f.sources.length + (f.series ? 1 + f.series.readings.filter(r => r.source).length : 0) + f.additionalSeries!.slice(0, seriesIndex).reduce((n, x) => n + 1 + x.readings.filter(r => r.source).length, 0);
  const reading = s.readings[readingIndex];
  return sourceOffset + 1 + (reading.source ? s.readings.slice(0, readingIndex + 1).filter(r => r.source).length : 0);
}

test('seriesSourceNumber matches the old inline arithmetic for every reading', () => {
  const cases: Array<[number, number]> = [[-1, 0], [-1, 1], [0, 0], [0, 1], [0, 2], [1, 0]];
  for (const [s, r] of cases) assert.equal(seriesSourceNumber(fact, s, r), oldSourceNumber(fact, s, r), `series ${s} reading ${r}`);
  // And each number points at the source it should.
  assert.equal(factSources(fact)[seriesSourceNumber(fact, 0, 2) - 1].publisher, 'a-reading-2');
  assert.equal(factSources(fact)[seriesSourceNumber(fact, 0, 1) - 1].publisher, 'a-source');
});

test('without a main series, additional series number from the fact sources', () => {
  const rest = { ...fact, series: undefined };
  assert.equal(seriesSourceOffset(rest, 0), 2);
  assert.equal(seriesSourceNumber(rest, 1, 0), 2 + 3 + 1);
});

test('a line\'s own source follows every reading source of its series, and later series shift past it', () => {
  const withLine: Fact = {
    ...fact,
    series: { ...fact.series!, readings: fact.series!.readings.map((r, i) => (i === 0 ? { ...r, lines: [{ ...r.lines[0], source: source('main-line-0') }, { ...r.lines[0], name: 'Other' }] } : r)) },
  };
  assert.deepEqual(factSources(withLine).map(s => s.publisher).slice(2, 6), ['main-source', 'main-reading-1', 'main-line-0', 'a-source']);
  assert.equal(seriesSourceOffset(withLine, 0), 2 + 3);
  assert.deepEqual(lineSourceNumbers(withLine.series!, seriesSourceOffset(withLine, -1), 0), [5, undefined]);
  assert.equal(factSources(withLine)[5 - 1].publisher, 'main-line-0');
  // Reading numbers are unchanged by a line source.
  assert.equal(seriesSourceNumber(withLine, -1, 1), 4);
});

test('every citation an item makes is a figure citation, in the order written', () => {
  const figure = {
    kind: 'timeline' as const, id: 't', title: 't', description: 'd', sources: [1], categories: [{ id: 'c', label: 'C' }],
    events: [{ date: '2020', title: 'a', category: 'c', sources: [3, 2] }, { date: '2021', title: 'b', category: 'c', sources: [2] }],
  };
  assert.deepEqual(figureCitations(figure), [1, 3, 2, 2]);
});
