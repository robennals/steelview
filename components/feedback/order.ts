/**
 * `items` in the order `ids` gives, which was ranked when the reader opened
 * the list, so nothing moves under their finger as they back or mark
 * things. Anything added since (the reader's own) goes on top, where they can
 * see it.
 */
export function inOpeningOrder<T extends { id: string }>(items: T[], ids: string[]): T[] {
  const byId = new Map(items.map(item => [item.id, item]));
  return [
    ...items.filter(item => !ids.includes(item.id)),
    ...ids.flatMap(id => byId.get(id) ?? []),
  ];
}
