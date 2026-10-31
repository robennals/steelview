import { z } from 'zod';
import {
  sourceSchema,
  seriesSchema,
  seriesLineSchema,
  seriesPointSchema,
  seriesReadingSchema,
  seriesBreakSchema,
  seriesEventSchema,
  factFrontmatterSchema,
  observationMarkSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
  previewChartSchema,
  figureSchema,
  valueFormatSchema,
  FACT_STATUSES,
  SOURCE_STANCES,
} from './schema';

export type FactStatus = (typeof FACT_STATUSES)[number];
export type SourceStance = (typeof SOURCE_STANCES)[number];

/** Every content item is its frontmatter plus an id (its filename) and its markdown body. */
export type Item<T> = T & { id: string; body: string };

export type Source = z.infer<typeof sourceSchema>;

export type SeriesPoint = z.infer<typeof seriesPointSchema>;
export type SeriesLine = z.infer<typeof seriesLineSchema>;
export type SeriesReading = z.infer<typeof seriesReadingSchema>;
export type SeriesBreak = z.infer<typeof seriesBreakSchema>;
export type SeriesEvent = z.infer<typeof seriesEventSchema>;
export type Series = z.infer<typeof seriesSchema>;

export type Figure = z.infer<typeof figureSchema>;
export type FigureKind = Figure['kind'];
export type FigureOf<K extends FigureKind> = Extract<Figure, { kind: K }>;
/** Kinds that draw a library component, as opposed to references. */
export type ComponentFigure = Exclude<Figure, { kind: 'series' | 'comparison' | 'featured' | 'section' }>;

export function isComponentFigure(figure: Figure): figure is ComponentFigure {
  return figure.kind !== 'series' && figure.kind !== 'comparison' && figure.kind !== 'featured' && figure.kind !== 'section';
}
/** The library figure with this id on a fact, if it has one. */
export function componentFigure(fact: Pick<Fact, 'figures'>, id: string): ComponentFigure | undefined {
  return fact.figures?.filter(isComponentFigure).find(figure => figure.id === id);
}

/** A library figure's name on its tab: its title, or the heading the kinds without one are drawn under. */
export function figureLabel(figure: ComponentFigure): string {
  switch (figure.kind) {
    case 'quoteComparison':
      return figure.question;
    case 'pullQuote':
      return `Quote: ${figure.quote.speaker}`;
    case 'claimCheck':
      return `Claim: ${figure.claim}`;
    case 'caveatList':
      return figure.heading;
    default:
      return figure.title;
  }
}
/** How a figure value is written; mirrors `ValueFormat` in components/report/types.ts. */
export type FigureValueFormat = z.infer<typeof valueFormatSchema>;

export type Fact = Item<z.infer<typeof factFrontmatterSchema>>;
export type ObservationMark = z.infer<typeof observationMarkSchema>;
export type Viewpoint = Item<z.infer<typeof viewpointFrontmatterSchema>>;
export type Principle = Item<z.infer<typeof principleFrontmatterSchema>>;
export type Crux = Item<z.infer<typeof cruxFrontmatterSchema>>;

export type PreviewChart = z.infer<typeof previewChartSchema>;

export type Topic = Omit<z.infer<typeof topicFrontmatterSchema>, 'principles' | 'dataOrder' | 'tags' | 'previewCharts'> & {
  /** Required in authored topic.md; optional here to ease in-memory test fixtures. */
  dataOrder?: string[];
  /** Required in authored topic.md; optional here to ease in-memory test fixtures. */
  tags?: string[];
  /** Required in authored topic.md; optional here to ease in-memory test fixtures. */
  previewCharts?: PreviewChart[];
  slug: string;
  /** The markdown body of topic.md — the page's introduction. */
  intro: string;
  facts: Fact[];
  viewpoints: Viewpoint[];
  principles: Principle[];
  cruxes: Crux[];
};

/** The four kinds of item, as they appear in anchor ids: `fact-net-migration-2024`. */
export type ItemKind = 'fact' | 'viewpoint' | 'principle' | 'crux';

export function anchorFor(kind: ItemKind, id: string): string {
  return `${kind}-${id}`;
}

/**
 * The canonical URL path of a topic, and of a single fact within it.
 *
 * Every fact — headline and supporting alike — is addressable: facts are what
 * the rest of the site cites, so they need a real address a crawler can index,
 * an importer can quote and a reader can paste. `anchorFor('fact', …)` is now
 * only the *authoring* syntax (`[…](#fact-<id>)`); what ships to the page is
 * one of these paths.
 */
export function topicPath(slug: string): string {
  return `/topics/${slug}`;
}

export function factPath(slug: string, factId: string): string {
  return `/topics/${slug}/facts/${factId}`;
}
