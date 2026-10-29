type RankedItem = { label: string; value: number; highlight?: boolean };

/**
 * Where a comparison's highlighted item sits in the full distribution, ranked
 * from highest. A compact preview may emphasize the subject and state its rank
 * instead of labelling every bar (AUTHORING.md, "Country comparisons must not
 * be cherry-picked"); ties share the better rank so the subject is never
 * placed below an equal value.
 */
export function rankOf(items: RankedItem[]): { label: string; rank: number; of: number } | null {
  const subject = items.find(item => item.highlight);
  if (!subject) return null;
  return { label: subject.label, rank: 1 + items.filter(item => item.value > subject.value).length, of: items.length };
}
