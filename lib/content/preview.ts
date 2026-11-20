import { plotReadingId } from '@/lib/chart/series-chart';
import { componentFigure, figureLabel, isComponentFigure, topicPath } from './types';
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
  'map',
  'timeline',
  'periodTimeline',
  'keyFigures',
  'sliceExplorer',
  'smallMultiples',
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
  /** The chart's address on its topic page, where it opens in full. */
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
    return [{ fact, chart, reading, label: title, href: `${topicPath(topic.slug)}#${fact.id}--chart-${chart}` }];
  });
}

/**
 * The ids a slide's Observations and Subtleties are filed under: each reading a
 * series slide can show, in order (for a preview, the plot that draws its
 * reading, with any reading drawn alongside; else all of them, between which
 * the reader switches), or the chart itself.
 */
export function slideGroups(fact: Fact, { chart, reading }: Pick<PreviewSlide, 'chart' | 'reading'>): string[] {
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.find(s => s.id === chart);
  if (!series) return [chart];
  if (!reading) return series.readings.map(r => r.id);
  const plot = series.readings.find(r => r.id === plotReadingId(series, reading));
  return plot ? [plot.id, ...(plot.alongside ? [plot.alongside] : [])] : [reading];
}

/**
 * The address of a slide's chart, where it opens in full. A slide
 * naming a reading has the address of the chart showing it: the reading whose
 * plot draws it.
 */
export function chartAddress(slide: Pick<PreviewSlide, 'fact' | 'chart' | 'reading'>): string {
  return `${slide.fact.id}--chart-${slide.reading ? slideGroups(slide.fact, slide)[0] : slide.chart}`;
}

/**
 * A home-page slide's chart on its topic's page, opened over it in full
 * (`ExplorePanels`): where its title leads in a new tab or with no script.
 * Every preview chart opens there: `validateTopic` requires a viewpoint's card
 * to be made with it.
 */
export function reportChartPath(slug: string, slide: Pick<PreviewSlide, 'fact' | 'chart' | 'reading'>): string {
  return `${topicPath(slug)}#${chartAddress(slide)}`;
}

/**
 * Every chart a data collection draws, in the order its page shows them: the
 * order of its `figures` if it has them, or else the main series, any further
 * series, then its comparisons. A series with several readings is one slide,
 * which shows one reading at a time with a "Show as" switch between them, so
 * another way of reading the same data is always a click away rather than a
 * separate chart. Library figures (a table of rulings, a timeline) are slides too, so
 * a collection of laws and statements can be walked through like one of numbers.
 */
export function factSlides(slug: string, fact: Fact): PreviewSlide[] {
  const slide = (chart: string, label: string): PreviewSlide =>
    ({ fact, chart, label, href: `${topicPath(slug)}#${fact.id}--chart-${chart}` });
  const comparisonSlide = (id: string) => {
    const comparison = fact.comparisons?.find(c => c.id === id);
    return comparison ? [slide(comparison.id, comparison.title)] : [];
  };
  if (fact.figures) {
    return fact.figures.flatMap(figure => {
      if (figure.kind === 'series') {
        const series = figure.id ? fact.additionalSeries?.find(s => s.id === figure.id) : fact.series;
        return series ? [slide(figure.id ?? 'series', series.title)] : [];
      }
      if (figure.kind === 'comparison') return comparisonSlide(figure.id);
      return isComponentFigure(figure) ? [slide(figure.id, figureLabel(figure))] : [];
    });
  }
  return [
    ...(fact.series ? [slide('series', fact.series.title)] : []),
    ...(fact.additionalSeries ?? []).map(s => slide(s.id, s.title)),
    ...(fact.comparisons ?? []).flatMap(c => comparisonSlide(c.id)),
  ];
}
