import { test } from 'node:test';
import assert from 'node:assert/strict';
import { factSources, seriesSourceNumber, seriesSourceOffset } from './sources';
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
