import type { Fact, FactStatus } from './types';

/**
 * The reading order for facts nobody ranks — the tail below. Not the
 * declaration order of `FACT_STATUSES`: `not-supported` sorts last because a
 * claim the evidence runs against is the least useful thing to meet first,
 * even though it is a stronger evidential statement than `unknown`.
 */
export const FACT_STATUS_ORDER: readonly FactStatus[] = [
  'well-supported',
  'contested',
  'complicated',
  'unknown',
  'not-supported',
];

function byId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Map every fact id to the headline fact it is ranked as: itself for a
 * headline fact, its parent for a supporting one. A `supports` pointing at a
 * fact that does not exist is left standing as its own headline here — the
 * validator reports it, and the ranker's job in the meantime is to keep the
 * fact visible rather than silently drop it.
 */
function headlineIds(facts: readonly Fact[]): Map<string, string> {
  const ids = new Set(facts.map((f) => f.id));
  const headlineOf = new Map<string, string>();
  for (const f of facts) {
    headlineOf.set(f.id, f.supports !== undefined && ids.has(f.supports) ? f.supports : f.id);
  }
  return headlineOf;
}

function isHeadline(fact: Fact, headlineOf: ReadonlyMap<string, string>): boolean {
  return headlineOf.get(fact.id) === fact.id;
}

/**
 * The facts that appear in the top-level Facts list — those that are evidence
 * for nothing else — in the order they were given. A fact whose `supports`
 * points at nothing counts as headline here so that it is still visible while
 * the validator reports it, rather than disappearing from both levels.
 */
export function headlineFacts(facts: readonly Fact[]): Fact[] {
  const headlineOf = headlineIds(facts);
  return facts.filter((f) => isHeadline(f, headlineOf));
}

/**
 * Group supporting facts under the id of the headline fact they support, in
 * the order they should read within it: by status, then by id — the same
 * ordering as the unranked tail, so the evidence comes before the "what about
 * X" claims it defuses. There is no derived signal to order them by, and a
 * supporting fact is read inside its parent rather than competing for the top
 * of the page, which is what made the derived order necessary in the first
 * place.
 */
export function supportingFactsByParent(facts: readonly Fact[]): Map<string, Fact[]> {
  const headlineOf = headlineIds(facts);
  const groups = new Map<string, Fact[]>();
  for (const f of facts) {
    if (isHeadline(f, headlineOf)) continue;
    const parent = headlineOf.get(f.id)!;
    const group = groups.get(parent);
    if (group) group.push(f);
    else groups.set(parent, [f]);
  }
  for (const group of groups.values()) group.sort(byStatusThenId);
  return groups;
}

function byStatusThenId(a: Fact, b: Fact): number {
  return (
    FACT_STATUS_ORDER.indexOf(a.status) - FACT_STATUS_ORDER.indexOf(b.status) || byId(a.id, b.id)
  );
}

/**
 * Order data exactly as the topic declares it. Supporting data follows its
 * headline item; any headline omitted from the list forms a predictable tail
 * while validation reports the incomplete metadata.
 */
export function rankFacts(
  facts: readonly Fact[],
  dataOrder: readonly string[]
): Fact[] {
  const headlineOf = headlineIds(facts);
  const factById = new Map(facts.map((f) => [f.id, f]));
  const ranked = dataOrder
    .map((id) => headlineOf.get(id))
    .filter((id): id is string => id !== undefined)
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .map((id) => factById.get(id)!);
  const isPlaced = new Set(ranked.map((f) => f.id));
  const tail = facts
    .filter((f) => isHeadline(f, headlineOf) && !isPlaced.has(f.id))
    .sort(byStatusThenId);

  // Every fact is returned, headline facts in derived order with the facts
  // supporting each one immediately after it. The list is a flattened
  // two-level tree rather than a ranking of all 28 facts: the page reads the
  // headline facts off the top level and renders the rest inside their
  // parent, and nothing is dropped on the way.
  const supporting = supportingFactsByParent(facts);
  return [...ranked, ...tail].flatMap((f) => [f, ...(supporting.get(f.id) ?? [])]);
}

/**
 * Sort viewpoints by their explicit `order`, id as tie-break. Trivial, but it
 * lives beside `rankFacts` because it answers the same question — what does
 * the reader meet first — and because the two must not drift apart into
 * "one section is derived, the other is whatever the filenames happen to be".
 */
export function sortViewpoints(viewpoints: Array<{ id: string; order: number }>): void {
  viewpoints.sort((a, b) => a.order - b.order || byId(a.id, b.id));
}
