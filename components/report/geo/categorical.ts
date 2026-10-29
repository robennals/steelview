import type { MapValueEncoding } from './choropleth';

/**
 * The arithmetic and text behind a categorical map: a rule or category per
 * area — the ID rule each state enforces, postal voting for all, some or no
 * voters — rather than a number. Coding a category as a value would give it a
 * false order and a legend of made-up steps, so a categorical map has its own
 * encoding: a slot (fill, pattern and colour) per category in list order, a
 * short mark printed on every tile, and a count per category.
 */

export type MapCategory = {
  id: string;
  label: string;
  /** One to three characters printed on every tile in this category: "SP". The non-colour cue on a tile map. */
  mark: string;
};

export type CategoryAssignment = { category: string; note?: string };

/** Assignments keyed by area id. An id that is absent is "No data", never a category. */
export type CategoryData = Record<string, CategoryAssignment>;

export type CategoryEncoding = {
  /** What the categories are: "ID rule at the polls". Legend and table heading. */
  categoryLabel: string;
  /** In the order the legend and table list them. At most six. */
  categories: MapCategory[];
  categoryData: CategoryData;
};

/** The six fills and patterns defined in maps.css. A seventh category has no distinct look, so it is refused. */
export const MAX_CATEGORIES = 6;

/**
 * The key `categoryCounts` files areas with no assignment under. Not a valid
 * category id (those are lower-case slugs), so it can never collide with one.
 */
export const NO_DATA = 'No data';

type ValueKeys = { [K in keyof MapValueEncoding]?: never };
type CategoryKeys = { [K in keyof CategoryEncoding]?: never };

/**
 * A map is shaded by a number or by a category, never both. Each side forbids
 * the other's keys, so `categories` (or `data`) alone tells them apart.
 */
export type MapEncoding = (MapValueEncoding & CategoryKeys) | (CategoryEncoding & ValueKeys);

export function isCategorical<T extends MapEncoding>(encoding: T): encoding is Extract<T, CategoryEncoding> {
  return encoding.categories !== undefined;
}

/** Slot 1 to 6 for each category, in list order. */
export function categorySlots(categories: MapCategory[]): Map<string, number> {
  if (categories.length > MAX_CATEGORIES) {
    throw new Error(`A categorical map has at most ${MAX_CATEGORIES} categories; got ${categories.length}.`);
  }
  return new Map(categories.map((category, i) => [category.id, i + 1]));
}

/** The category an area is in, or undefined for "No data" (no assignment, or one naming an unknown category). */
export function categoryOf(areaId: string, encoding: CategoryEncoding): MapCategory | undefined {
  const assignment = encoding.categoryData[areaId];
  return assignment && encoding.categories.find(category => category.id === assignment.category);
}

/**
 * How many of `areaIds` fall in each category, keyed by category id, plus
 * `NO_DATA` for the rest. Every category has an entry, even at zero, and
 * assignments for areas outside `areaIds` are not counted.
 */
export function categoryCounts(data: CategoryData, areaIds: string[], categories?: MapCategory[]): Map<string, number> {
  const known = categories ? new Set(categories.map(category => category.id)) : undefined;
  const counts = new Map<string, number>((categories ?? []).map(category => [category.id, 0]));
  let missing = 0;
  for (const id of areaIds) {
    const category = data[id]?.category;
    if (category === undefined || (known && !known.has(category))) missing++;
    else counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  counts.set(NO_DATA, missing);
  return counts;
}

/**
 * The screen-reader description of a categorical map:
 * "51 areas in 5 categories: Strict photo ID, 10; … No data, 0."
 */
export function categorySummary(areas: Array<{ id: string; name: string }>, enc: CategoryEncoding): string {
  const counts = categoryCounts(enc.categoryData, areas.map(area => area.id), enc.categories);
  const parts = [...enc.categories.map(category => `${category.label}, ${counts.get(category.id)}`), `${NO_DATA}, ${counts.get(NO_DATA)}`];
  return `${areas.length} areas in ${enc.categories.length} categories: ${parts.join('; ')}.`;
}

/** "Arkansas: Strict photo ID" — what a focused area is called. */
export function categoryAriaText(name: string, category: MapCategory | undefined): string {
  return `${name}: ${category?.label ?? NO_DATA}`;
}

/** "Arkansas: Strict photo ID — {note}" — what the readout under the map says. */
export function categoryReadoutText(name: string, category: MapCategory | undefined, note?: string): string {
  const base = categoryAriaText(name, category);
  return category && note ? `${base} — ${note}` : base;
}
