import type { Fact, Figure, Series, Source } from './types';

/**
 * A fact's numbered citations, in one place.
 *
 * Every number a reader sees — "[3]" after a sentence, after a chart, after a
 * figure's table cell — indexes this one list, and the Sources expando prints
 * it in the same order. The renderer, the validator and `check:figures` all
 * call these functions, so they cannot disagree about which source "[3]" is.
 */

type SourcedFact = Pick<Fact, 'sources' | 'series' | 'additionalSeries'>;

function datasets(fact: SourcedFact): Series[] {
  return [...(fact.series ? [fact.series] : []), ...(fact.additionalSeries ?? [])];
}

/** A series' own citations, in order: its source, each reading's, then each line's. */
function seriesOwnSources(series: Series): Source[] {
  return [
    series.source,
    ...series.readings.flatMap(r => (r.source ? [r.source] : [])),
    ...series.readings.flatMap(r => r.lines.flatMap(line => (line.source ? [line.source] : []))),
  ];
}

/** Fact sources, then for the series and each additional series in turn: its source, its reading sources and its line sources. */
export function factSources(fact: SourcedFact): Source[] {
  return [...fact.sources, ...datasets(fact).flatMap(seriesOwnSources)];
}

/**
 * How many citations come before a series' own source: the series source is
 * number `offset + 1`. seriesIndex -1 = `series`; otherwise an index into
 * `additionalSeries`.
 */
export function seriesSourceOffset(fact: SourcedFact, seriesIndex: number): number {
  const index = seriesIndex < 0 ? 0 : (fact.series ? 1 : 0) + seriesIndex;
  return fact.sources.length + datasets(fact).slice(0, index).reduce((n, s) => n + seriesOwnSources(s).length, 0);
}

/** One-based number of the source a series reading is credited to. seriesIndex -1 = `series`. */
export function seriesSourceNumber(fact: SourcedFact, seriesIndex: number, readingIndex: number): number {
  const series = seriesIndex < 0 ? fact.series : fact.additionalSeries?.[seriesIndex];
  if (!series) throw new Error(`no series at index ${seriesIndex}`);
  const readings = series.readings;
  const own = readings[readingIndex]?.source ? readings.slice(0, readingIndex + 1).filter(r => r.source).length : 0;
  return seriesSourceOffset(fact, seriesIndex) + 1 + own;
}

/**
 * One-based numbers of the sources a reading's lines carry, in line order;
 * `undefined` for a line without one. `offset` is `seriesSourceOffset`.
 * Line sources follow every reading source, as in `factSources`.
 */
export function lineSourceNumbers(series: Series, offset: number, readingIndex: number): Array<number | undefined> {
  const readingSources = series.readings.filter(r => r.source).length;
  const before = series.readings.slice(0, readingIndex).reduce((n, r) => n + r.lines.filter(line => line.source).length, 0);
  let next = offset + 1 + readingSources + before;
  return series.readings[readingIndex].lines.map(line => (line.source ? ++next : undefined));
}

/** Every citation a figure makes, at figure or item level, in the order written (duplicates kept). */
export function figureCitations(figure: Figure): number[] {
  switch (figure.kind) {
    case 'series':
    case 'comparison':
    case 'featured':
    case 'section':
      return [];
    case 'dataTable':
      return [...figure.sources, ...figure.rows.flatMap(row => Object.values(row).flatMap(cell => (cell !== null && typeof cell === 'object' ? cell.sources ?? [] : [])))];
    case 'keyFigures':
      return [...figure.sources, ...figure.figures.flatMap(f => f.sources)];
    case 'timeline':
      return [...figure.sources, ...figure.events.flatMap(e => e.sources)];
    case 'periodTimeline':
      return [...figure.sources, ...figure.rows.flatMap(row => row.periods.flatMap(p => p.sources)), ...figure.events.flatMap(e => e.sources)];
    case 'tileMap':
    case 'geoMap':
    case 'barChart':
    case 'scatterPlot':
    case 'sliceExplorer':
      return figure.sources;
    case 'compositionBar':
      return [...figure.sources, ...figure.rows.flatMap(r => r.sources)];
    case 'estimateRange':
      return [...figure.sources, ...figure.estimates.flatMap(e => e.sources)];
    case 'quotes':
      return figure.quotes.flatMap(q => q.sources);
    case 'pullQuote':
      return figure.quote.sources;
    case 'claimCheck':
      return [figure.claimSource, ...figure.sources];
    case 'caveatList':
      return figure.items.flatMap(item => item.sources);
  }
}
