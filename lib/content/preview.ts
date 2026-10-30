import { factPath } from './types';
import type { Fact, Topic } from './types';

/** One chart in a topic's home-page carousel. */
export type PreviewSlide = {
  fact: Fact;
  /** `series`, an `additionalSeries` id or a `comparisons` id on `fact`. */
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
 * main series, any further series, then its comparisons. A series is one
 * slide, drawn at its first reading.
 */
export function factSlides(slug: string, fact: Fact): PreviewSlide[] {
  const slide = (chart: string, label: string): PreviewSlide =>
    ({ fact, chart, label, href: `${factPath(slug, fact.id)}#${fact.id}--chart-${chart}` });
  return [
    ...(fact.series ? [slide('series', fact.series.title)] : []),
    ...(fact.additionalSeries ?? []).map(s => slide(s.id, s.title)),
    ...(fact.comparisons ?? []).map(c => slide(c.id, c.title)),
  ];
}
