import { factPath, figureLabel, isComponentFigure } from './types';
import type { Fact, Topic } from './types';

/** One chart in a topic's home-page carousel. */
export type PreviewSlide = {
  fact: Fact;
  /** `series`, an `additionalSeries` id, a `comparisons` id or a library figure's id on `fact`. */
  chart: string;
  /** For a series, the one reading the slide draws. */
  reading?: string;
  /** The chart's own title: names the slide in the carousel count and under its thumbnail. */
  label: string;
  /** The chart in full, on its fact's page, where its table and methodology live. */
  href: string;
};

function chartTitle(fact: Fact, chart: string): string | undefined {
  if (chart === 'series') return fact.series?.title;
  return fact.additionalSeries?.find(s => s.id === chart)?.title ?? fact.comparisons?.find(c => c.id === chart)?.title;
}

/**
 * A topic's `previewCharts`, resolved to the facts they name, in authored
 * order. Entries that do not resolve are dropped here; `validateTopic` is what
 * reports them.
 */
export function resolvePreviews(topic: Topic): PreviewSlide[] {
  return (topic.previewCharts ?? []).flatMap(({ fact: factId, chart, reading }) => {
    const fact = topic.facts.find(f => f.id === factId);
    const title = fact && chartTitle(fact, chart);
    if (!fact || !title) return [];
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
