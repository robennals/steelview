import { componentFigure, factPath, figureLabel, isComponentFigure } from './types';
import type { ComponentFigure, Fact, Series, Topic } from './types';

type Comparison = NonNullable<Fact['comparisons']>[number];

/**
 * The figure kinds a slide draws compactly: the graph-like ones. Each has a
 * compact presentation on its shared component (its `preview` prop), a case
 * in `PreviewFigure` (components/topic/fact-figures.tsx) and, where its
 * layout allows, a silhouette in `figureThumb` (components/topic/chart-thumb.tsx).
 * Listing a kind here is what lets `previewCharts` name it. Text kinds —
 * tables, quotes, claim checks, caveats — are absent: a home-page slide is a
 * graph, so the build rejects them (validate.ts, `previewChartErrors`), while a
 * walkthrough's slide draws them whole (`SlideChart`).
 */
export const PREVIEW_FIGURE_KINDS: readonly ComponentFigure['kind'][] = [
  'barChart',
  'compositionBar',
  'estimateRange',
  'scatterPlot',
  'tileMap',
  'geoMap',
  'timeline',
  'periodTimeline',
  'keyFigures',
];

/** What a `previewCharts` entry's `chart` names on its fact. */
export type PreviewTarget =
  | { kind: 'series'; series: Series; /** -1 for the fact's `series`, else its `additionalSeries` index. */ index: number }
  | { kind: 'comparison'; comparison: Comparison }
  | { kind: 'figure'; figure: ComponentFigure };

/**
 * `chart` on `fact`: `series`, an `additionalSeries` id, a `comparisons` id
 * or the id of a component figure in `figures` (ids are unique across all
 * four, validate.ts rule F1). Undefined when it names nothing. Whether a
 * figure's kind may be previewed is a separate question: `PREVIEW_FIGURE_KINDS`.
 */
export function previewTarget(fact: Fact, chart: string): PreviewTarget | undefined {
  if (chart === 'series') return fact.series && { kind: 'series', series: fact.series, index: -1 };
  const additional = fact.additionalSeries ?? [];
  const index = additional.findIndex(s => s.id === chart);
  if (index >= 0) return { kind: 'series', series: additional[index], index };
  const comparison = fact.comparisons?.find(c => c.id === chart);
  if (comparison) return { kind: 'comparison', comparison };
  const figure = componentFigure(fact, chart);
  return figure && { kind: 'figure', figure };
}

/** Whether a slide can draw this target: every series and comparison, and figures of the kinds above. */
export function isPreviewable(target: PreviewTarget): boolean {
  return target.kind !== 'figure' || PREVIEW_FIGURE_KINDS.includes(target.figure.kind);
}

function targetTitle(target: PreviewTarget): string {
  if (target.kind === 'series') return target.series.title;
  if (target.kind === 'comparison') return target.comparison.title;
  return figureLabel(target.figure);
}

/** One chart: a slide of a home-page carousel, or of a topic page's walkthrough. */
export type PreviewSlide = {
  fact: Fact;
  /** `series`, an `additionalSeries` id, a `comparisons` id or a figure id on `fact`. */
  chart: string;
  /** For a series, the one reading the slide draws. */
  reading?: string;
  /** The chart's own title: names the slide in the carousel count and under its thumbnail. */
  label: string;
  /** The chart in full, on its fact's page, where its table and methodology live. */
  href: string;
};

/**
 * A topic's `previewCharts`, resolved to the facts they name, in authored
 * order. Entries that do not resolve, or name a figure a slide cannot draw,
 * are dropped here; `validateTopic` is what reports them.
 */
export function resolvePreviews(topic: Topic): PreviewSlide[] {
  return (topic.previewCharts ?? []).flatMap(({ fact: factId, chart, reading }) => {
    const fact = topic.facts.find(f => f.id === factId);
    const target = fact && previewTarget(fact, chart);
    const title = target && isPreviewable(target) && targetTitle(target);
    if (!fact || !target || !title) return [];
    // Figures already take this DOM id on the fact page (figureDomId), as charts do.
    return [{ fact, chart, reading, label: title, href: `${factPath(topic.slug, fact.id)}#${fact.id}--chart-${chart}` }];
  });
}

/**
 * Every chart a data collection draws, in the order its page shows them: the
 * order of its `figures` if it has them, or else the main series, any further
 * series, then its comparisons. A series with several readings is a slide per
 * reading, since each reading has observations of its own and a slide draws
 * only one. Library figures (a table of rulings, a timeline) are slides too, so
 * a collection of laws and statements can be walked through like one of numbers.
 */
export function factSlides(slug: string, fact: Fact): PreviewSlide[] {
  const slide = (chart: string, label: string, reading?: string): PreviewSlide =>
    ({ fact, chart, reading, label, href: `${factPath(slug, fact.id)}#${fact.id}--chart-${reading ?? chart}` });
  const seriesSlides = (chart: string, series: NonNullable<Fact['series']>) => series.readings.length === 1
    ? [slide(chart, series.title)]
    : series.readings.map(reading => slide(chart, `${series.title}: ${reading.label}`, reading.id));
  const comparisonSlide = (id: string) => {
    const comparison = fact.comparisons?.find(c => c.id === id);
    return comparison ? [slide(comparison.id, comparison.title)] : [];
  };
  if (fact.figures) {
    return fact.figures.flatMap(figure => {
      if (figure.kind === 'series') {
        const series = figure.id ? fact.additionalSeries?.find(s => s.id === figure.id) : fact.series;
        return series ? seriesSlides(figure.id ?? 'series', series) : [];
      }
      if (figure.kind === 'comparison') return comparisonSlide(figure.id);
      return isComponentFigure(figure) ? [slide(figure.id, figureLabel(figure))] : [];
    });
  }
  return [
    ...(fact.series ? seriesSlides('series', fact.series) : []),
    ...(fact.additionalSeries ?? []).flatMap(s => seriesSlides(s.id, s)),
    ...(fact.comparisons ?? []).flatMap(c => comparisonSlide(c.id)),
  ];
}
