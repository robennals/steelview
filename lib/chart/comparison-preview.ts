type RankedItem = { label: string; value: number; highlight?: boolean };

/**
 * Where a comparison's one highlighted item sits in the full distribution,
 * ranked from highest; null unless exactly one item is highlighted. A compact
 * preview may emphasize the subject and state its rank instead of labelling
 * every bar (AUTHORING.md, "Country comparisons must not be cherry-picked");
 * ties share the better rank so the subject is never placed below an equal
 * value.
 */
export function rankOf(items: RankedItem[]): { label: string; rank: number; of: number } | null {
  const highlighted = items.filter(item => item.highlight);
  // Several highlighted items are a comparison among them, not one subject.
  if (highlighted.length !== 1) return null;
  const subject = highlighted[0];
  return { label: subject.label, rank: 1 + items.filter(item => item.value > subject.value).length, of: items.length };
}
