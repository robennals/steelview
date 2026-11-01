/**
 * The arithmetic behind CompositionBar: turn each row's parts into shares
 * of that row's total, and optionally fold small parts into "Other".
 */

import { pointValue, type FigureNumber } from './qualified';
import { seriesColor } from './scale';
import type { SourceCredit } from './types';

export type CompositionCategory = { key: string; label: string };

export type CompositionRowInput = {
  label: string;
  /** Part sizes by category key, as counts or as percentages — shares are recomputed either way. A qualified part is sized by its number (a range by its midpoint). */
  values: Record<string, FigureNumber>;
  /** A row from a different counter or survey cites its own sources, shown after the row label. */
  sources?: SourceCredit[];
  /** The total the source states, shown in place of the parts' sum (the validator checks they agree within rounding). */
  total?: number;
};

export type CompositionSegment = {
  key: string;
  label: string;
  value: number;
  /** The part as the source gives it, qualifier and wording included; absent for a folded "Other". */
  published?: FigureNumber;
  /** Share of the row total, 0–100. */
  share: number;
};

/** `total` is the source's stated total when it gives one, else the parts' sum. Shares are always of the parts' sum, so a bar fills its width. */
export type CompositionRow = { label: string; total: number; segments: CompositionSegment[]; sources?: SourceCredit[] };

export const OTHER_KEY = '__other';

/**
 * Categories folded into "Other" are those below `threshold` percent in
 * every row. Folding is decided across all rows, not per row, so the same
 * category is never "Other" in 2011 and named in 2021 — that would make the
 * comparison the figure exists for impossible.
 */
export function compose(
  categories: CompositionCategory[],
  rows: CompositionRowInput[],
  { otherThreshold, otherLabel = 'Other' }: { otherThreshold?: number; otherLabel?: string } = {},
): { categories: CompositionCategory[]; rows: CompositionRow[] } {
  const size = (row: CompositionRowInput, key: string) => {
    const part = row.values[key];
    return part === undefined ? 0 : Math.max(0, pointValue(part));
  };
  const totals = rows.map(row => categories.reduce((sum, category) => sum + size(row, category.key), 0));
  const shareOf = (rowIndex: number, key: string) => (totals[rowIndex] > 0 ? (size(rows[rowIndex], key) / totals[rowIndex]) * 100 : 0);

  const folded = new Set(
    otherThreshold === undefined
      ? []
      : categories.filter(category => rows.every((_, i) => shareOf(i, category.key) < otherThreshold)).map(c => c.key),
  );
  // Folding a single category into "Other" only renames it.
  if (folded.size < 2) folded.clear();

  const kept = categories.filter(category => !folded.has(category.key));
  const outCategories = folded.size > 0 ? [...kept, { key: OTHER_KEY, label: otherLabel }] : kept;

  return {
    categories: outCategories,
    rows: rows.map((row, i) => {
      const segments: CompositionSegment[] = kept.map(category => ({
        key: category.key,
        label: category.label,
        value: size(row, category.key),
        published: row.values[category.key],
        share: shareOf(i, category.key),
      }));
      if (folded.size > 0) {
        const value = [...folded].reduce((sum, key) => sum + size(row, key), 0);
        segments.push({ key: OTHER_KEY, label: otherLabel, value, share: totals[i] > 0 ? (value / totals[i]) * 100 : 0 });
      }
      return { label: row.label, total: row.total ?? totals[i], segments, ...(row.sources ? { sources: row.sources } : {}) };
    }),
  };
}

/** A part's colour: the next series hue in category order, and a neutral grey for "Other". */
export function compositionColor(categories: CompositionCategory[], key: string): string {
  return key === OTHER_KEY ? 'var(--ink-4)' : seriesColor(categories.findIndex(c => c.key === key) + 1);
}
