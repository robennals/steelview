import { rankOf } from '@/lib/chart/comparison-preview';

type ColumnItem = { label: string; value: number; highlight?: boolean };

/** Above this many items a preview draws one thin column per item instead of a labelled row. */
export const DENSE_PREVIEW_ITEMS = 12;

/**
 * Above this many items a preview clamps its rows — one-line labels, smaller
 * type, thinner bars — so the chart fits the carousel's fixed height.
 */
export const COMPACT_PREVIEW_ITEMS = 6;

/**
 * Whether a long preview can be drawn as ranked columns: only when that reads
 * honestly — no negative values to draw below zero, and at most one
 * highlighted subject, whose rank it states. Anything else stays as rows,
 * clamped to fit.
 */
export function fitsRankedColumns(items: ColumnItem[]): boolean {
  return items.length > DENSE_PREVIEW_ITEMS && items.every(item => item.value >= 0) && items.filter(item => item.highlight).length <= 1;
}

/**
 * A long comparison in a compact preview: one thin column per item, every
 * item, ranked from highest, with the highlighted subject in the accent and
 * its rank stated (AUTHORING.md, "Country comparisons must not be
 * cherry-picked"). Each column's label and value are in visually hidden text.
 * Shared by ComparisonChart and BarChart, so both clamp a long list alike.
 */
export function RankedColumns({ items, max, format }: { items: ColumnItem[]; /** The top of the scale: at least the largest value. */ max: number; format: (value: number) => string }) {
  const ranked = [...items].sort((a, b) => b.value - a.value);
  const rank = rankOf(items);
  const subject = items.find(item => item.highlight);
  return (
    <>
      <ol className="sv-comparison__columns">
        {ranked.map((item, index) => (
          <li key={`${item.label}-${index}`} className="sv-comparison__column" data-highlight={item.highlight || undefined}>
            <span className="sv-visually-hidden">{item.label}: {format(item.value)}</span>
            <span className="sv-comparison__column-bar" aria-hidden="true" style={{ height: `${Math.max(0, item.value) / (max || 1) * 100}%` }} />
          </li>
        ))}
      </ol>
      {rank && subject && <p className="sv-comparison__rank">{rank.label}: {format(subject.value)} — {ordinal(rank.rank)} of {rank.of}</p>}
    </>
  );
}

function ordinal(n: number): string {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}
