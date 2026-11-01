import type { PreviewFit } from '@/lib/chart/series-chart';
import { isPreviewable, previewTarget, type PreviewSlide } from '@/lib/content/preview';
import { figureContext } from '@/lib/content/figure-props';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { ComparisonChart } from './comparison-chart';
import { FactFigure, PreviewFigure, type FigurePage } from './fact-figures';
import { SeriesChart } from './series-chart';

/**
 * A slide's chart, through the same shared component the topic page uses. A
 * graph-like figure draws its compact preview, as a chart does; a figure set as
 * type (a table, a quote) is drawn whole, which needs `page`.
 */
export function SlideChart({ slide, fit, titleHref, page }: { slide: PreviewSlide; fit?: PreviewFit; titleHref?: string; page?: FigurePage }) {
  const { fact, chart } = slide;
  const preview = { href: titleHref, reading: slide.reading, fit };
  const target = previewTarget(fact, chart);
  switch (target?.kind) {
    case 'series':
      return <SeriesChart factId={fact.id} chartId={chart === 'series' ? undefined : chart} series={target.series} sourceOffset={seriesSourceOffset(fact, target.index)} sources={factSources(fact)} preview={preview} />;
    case 'comparison':
      // A preview draws no source line, and a comparison is a client component, so
      // the fact's sources (each with its quote) would only weigh down the page.
      return <ComparisonChart fact={{ id: fact.id }} chart={target.comparison} sources={[]} preview={preview} />;
    case 'figure': {
      const context = figureContext(fact, page?.asOf);
      if (isPreviewable(target)) return <PreviewFigure figure={target.figure} context={context} preview={preview} />;
      return page ? <div className="sv-slide__figure"><FactFigure figure={target.figure} context={context} page={page} /></div> : null;
    }
    default:
      return null;
  }
}
