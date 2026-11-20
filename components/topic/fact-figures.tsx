import type { ReactNode } from 'react';
import {
  type FigurePreview,
  type Quote,
  AreaMap,
  BarChart,
  CaveatList,
  ClaimCheck,
  CompositionBar,
  DataCards,
  DataTable,
  EstimateRange,
  KeyFigures,
  PairedBarChart,
  PeriodTimeline,
  PullQuote,
  QuoteBrowser,
  QuoteComparison,
  ReportFigure,
  ScatterPlot,
  SliceExplorer,
  SmallMultiples,
  Timeline,
} from '@/components/report';
import { methodChanges } from '@/lib/content/chart-observations';
import { unmeasuredSpan } from '@/lib/chart/series-chart';
import {
  areaMapProps,
  barChartProps,
  caveatListProps,
  claimCheckProps,
  compositionBarProps,
  dataTableProps,
  estimateRangeProps,
  figureContext,
  figureDomId,
  keyFiguresProps,
  pairedBarChartProps,
  periodTimelineProps,
  pullQuoteProps,
  quoteBrowserProps,
  quoteComparisonProps,
  scatterPlotProps,
  sliceExplorerProps,
  smallMultiplesProps,
  timelineProps,
  SIDE_BY_SIDE_QUOTES,
  type FigureContext,
} from '@/lib/content/figure-props';
import type { PreviewSlide } from '@/lib/content/preview';
import { markedObservations, slideCitations } from '@/lib/content/walkthrough';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { componentFigure } from '@/lib/content/types';
import type { ComponentFigure, Fact } from '@/lib/content/types';
import { ComparisonChart } from './comparison-chart';
import { ChartSources } from './chart-sources';
import { Prose } from './prose';
import { methodChangesReadingId, SeriesChart } from './series-chart';
import { SourcesSlot } from './sources-slot';

/** What a figure needs from the topic around its fact. */
export type FigurePage = {
  slug: string;
  /** The topic's `lastUpdated`: where a period still in force stops. */
  asOf?: string;
  /** Every quote in the topic (`topicQuotes`): a list of quotes is the topic's whole collection, not one report's. */
  quotes?: Quote[];
};

/**
 * One chart of a data panel in full: its controls and method changes, and for
 * a series every reading, behind its "Show as" switch. Its observations come
 * from the step it sits in, and its sources row from the `SourcesSlot` around it. Its other source links lead to
 * the sources themselves, since a panel on a topic page has no list to link to.
 */
export function PanelChart({ slide, page }: { slide: PreviewSlide; page: FigurePage }) {
  const { fact, chart } = slide;
  const sources = factSources(fact);
  const index = chart === 'series' ? -1 : (fact.additionalSeries ?? []).findIndex(s => s.id === chart);
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.[index];
  if (series) {
    const sourceOffset = seriesSourceOffset(fact, index);
    const method = methodChanges(fact.id, methodChangesReadingId(series), unmeasuredSpan(series), n => sources[n - 1].url);
    const marks = Object.fromEntries(series.readings.map(r => [r.id, markedObservations(fact, r.id)]));
    return <SeriesChart factId={fact.id} chartId={chart === 'series' ? undefined : chart} series={series} sourceOffset={sourceOffset} sources={sources} panel notes={<Prose html={method} className="sv-graph-observations" />} marks={marks} />;
  }
  const comparison = fact.comparisons?.find(c => c.id === chart);
  if (comparison) return <ComparisonChart fact={fact} chart={comparison} sources={[]} panel />;
  const figure = componentFigure(fact, chart);
  return figure ? <FactFigure figure={figure} context={figureContext(fact, page.asOf, { panel: true })} page={page} /> : null;
}

/** Charts of a collection in full, in the order given, each with its sources row. */
export function panelCharts(fact: Fact, page: FigurePage, slides: PreviewSlide[]): ReactNode[] {
  return slides.map((slide, i) => <SourcesSlot key={i} row={<ChartSources fact={fact} numbers={slideCitations(fact, slide)} />}><PanelChart slide={slide} page={page} /></SourcesSlot>);
}

/** One library figure: the adapter's props into its component. */
export function FactFigure({ figure, context, page }: { figure: ComponentFigure; context: FigureContext; page: FigurePage }) {
  switch (figure.kind) {
    case 'dataTable':
      return figure.layout
        ? <DataCards {...dataTableProps(figure, context)} layout={figure.layout} leadColumn={figure.leadColumn} dateColumn={figure.dateColumn} />
        : <DataTable {...dataTableProps(figure, context)} />;
    case 'keyFigures':
      return <KeyFigures {...keyFiguresProps(figure, context)} />;
    case 'timeline':
      return <Timeline {...timelineProps(figure, context)} />;
    case 'periodTimeline':
      return <PeriodTimeline {...periodTimelineProps(figure, context)} />;
    case 'map':
      return <AreaMap {...areaMapProps(figure, context)} />;
    case 'scatterPlot':
      return <ScatterPlot {...scatterPlotProps(figure, context)} />;
    case 'barChart':
      return figure.series
        ? <PairedBarChart {...pairedBarChartProps(figure, context)} />
        : <BarChart {...barChartProps(figure, context)} />;
    case 'sliceExplorer':
      return <SliceExplorer {...sliceExplorerProps(figure, context)} />;
    case 'smallMultiples':
      return <SmallMultiples {...smallMultiplesProps(figure, context)} />;
    case 'compositionBar':
      return <CompositionBar {...compositionBarProps(figure, context)} />;
    case 'estimateRange':
      return <EstimateRange {...estimateRangeProps(figure, context)} />;
    case 'quotes':
      if (page.quotes && page.quotes.length > figure.quotes.length) {
        return (
          <QuoteBrowser
            {...quoteBrowserProps(figure, context)}
            title="Every quote on this topic"
            description="Every quote collected for this topic, in date order. Pick a question to see the quotes that answer it."
            quotes={page.quotes}
            tagLabel="Question"
          />
        );
      }
      return figure.quotes.length <= SIDE_BY_SIDE_QUOTES
        ? <QuoteComparison {...quoteComparisonProps(figure, context)} />
        : <QuoteBrowser {...quoteBrowserProps(figure, context)} />;
    // These three draw no frame of their own; one without a title gives them
    // the figure's id, description, Observations and note like every other.
    case 'pullQuote':
      return (
        <ReportFigure id={figureDomId(context.fact, figure.id)} description={figure.description} note={figure.note} panel={context.panel}>
          <PullQuote {...pullQuoteProps(figure, context)} />
        </ReportFigure>
      );
    case 'claimCheck':
      return (
        <ReportFigure id={figureDomId(context.fact, figure.id)} panel={context.panel}>
          <ClaimCheck {...claimCheckProps(figure, { ...context, slug: page.slug })} />
        </ReportFigure>
      );
    case 'caveatList':
      return (
        <ReportFigure id={figureDomId(context.fact, figure.id)} panel={context.panel}>
          <CaveatList {...caveatListProps(figure, context)} />
        </ReportFigure>
      );
  }
}

/**
 * A library figure's compact preview, for a slide: the same adapter and
 * component as `FactFigure`, with the component's `preview` presentation.
 * One case per kind in `PREVIEW_FIGURE_KINDS` (lib/content/preview.ts). A kind
 * without a case here draws its linked title alone, so a kind added to that
 * list before its presentation exists degrades to a label, not a crash.
 */
export function PreviewFigure({ figure, context, preview, picked }: {
  figure: ComponentFigure;
  context: FigureContext;
  preview: FigurePreview;
  /** The rows the claim it illustrates is about: a timeline gives them its cards. */
  picked?: string[];
}) {
  switch (figure.kind) {
    case 'barChart':
      return figure.series
        ? <PairedBarChart {...pairedBarChartProps(figure, context)} preview={preview} />
        : <BarChart {...barChartProps(figure, context)} preview={preview} />;
    case 'compositionBar':
      return <CompositionBar {...compositionBarProps(figure, context)} preview={preview} />;
    case 'estimateRange':
      return <EstimateRange {...estimateRangeProps(figure, context)} preview={preview} />;
    case 'scatterPlot':
      return <ScatterPlot {...scatterPlotProps(figure, context)} preview={preview} />;
    case 'map':
      return <AreaMap {...areaMapProps(figure, context)} preview={preview} />;
    case 'timeline':
      return <Timeline {...timelineProps(figure, context)} preview={preview} picked={picked} />;
    case 'periodTimeline':
      return <PeriodTimeline {...periodTimelineProps(figure, context)} preview={preview} />;
    case 'keyFigures':
      return <KeyFigures {...keyFiguresProps(figure, context)} preview={preview} />;
    case 'sliceExplorer':
      return <SliceExplorer {...sliceExplorerProps(figure, context)} preview={preview} />;
    case 'smallMultiples':
      return <SmallMultiples {...smallMultiplesProps(figure, context)} preview={preview} />;
    default:
      return <ReportFigure id={figureDomId(context.fact, figure.id)} title={'title' in figure ? figure.title : undefined} subtitle={'subtitle' in figure ? figure.subtitle : undefined} preview={preview} />;
  }
}
