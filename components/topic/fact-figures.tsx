import type { ReactNode } from 'react';
import {
  BarChart,
  CaveatList,
  ClaimCheck,
  CompositionBar,
  DataTable,
  EstimateRange,
  KeyFigures,
  PeriodTimeline,
  PullQuote,
  QuoteComparison,
  ReportFigure,
  TileMap,
  Timeline,
} from '@/components/report';
import { bodySections, chartObservations, methodChanges } from '@/lib/content/chart-observations';
import {
  barChartProps,
  caveatListProps,
  claimCheckProps,
  compositionBarProps,
  dataTableProps,
  estimateRangeProps,
  figureContext,
  figureDomId,
  keyFiguresProps,
  periodTimelineProps,
  pullQuoteProps,
  quoteComparisonProps,
  tileMapProps,
  timelineProps,
  type FigureContext,
} from '@/lib/content/figure-props';
import { factSources, seriesSourceOffset } from '@/lib/content/sources';
import { isComponentFigure } from '@/lib/content/types';
import type { ComponentFigure, Fact } from '@/lib/content/types';
import { ComparisonChart } from './comparison-chart';
import { Prose } from './prose';
import { SeriesChart } from './series-chart';

/** A fact and its rendered body, shared by full pages and previews. */
export type BodiedFact = { fact: Fact; bodyHtml: string };

/** What a figure needs from the topic around its fact. */
export type FigurePage = {
  slug: string;
  /** The topic's `lastUpdated`: where a period still in force stops. */
  asOf?: string;
  /** The topic's facts, so a claim check's evidence link lands on the right page. */
  facts: Pick<Fact, 'id' | 'supports'>[];
};

type Groups = { observations?: Record<string, string>; subtleties?: Record<string, string> };

/** The Observations and Subtleties under one chart or figure, or nothing. */
function groupProse(id: string, { observations = {}, subtleties = {} }: Groups) {
  return (observations[id] || subtleties[id]) && <Prose html={(observations[id] ?? '') + (subtleties[id] ?? '')} className="sv-graph-observations" />;
}

/** The fact's `series` (no `seriesId`) or one `additionalSeries`, with its readings' observation groups and Method Changes. */
function FactSeries({ fact, seriesId, observations = {}, subtleties = {} }: { fact: Fact; seriesId?: string } & Groups) {
  const index = seriesId === undefined ? -1 : (fact.additionalSeries ?? []).findIndex(s => s.id === seriesId);
  const series = seriesId === undefined ? fact.series : fact.additionalSeries?.[index];
  if (!series) return null;
  const sourceOffset = seriesSourceOffset(fact, index);
  const readingGroups = Object.fromEntries(series.readings.map(reading => [reading.id, <Prose key={reading.id} html={(observations[reading.id] ?? "") + (subtleties[reading.id] ?? "") + methodChanges(fact.id, reading.id, series.breaks, sourceOffset + 1)} className="sv-graph-observations" />]));
  return <SeriesChart chartId={seriesId} factId={fact.id} series={series} sourceOffset={sourceOffset} sources={factSources(fact)} observations={readingGroups} />;
}

/** The fixed order a fact without `figures` has always used: series, additional series, featured charts, comparisons. */
export function FactCharts({ fact, observations = {}, subtleties = {}, afterSeries }: { fact: Fact; observations?: Record<string, string>; subtleties?: Record<string, string>; afterSeries?: ReactNode }) {
  return <>
    {fact.series && <FactSeries fact={fact} observations={observations} subtleties={subtleties} />}
    {fact.additionalSeries?.map(series => <FactSeries key={series.id} fact={fact} seriesId={series.id} observations={observations} subtleties={subtleties} />)}
    {afterSeries}
    {fact.comparisons?.map(chart => <ComparisonChart key={chart.id} fact={fact} chart={chart} sources={factSources(fact)} observations={groupProse(chart.id, { observations, subtleties })} />)}
  </>;
}

/** A fact's observation groups, keyed by reading and comparison id, plus any `extraIds` (figure and section ids). */
export function chartGroups(fact: Fact, bodyHtml: string, extraIds: string[] = []) {
  return chartObservations(bodyHtml, fact.id, [...(fact.series?.readings.map(r => r.id) ?? []), ...(fact.additionalSeries?.flatMap(s => s.readings.map(r => r.id)) ?? []), ...(fact.comparisons?.map(c => c.id) ?? []), ...extraIds]);
}

/**
 * The observation groups and placed sections of a fact with `figures`: every
 * reading, comparison, component figure and `section` id can carry its own
 * Observations and Subtleties, and each `section` is lifted out of the body to
 * sit where its figure entry does.
 */
export function figureGroups(fact: Fact, bodyHtml: string) {
  const figures = fact.figures ?? [];
  const sectionIds = figures.flatMap(f => (f.kind === 'section' ? [f.id] : []));
  const figureIds = figures.flatMap(f => (isComponentFigure(f) ? [f.id] : []));
  const grouped = chartGroups(fact, bodyHtml, [...figureIds, ...sectionIds]);
  const { sections, bodyHtml: rest } = bodySections(grouped.bodyHtml, fact.id, sectionIds);
  return { observations: grouped.observations, subtleties: grouped.subtleties, sections, bodyHtml: rest };
}

/** The charts of a supporting fact named in `featuredCharts`, with its own observation groups. */
export function FeaturedCharts({ child, page }: { child: BodiedFact; page: FigurePage }) {
  if (child.fact.figures) {
    const groups = figureGroups(child.fact, child.bodyHtml);
    return <FactFigures fact={child.fact} observations={groups.observations} subtleties={groups.subtleties} sections={groups.sections} featured={[]} page={page} />;
  }
  const childGroups = chartObservations(child.bodyHtml, child.fact.id, [...(child.fact.series?.readings.map(r => r.id) ?? []), ...(child.fact.comparisons?.map(c => c.id) ?? [])]);
  return <FactCharts fact={child.fact} observations={childGroups.observations} subtleties={childGroups.subtleties} />;
}

/**
 * A fact's `figures`, in the order written: its series and comparisons, the
 * charts of featured supporting facts, sections of its body, and library
 * figures, each with its own Observations inside its frame.
 */
export function FactFigures({ fact, observations, subtleties, sections, featured, page }: {
  fact: Fact;
  observations: Record<string, string>;
  subtleties: Record<string, string>;
  sections: Record<string, string>;
  /** Supporting facts named in featuredCharts, with their rendered bodies. */
  featured: BodiedFact[];
  page: FigurePage;
}): ReactNode {
  const context = figureContext(fact, page.asOf);
  return (fact.figures ?? []).map((figure, i) => {
    switch (figure.kind) {
      case 'series':
        return <FactSeries key={`series-${figure.id ?? ''}`} fact={fact} seriesId={figure.id} observations={observations} subtleties={subtleties} />;
      case 'comparison': {
        const chart = fact.comparisons?.find(c => c.id === figure.id);
        return chart && <ComparisonChart key={`comparison-${chart.id}`} fact={fact} chart={chart} sources={context.sources} observations={groupProse(chart.id, { observations, subtleties })} />;
      }
      case 'featured': {
        const child = featured.find(({ fact: f }) => f.id === figure.fact);
        return child && <FeaturedCharts key={`featured-${figure.fact}`} child={child} page={page} />;
      }
      case 'section':
        return <Prose key={`section-${figure.id}`} html={(sections[figure.id] ?? '') + (observations[figure.id] ?? '') + (subtleties[figure.id] ?? '')} />;
      default:
        return <FactFigure key={`${figure.kind}-${figure.id}-${i}`} figure={figure} context={context} page={page} footer={groupProse(figure.id, { observations, subtleties })} />;
    }
  });
}

/** One library figure: the adapter's props into its component, with Observations as the frame's footer. */
export function FactFigure({ figure, context, page, footer }: { figure: ComponentFigure; context: FigureContext; page: FigurePage; footer?: ReactNode }) {
  switch (figure.kind) {
    case 'dataTable':
      return <DataTable {...dataTableProps(figure, context)} footer={footer} />;
    case 'keyFigures':
      return <KeyFigures {...keyFiguresProps(figure, context)} footer={footer} />;
    case 'timeline':
      return <Timeline {...timelineProps(figure, context)} footer={footer} />;
    case 'periodTimeline':
      return <PeriodTimeline {...periodTimelineProps(figure, context)} footer={footer} />;
    case 'tileMap':
      return <TileMap {...tileMapProps(figure, context)} footer={footer} />;
    case 'barChart':
      return <BarChart {...barChartProps(figure, context)} footer={footer} />;
    case 'compositionBar':
      return <CompositionBar {...compositionBarProps(figure, context)} footer={footer} />;
    case 'estimateRange':
      return <EstimateRange {...estimateRangeProps(figure, context)} footer={footer} />;
    case 'quoteComparison':
      return <QuoteComparison {...quoteComparisonProps(figure, context)} footer={footer} />;
    // These three draw no frame of their own; one without a title gives them
    // the figure's id, description, Observations and note like every other.
    case 'pullQuote':
      return (
        <ReportFigure id={figureDomId(context.fact, figure.id)} description={figure.description} note={figure.note} footer={footer}>
          <PullQuote {...pullQuoteProps(figure, context)} />
        </ReportFigure>
      );
    case 'claimCheck':
      return (
        <ReportFigure id={figureDomId(context.fact, figure.id)} footer={footer}>
          <ClaimCheck {...claimCheckProps(figure, { ...context, slug: page.slug, facts: page.facts })} />
        </ReportFigure>
      );
    case 'caveatList':
      return (
        <ReportFigure id={figureDomId(context.fact, figure.id)} footer={footer}>
          <CaveatList {...caveatListProps(figure, context)} />
        </ReportFigure>
      );
  }
}
