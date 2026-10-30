import type { PreviewFit } from '@/lib/chart/series-chart';
import type { PreviewSlide } from '@/lib/content/preview';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { ComparisonChart } from './comparison-chart';
import { SeriesChart } from './series-chart';

/** A preview slide's chart, through the same shared component the topic page uses. */
export function SlideChart({ slide, fit }: { slide: PreviewSlide; fit?: PreviewFit }) {
  const { fact, chart } = slide;
  const preview = { href: slide.href.split('#')[0], reading: slide.reading, fit };
  const seriesIndex = chart === 'series' ? -1 : (fact.additionalSeries ?? []).findIndex(s => s.id === chart);
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.[seriesIndex];
  if (series) {
    return <SeriesChart factId={fact.id} chartId={chart === 'series' ? undefined : chart} series={series} sourceOffset={seriesSourceOffset(fact, seriesIndex)} sources={factSources(fact)} preview={preview} />;
  }
  const comparison = fact.comparisons?.find(c => c.id === chart);
  // A preview draws no source line, and a comparison is a client component, so
  // the fact's sources (each with its quote) would only weigh down the page.
  return comparison ? <ComparisonChart fact={{ id: fact.id }} chart={comparison} sources={[]} preview={preview} /> : null;
}
