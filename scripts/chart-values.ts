/**
 * The chart-value audit: every number a chart draws must be traceable to
 * one of
 *
 * 1. **its own source's quote** — a series reading's `source` (else the
 *    series `source`), or the fact's numbered sources a comparison or figure
 *    cites;
 * 2. **a named table** — the reading, comparison or figure declares
 *    `valuesFrom` ("EAVS 2024 Overview Table 1"), shown to the reader; or
 * 3. **a verified derivation** — a `derivedFigures` entry on the same fact.
 *
 * `check:figures` audits prose; this audits the frontmatter numbers the
 * charts draw, which no quote check reached before. It is advisory at first
 * (`check-figures.ts` prints it and exits 0; `--strict-values` fails on an
 * untraced value), because most series values today come from tables no
 * quote can hold.
 */
import { formatTick } from '../lib/chart/series-chart';
import type { Fact, Series, SeriesReading, Source } from '../lib/content/types';
import { formatValue } from '../components/report/format';
import type { ValueFormat } from '../components/report/types';
import { canonical, quoteCorpus, quotedSomewhere, type QuoteCorpus } from './figures';

/** One number a chart draws, with everything needed to trace it. */
export type ChartValue = {
  /** The chart it belongs to, for the per-chart summary: "series", "series eavs", "comparison by-state". */
  chart: string;
  /** Where the value sits, for the report line: "series reading rejection-rate line Texas 2022". */
  where: string;
  /** Forms to try against the quote tokens; the first is the one shown in a report line. */
  renderings: string[];
  /** The source's own wording for the value ("more than 7,200"); when given, it is checked instead of the number. */
  asPublished?: string;
  /** The quotes this value may be traced to — never the whole topic, never another chart's sources. */
  allowedQuotes: string[];
  /** The named table the chart declares its values come from. */
  valuesFrom?: string;
};

export type ValueVerdict = 'quoted' | 'derived' | 'table' | 'untraced';

/**
 * One number as a figure reports it — the shape `figureValues(figure)` in
 * `lib/content/figure-text.ts` returns, declared here so the audit can take
 * figure values without depending on that module.
 */
export type FigureValue = {
  where: string;
  value: number;
  format?: ValueFormat;
  /** The fact's numbered sources this value may be traced to. */
  citations: number[];
  asPublished?: string;
  valuesFrom?: string;
};

/** The parts of a fact that draw numbers. */
export type ChartedFact = Pick<Fact, 'sources' | 'series' | 'additionalSeries' | 'comparisons'>;

/**
 * A quote token never carries a sign (`−£36,000` tokenises as `£36000`), so
 * a rendering drops its sign before comparison. The sign is the chart's own
 * presentation; the magnitude is what the source must state.
 */
function unsigned(rendering: string): string {
  return rendering.replace(/^[+−-]/, '');
}

/** `percent` → "2.1%"; `count` → the digits and the axis form ("1441000", "1.4m"). */
function seriesRenderings(value: number, unit: SeriesReading['unit']): string[] {
  const magnitude = Math.abs(value);
  if (unit === 'percent') return [`${magnitude}%`];
  return [...new Set([String(magnitude), formatTick(magnitude, 'count')])];
}

function comparisonRenderings(value: number, unit: 'count' | 'percent' | 'pounds'): string[] {
  if (unit === 'pounds') {
    const magnitude = Math.abs(value);
    return [...new Set([`£${magnitude}`, `£${formatTick(magnitude, 'count')}`])];
  }
  return seriesRenderings(value, unit);
}

/** The value as the figure prints it, with and without the compact form. */
export function figureRenderings(value: number, format: ValueFormat = {}): string[] {
  return [...new Set([formatValue(value, { ...format, compact: false }), formatValue(value, { ...format, compact: true })].map(unsigned))];
}

/** The quotes of the fact's numbered sources (1-based, as citations are written). */
function citedQuotes(sources: readonly Source[], citations: readonly number[]): string[] {
  return citations.flatMap((n) => {
    const source = sources[n - 1];
    return source ? [source.quote] : [];
  });
}

function seriesValues(series: Series, chart: string, prefix: string): ChartValue[] {
  return series.readings.flatMap((reading) =>
    reading.lines.flatMap((line) =>
      line.points.map((point) => ({
        chart,
        where: `${prefix}reading ${reading.id} line ${line.name} ${point.period}`,
        renderings: seriesRenderings(point.value, reading.unit),
        allowedQuotes: [(reading.source ?? series.source).quote],
        valuesFrom: reading.valuesFrom,
      }))
    )
  );
}

/**
 * Every value a figure reports, as chart values. The hook for `figures`:
 * `chartValues` adds `fromFigureValues(figure.id, figureValues(figure), fact.sources)`
 * for each figure once that field exists.
 */
export function fromFigureValues(figureId: string, values: readonly FigureValue[], sources: readonly Source[]): ChartValue[] {
  return values.map((v) => ({
    chart: `figure ${figureId}`,
    where: `figure ${figureId} ${v.where}`,
    renderings: figureRenderings(v.value, v.format),
    asPublished: v.asPublished,
    allowedQuotes: citedQuotes(sources, v.citations),
    valuesFrom: v.valuesFrom,
  }));
}

/**
 * Every number the fact's charts draw: series and additional series points,
 * comparison bars, and — for a grouped comparison — each group's value as
 * well as the total.
 */
export function chartValues(fact: ChartedFact): ChartValue[] {
  const values: ChartValue[] = [];
  if (fact.series) values.push(...seriesValues(fact.series, 'series', 'series '));
  for (const series of fact.additionalSeries ?? []) {
    values.push(...seriesValues(series, `series ${series.id}`, `series ${series.id} `));
  }
  for (const comparison of fact.comparisons ?? []) {
    const chart = `comparison ${comparison.id}`;
    const allowedQuotes = citedQuotes(fact.sources, comparison.sources);
    for (const item of comparison.items) {
      const base = { chart, allowedQuotes, valuesFrom: comparison.valuesFrom };
      values.push({ ...base, where: `${chart} ${item.label}`, renderings: comparisonRenderings(item.value, comparison.unit) });
      (item.values ?? []).forEach((value, i) => {
        const group = comparison.groups?.[i] ?? `group ${i + 1}`;
        values.push({ ...base, where: `${chart} ${item.label} ${group}`, renderings: comparisonRenderings(value, comparison.unit) });
      });
    }
  }
  return values;
}

/**
 * Every point of a long series shares one quote, so its corpus is built once
 * rather than once per point.
 */
const corpora = new Map<string, QuoteCorpus>();
function corpusOf(quotes: readonly string[]): QuoteCorpus {
  const key = quotes.join('\u0000');
  let corpus = corpora.get(key);
  if (!corpus) {
    corpus = quoteCorpus(quotes);
    corpora.set(key, corpus);
  }
  return corpus;
}

/**
 * Where a value comes from. Its own quotes first; then a verified derivation
 * on the same fact; then a named table. With `asPublished`, the source's
 * wording is looked for in the allowed quotes instead of the number.
 */
export function auditValue(v: ChartValue, derived: QuoteCorpus): ValueVerdict {
  if (v.asPublished !== undefined) {
    const needle = canonical(v.asPublished);
    if (v.allowedQuotes.some((quote) => canonical(quote).includes(needle))) return 'quoted';
    return v.valuesFrom ? 'table' : 'untraced';
  }
  const own = corpusOf(v.allowedQuotes);
  if (v.renderings.some((r) => quotedSomewhere(r, own))) return 'quoted';
  if (v.renderings.some((r) => quotedSomewhere(r, derived))) return 'derived';
  return v.valuesFrom ? 'table' : 'untraced';
}

/**
 * A bare integer under 10 matches weakly: quote tokens include every bare
 * number, so "3" is "quoted" by any quote that mentions three of anything.
 * The audit accepts it but counts it separately so a reviewer can look.
 */
export function isWeakMatch(v: ChartValue): boolean {
  return v.asPublished === undefined && v.renderings.every((r) => /^\d$/.test(canonical(r)));
}
