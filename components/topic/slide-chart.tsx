import type { PreviewFit } from '@/lib/chart/series-chart';
import type { PreviewSlide } from '@/lib/content/preview';
import { figureContext } from '@/lib/content/figure-props';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { componentFigure } from '@/lib/content/types';
import { ComparisonChart } from './comparison-chart';
import { FactFigure, type FigurePage } from './fact-figures';
import { SeriesChart } from './series-chart';

/**
 * A preview slide's chart, through the same shared component the topic page
 * uses. A library figure needs `page`, which only a walkthrough's slides do.
 */
export function SlideChart({ slide, fit, page }: { slide: PreviewSlide; fit?: PreviewFit; page?: FigurePage }) {
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
  if (comparison) return <ComparisonChart fact={{ id: fact.id }} chart={comparison} sources={[]} preview={preview} />;
  const figure = componentFigure(fact, chart);
  return figure && page
    ? <div className="sv-slide__figure"><FactFigure figure={figure} context={figureContext(fact, page.asOf)} page={page} /></div>
    : null;
}
