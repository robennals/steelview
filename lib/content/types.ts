import { z } from 'zod';
import {
  sourceSchema,
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
  FACT_STATUSES,
  SOURCE_STANCES,
} from './schema';

export type FactStatus = (typeof FACT_STATUSES)[number];
export type SourceStance = (typeof SOURCE_STANCES)[number];

/** Every content item is its frontmatter plus an id (its filename) and its markdown body. */
export type Item<T> = T & { id: string; body: string };

export type Source = z.infer<typeof sourceSchema>;

export type Fact = Item<z.infer<typeof factFrontmatterSchema>>;
export type Viewpoint = Item<z.infer<typeof viewpointFrontmatterSchema>>;
export type Principle = Item<z.infer<typeof principleFrontmatterSchema>>;
export type Crux = Item<z.infer<typeof cruxFrontmatterSchema>>;

export type Topic = z.infer<typeof topicFrontmatterSchema> & {
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
