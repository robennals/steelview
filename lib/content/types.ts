import type { CardVisualRef } from './viewpoint-links';
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
    case 'quotes':
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
/**
 * A viewpoint as the site reads it: its text joined with its links file
 * (`viewpoint-links.ts`), so `body` and `summary` carry the citations as
 * inline links.
 */
export type Viewpoint = Item<z.infer<typeof viewpointFrontmatterSchema>> & {
  /** Every claim the text cites as `#needed`, quoted exactly: the research queue. */
  researchNeeded?: string[];
  /** Each card's graph or quotes, by heading, as the links file names it. A card without one is text. */
  visuals?: Map<string, CardVisualRef>;
  /** Where the text and its links file do not line up. */
  linkErrors?: string[];
  /** Passages the agent has not checked against their evidence as they now stand. */
  unverified?: string[];
};
export type Crux = Item<z.infer<typeof cruxFrontmatterSchema>>;

export type PreviewChart = z.infer<typeof previewChartSchema>;

export type Topic = Omit<z.infer<typeof topicFrontmatterSchema>, 'dataOrder' | 'tags' | 'previewCharts'> & {
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
  cruxes: Crux[];
};

/** The kinds of item, as they appear in anchor ids: `fact-net-migration-2024`. */
export type ItemKind = 'fact' | 'viewpoint' | 'crux';

export function anchorFor(kind: ItemKind, id: string): string {
  return `${kind}-${id}`;
}

/**
 * The canonical URL path of a topic. A fact has no page of its own:
 * `anchorFor('fact', …)` is only the *authoring* syntax (`[…](#fact-<id>)`),
 * and what ships is an address on this page (remarkMarkFactCitations).
 */
export function topicPath(slug: string): string {
  return `/topics/${slug}`;
}
