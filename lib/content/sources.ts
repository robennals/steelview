import { componentFigure } from './types';
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
    case 'map':
    case 'barChart':
    case 'scatterPlot':
    case 'sliceExplorer':
      return figure.sources;
    case 'compositionBar':
      return [...figure.sources, ...figure.rows.flatMap(r => r.sources)];
    case 'smallMultiples':
      return [...figure.sources, ...figure.panels.flatMap(p => p.sources)];
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

/** Every citation a series makes on one reading's chart: its source and lines', its events' and any stop in measurement's. */
function readingCitations(fact: SourcedFact, seriesIndex: number, readingIndex: number): number[] {
  const series = seriesIndex < 0 ? fact.series : fact.additionalSeries?.[seriesIndex];
  if (!series) return [];
  const offset = seriesSourceOffset(fact, seriesIndex);
  return [
    seriesSourceNumber(fact, seriesIndex, readingIndex),
    ...lineSourceNumbers(series, offset, readingIndex).flatMap(n => (n === undefined ? [] : [n])),
    ...(series.breaks.length > 0 ? [offset + 1] : []),
    ...series.events.flatMap(event => event.sources),
    ...(series.notMeasuredSince ? [series.notMeasuredSince.source] : []),
  ];
}

/** Every citation one chart draws, whichever kind it is: `chart` and `reading` as on a slide. */
export function chartCitations(fact: SourcedFact & Pick<Fact, 'comparisons' | 'figures'>, chart: string, reading?: string): number[] {
  const index = chart === 'series' ? -1 : (fact.additionalSeries ?? []).findIndex(s => s.id === chart);
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.[index];
  if (series) return readingCitations(fact, index, Math.max(0, series.readings.findIndex(r => r.id === reading)));
  const figure = componentFigure(fact, chart);
  return fact.comparisons?.find(c => c.id === chart)?.sources ?? (figure ? figureCitations(figure) : []);
}

/** The `[n](#source-<fact>-n)` footnotes in some markdown, in order. */
export function footnotesIn(markdown: string, factId: string): number[] {
  return [...markdown.matchAll(new RegExp(`\\(#source-${factId}-(\\d+)\\)`, 'g'))].map(match => Number(match[1]));
}

/** A chart's sources row in brief: at most two publishers, and how many more there are. */
export function sourcesSummary(sources: Pick<Source, 'publisher'>[]): { label: string; names: string; more: number } {
  const publishers = [...new Set(sources.map(source => source.publisher))];
  const [first, second, ...rest] = publishers;
  const label = sources.length === 1 ? 'Source' : 'Sources';
  if (rest.length > 0) return { label, names: `${first}, ${second}`, more: rest.length };
  return { label, names: second ? `${first} and ${second}` : first, more: 0 };
}
