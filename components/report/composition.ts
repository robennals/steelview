/**
 * The arithmetic behind CompositionBar: turn each row's parts into shares
 * of that row's total, and optionally fold small parts into "Other".
 */

import type { SourceCredit } from './types';

export type CompositionCategory = { key: string; label: string };

export type CompositionRowInput = {
  label: string;
  /** Part sizes by category key, as counts or as percentages — shares are recomputed either way. */
  values: Record<string, number>;
  /** A row from a different counter or survey cites its own source, shown after the row label. */
  source?: SourceCredit;
};

export type CompositionSegment = {
  key: string;
  label: string;
  value: number;
  /** Share of the row total, 0–100. */
  share: number;
};

export type CompositionRow = { label: string; total: number; segments: CompositionSegment[]; source?: SourceCredit };

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
  const totals = rows.map(row => categories.reduce((sum, category) => sum + Math.max(0, row.values[category.key] ?? 0), 0));
  const shareOf = (rowIndex: number, key: string) =>
    totals[rowIndex] > 0 ? (Math.max(0, rows[rowIndex].values[key] ?? 0) / totals[rowIndex]) * 100 : 0;

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
        value: Math.max(0, row.values[category.key] ?? 0),
        share: shareOf(i, category.key),
      }));
      if (folded.size > 0) {
        const value = [...folded].reduce((sum, key) => sum + Math.max(0, row.values[key] ?? 0), 0);
        segments.push({ key: OTHER_KEY, label: otherLabel, value, share: totals[i] > 0 ? (value / totals[i]) * 100 : 0 });
      }
      return { label: row.label, total: totals[i], segments, ...(row.source ? { source: row.source } : {}) };
    }),
  };
}
