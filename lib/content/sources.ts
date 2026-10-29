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

/** Fact sources, then the series source and its reading sources, then each additional series and its reading sources. */
export function factSources(fact: SourcedFact): Source[] {
  return [...fact.sources, ...datasets(fact).flatMap(series => [series.source, ...series.readings.flatMap(r => (r.source ? [r.source] : []))])];
}

/**
 * How many citations come before a series' own source: the series source is
 * number `offset + 1`. seriesIndex -1 = `series`; otherwise an index into
 * `additionalSeries`.
 */
export function seriesSourceOffset(fact: SourcedFact, seriesIndex: number): number {
  const index = seriesIndex < 0 ? 0 : (fact.series ? 1 : 0) + seriesIndex;
  return fact.sources.length + datasets(fact).slice(0, index).reduce((n, s) => n + 1 + s.readings.filter(r => r.source).length, 0);
}

/** One-based number of the source a series reading is credited to. seriesIndex -1 = `series`. */
export function seriesSourceNumber(fact: SourcedFact, seriesIndex: number, readingIndex: number): number {
  const series = seriesIndex < 0 ? fact.series : fact.additionalSeries?.[seriesIndex];
  if (!series) throw new Error(`no series at index ${seriesIndex}`);
  const readings = series.readings;
  const own = readings[readingIndex]?.source ? readings.slice(0, readingIndex + 1).filter(r => r.source).length : 0;
  return seriesSourceOffset(fact, seriesIndex) + 1 + own;
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
      return [...figure.sources, ...figure.rows.flatMap(row => Object.values(row).flatMap(cell => (cell !== null && typeof cell === 'object' ? cell.sources : [])))];
    case 'keyFigures':
      return [...figure.sources, ...figure.figures.map(f => f.source)];
    case 'timeline':
      return [...figure.sources, ...figure.events.map(e => e.source)];
    case 'periodTimeline':
      return [...figure.sources, ...figure.events.flatMap(e => (e.source === undefined ? [] : [e.source]))];
    case 'tileMap':
    case 'geoMap':
    case 'barChart':
    case 'scatterPlot':
      return figure.sources;
    case 'compositionBar':
      return [...figure.sources, ...figure.rows.flatMap(r => (r.source === undefined ? [] : [r.source]))];
    case 'estimateRange':
      return [...figure.sources, ...figure.estimates.map(e => e.source)];
    case 'quoteComparison':
      return figure.quotes.map(q => q.source);
    case 'pullQuote':
      return [figure.quote.source];
    case 'claimCheck':
      return [figure.claimSource, ...figure.sources];
    case 'caveatList':
      return figure.items.flatMap(item => item.sources);
  }
}
