import type { ReactNode } from 'react';
import {
  type FigurePreview,
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
import { factSlides, type PreviewSlide } from '@/lib/content/preview';
import { factCitations, markedObservations } from '@/lib/content/walkthrough';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { componentFigure } from '@/lib/content/types';
import type { ComponentFigure, Fact } from '@/lib/content/types';
import { ComparisonChart } from './comparison-chart';
import { ChartSources } from './chart-sources';
import { Prose } from './prose';
import { SeriesChart } from './series-chart';
import { SourcesSlot } from './sources-slot';

/** What a figure needs from the topic around its fact. */
export type FigurePage = {
  slug: string;
  /** The topic's `lastUpdated`: where a period still in force stops. */
  asOf?: string;
  /** The topic's facts, so a claim check's evidence link lands on the right page. */
  facts: Pick<Fact, 'id' | 'supports'>[];
};

/**
 * One chart of a data panel in full: its controls and method changes, for one
 * reading of a series. Its observations come from the step it sits in, and its
 * sources row from the `SourcesSlot` around it. Its other source links lead to
 * the sources themselves, since a panel on a topic page has no list to link to.
 */
export function PanelChart({ slide, page }: { slide: PreviewSlide; page: FigurePage }) {
  const { fact, chart, reading: only } = slide;
  const sources = factSources(fact);
  const index = chart === 'series' ? -1 : (fact.additionalSeries ?? []).findIndex(s => s.id === chart);
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.[index];
  if (series) {
    const sourceOffset = seriesSourceOffset(fact, index);
    const reading = series.readings.find(r => r.id === only) ?? series.readings[0];
    const method = methodChanges(fact.id, reading.id, unmeasuredSpan(series), n => sources[n - 1].url);
    return <SeriesChart factId={fact.id} chartId={chart === 'series' ? undefined : chart} series={series} sourceOffset={sourceOffset} sources={sources} onlyReading={reading.id} panel notes={<Prose html={method} className="sv-graph-observations" />} marks={markedObservations(fact, reading.id)} />;
  }
  const comparison = fact.comparisons?.find(c => c.id === chart);
  if (comparison) return <ComparisonChart fact={fact} chart={comparison} sources={[]} panel />;
  const figure = componentFigure(fact, chart);
  return figure ? <FactFigure figure={figure} context={figureContext(fact, page.asOf, { panel: true })} page={page} /> : null;
}

/**
 * Every chart of a data panel in full, in step order, each with its sources
 * row. `addressed`, on a report's own page, gives each source its address, on
 * the first chart to cite it, so a link to it lands without script.
 */
export function panelCharts(fact: Fact, page: FigurePage, { addressed = false } = {}): ReactNode[] {
  const slides = factSlides(page.slug, fact);
  const citations = factCitations(fact, slides);
  const placed = new Set<number>();
  return slides.map((slide, i) => {
    const anchored = addressed ? citations[i].filter(number => !placed.has(number)) : [];
    anchored.forEach(number => placed.add(number));
    return <SourcesSlot key={i} row={<ChartSources fact={fact} numbers={citations[i]} anchored={anchored} />}><PanelChart slide={slide} page={page} /></SourcesSlot>;
  });
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
          <ClaimCheck {...claimCheckProps(figure, { ...context, slug: page.slug, facts: page.facts })} />
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
export function PreviewFigure({ figure, context, preview }: { figure: ComponentFigure; context: FigureContext; preview: FigurePreview }) {
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
      return <Timeline {...timelineProps(figure, context)} preview={preview} />;
    case 'periodTimeline':
      return <PeriodTimeline {...periodTimelineProps(figure, context)} preview={preview} />;
    case 'keyFigures':
      return <KeyFigures {...keyFiguresProps(figure, context)} preview={preview} />;
    case 'sliceExplorer':
      return <SliceExplorer {...sliceExplorerProps(figure, context)} preview={preview} />;
    case 'smallMultiples':
      return <SmallMultiples {...smallMultiplesProps(figure, context)} preview={preview} />;
    default:
      return <ReportFigure id={figureDomId(context.fact, figure.id)} title={'title' in figure ? figure.title : undefined} preview={preview} />;
  }
}
