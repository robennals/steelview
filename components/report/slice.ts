/**
 * The pure half of SliceExplorer: filter tidy rows, group them by one or two
 * dimensions, and aggregate a measure. Kept free of React so the arithmetic
 * a reader is trusting can be tested on its own.
 */

export type SliceRow = Record<string, string | number>;

export type SliceDimension = {
  key: string;
  /** Singular, sentence case: "Reason", "Year". */
  label: string;
  /** The values in their natural order. Omit to take them in order of first appearance. */
  values?: string[];
  /**
   * 'value' ranks bars largest first; 'none' keeps `values` order. Defaults
   * to 'none' when `values` is given (years, age bands) and 'value'
   * otherwise (categories).
   */
  sort?: 'value' | 'none';
  /**
   * Values kept at the end however the bars are ranked — residuals such as
   * "Other industries", which are not a category and should not be ranked
   * as one.
   */
  last?: string[];
  /** Lower-case plural for the status line: "reasons". Defaults to "<label> categories". */
  plural?: string;
};

export type SliceAggregation = 'sum' | 'mean';

/** Selected values per dimension key. An empty or missing set means "all". */
export type SliceFilters = Record<string, readonly string[] | undefined>;

/** Every value a dimension takes, in its declared order or order of appearance. */
export function dimensionValues(rows: SliceRow[], dimension: SliceDimension): string[] {
  if (dimension.values) return dimension.values;
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[dimension.key];
    if (value !== undefined) seen.add(String(value));
  }
  return [...seen];
}

export function filterRows(rows: SliceRow[], filters: SliceFilters): SliceRow[] {
  const active = Object.entries(filters).flatMap(([key, values]) => (values && values.length > 0 ? [[key, values] as const] : []));
  if (active.length === 0) return rows;
  return rows.filter(row => active.every(([key, values]) => values.includes(String(row[key]))));
}

/** Sum or mean of a measure; null when no row carries a number, so "no data" never reads as zero. */
export function aggregate(rows: SliceRow[], measure: string, how: SliceAggregation = 'sum'): number | null {
  let total = 0;
  let count = 0;
  for (const row of rows) {
    const value = row[measure];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    total += value;
    count += 1;
  }
  if (count === 0) return null;
  return how === 'mean' ? total / count : total;
}

export type SliceGroup = {
  key: string;
  /** The aggregate across every split value (or of the whole group when unsplit). */
  total: number | null;
  /** One aggregate per split value, in `splitKeys` order; empty when unsplit. */
  parts: Array<number | null>;
};

export type SliceResult = {
  groups: SliceGroup[];
  splitKeys: string[];
};

/**
 * Groups filtered rows by `breakdown` (and optionally `split`), aggregating
 * `measure`. Groups and split values respect the filters, keep their
 * declared order, and are then ranked if the breakdown dimension sorts by
 * value. Groups with no data at all are dropped rather than shown as zero.
 */
export function slice({
  rows,
  breakdown,
  split,
  measure,
  aggregation = 'sum',
  filters = {},
}: {
  rows: SliceRow[];
  breakdown: SliceDimension;
  split?: SliceDimension;
  measure: string;
  aggregation?: SliceAggregation;
  filters?: SliceFilters;
}): SliceResult {
  const filtered = filterRows(rows, filters);
  const allowed = (dimension: SliceDimension) => {
    const selected = filters[dimension.key];
    const values = dimensionValues(rows, dimension);
    return selected && selected.length > 0 ? values.filter(value => selected.includes(value)) : values;
  };

  const splitKeys = split ? allowed(split) : [];
  const byGroup = new Map<string, SliceRow[]>();
  for (const row of filtered) {
    const key = String(row[breakdown.key]);
    const list = byGroup.get(key);
    if (list) list.push(row);
    else byGroup.set(key, [row]);
  }

  let groups: SliceGroup[] = allowed(breakdown)
    .filter(key => byGroup.has(key))
    .map(key => {
      const groupRows = byGroup.get(key)!;
      const parts = split ? splitKeys.map(splitKey => aggregate(groupRows.filter(row => String(row[split.key]) === splitKey), measure, aggregation)) : [];
      return { key, total: aggregate(groupRows, measure, aggregation), parts };
    })
    .filter(group => group.total !== null);

  const sortBy = breakdown.sort ?? (breakdown.values ? 'none' : 'value');
  if (sortBy === 'value') groups = [...groups].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  if (breakdown.last?.length) {
    const pinned = new Set(breakdown.last);
    groups = [...groups.filter(g => !pinned.has(g.key)), ...groups.filter(g => pinned.has(g.key))];
  }
  return { groups, splitKeys };
}

export function pluralOf(dimension: SliceDimension): string {
  return dimension.plural ?? `${dimension.label.toLowerCase()} categories`;
}

/**
 * "Showing 4 of 5 reasons · Year: 2025" — and, for every dimension that is
 * neither drawn nor filtered, that its values have been added together. A
 * total over seven years is a legitimate figure, but only if the reader is
 * told it is one.
 */
export function statusLine({
  rows,
  dimensions,
  breakdown,
  split,
  filters,
  shown,
  aggregation,
}: {
  rows: SliceRow[];
  dimensions: SliceDimension[];
  breakdown: SliceDimension;
  split?: SliceDimension;
  filters: SliceFilters;
  shown: number;
  aggregation: SliceAggregation;
}): string {
  const parts = [`Showing ${shown} of ${dimensionValues(rows, breakdown).length} ${pluralOf(breakdown)}`];
  if (split) {
    const chosen = filters[split.key] ?? [];
    parts.push(`split by ${split.label.toLowerCase()}${chosen.length ? ` (${chosen.join(', ')})` : ''}`);
  }
  const combined = aggregation === 'mean' ? 'averaged' : 'added together';
  for (const dimension of dimensions) {
    if (dimension.key === breakdown.key || dimension.key === split?.key) continue;
    const chosen = filters[dimension.key] ?? [];
    const all = dimensionValues(rows, dimension).length;
    if (chosen.length === 1) parts.push(`${dimension.label}: ${chosen[0]}`);
    else if (chosen.length > 1) parts.push(`${dimension.label}: ${chosen.join(', ')} ${combined}`);
    else if (all > 1) parts.push(`${dimension.label}: all ${all} ${combined}`);
  }
  return parts.join(' · ');
}
