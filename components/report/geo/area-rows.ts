import { pointValue } from '../qualified';
import type { ValueFormat } from '../types';
import { categoryOf, NO_DATA, type CategoryEncoding } from './categorical';
import { datumText, type MapData } from './choropleth';

/** One area in a map's table, whichever way the map is shaded. */
export type AreaRow = {
  id: string;
  name: string;
  /** What the data column sorts by: the figure, or the category's place in the author's order. Empty for "No data". */
  value: number | undefined;
  /** What the data column prints. */
  text: string;
  /** The author's note on this area's category. */
  note: string | undefined;
  /** The category's tint and mark, repeated from the key. */
  slot: number | undefined;
  mark: string | undefined;
};

export type AreaFilters = {
  /** Part of the area's name. */
  name: string;
  /** One category, or "" for all of them. */
  choice: string;
  /** Part of the note. */
  note: string;
  /** Bounds on the figure, as typed; "" for no bound. */
  min: string;
  max: string;
};

export const NO_FILTERS: AreaFilters = { name: '', choice: '', note: '', min: '', max: '' };

const alphabetical = <T extends { name: string }>(areas: T[]) => [...areas].sort((a, b) => a.name.localeCompare(b.name));

/** Every area with its figure, alphabetical so that equal figures read in name order. */
export function numericRows(areas: Array<{ id: string; name: string }>, data: MapData, format?: ValueFormat): AreaRow[] {
  return alphabetical(areas).map(({ id, name }) => ({
    id,
    name,
    value: data[id] && pointValue(data[id]),
    text: datumText(data[id], format),
    note: undefined,
    slot: undefined,
    mark: undefined,
  }));
}

/** Every area with its category and note, alphabetical so that each category reads in name order. */
export function categoryRows(areas: Array<{ id: string; name: string }>, encoding: CategoryEncoding, slots: Map<string, number>): AreaRow[] {
  return alphabetical(areas).map(({ id, name }) => {
    const category = categoryOf(id, encoding);
    return {
      id,
      name,
      value: category && encoding.categories.findIndex(({ id: other }) => other === category.id),
      text: category?.label ?? NO_DATA,
      note: category ? encoding.categoryData[id]?.note : undefined,
      slot: category && slots.get(category.id),
      mark: category?.mark,
    };
  });
}

const contains = (text: string | undefined, part: string) => (text ?? '').toLocaleLowerCase('en-GB').includes(part.trim().toLocaleLowerCase('en-GB'));

/** A typed bound as a number, or undefined when it is blank or not a number, so half-typed input filters nothing. */
function bound(text: string): number | undefined {
  const value = text.trim() === '' ? NaN : Number(text);
  return Number.isNaN(value) ? undefined : value;
}

/** The rows that pass every filter. An area with no figure fails any bound on the figure. */
export function filterRows(rows: AreaRow[], { name, choice, note, min, max }: AreaFilters): AreaRow[] {
  const [low, high] = [bound(min), bound(max)];
  return rows.filter(
    row =>
      contains(row.name, name) &&
      (choice === '' || row.text === choice) &&
      (note === '' || contains(row.note, note)) &&
      (low === undefined || (row.value !== undefined && row.value >= low)) &&
      (high === undefined || (row.value !== undefined && row.value <= high)),
  );
}
