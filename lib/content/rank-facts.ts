import type { Fact, FactStatus } from './types';
import { citedFactIds } from './markdown';

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
 * Order facts by *diversity of support* rather than by any one editor's or
 * any one viewpoint's judgement.
 *
 * The Facts section shows only its first three facts before collapsing, so
 * whatever decides that top three is, in practice, the page's opening
 * argument. Letting an author hand-rank it — or letting file order decide —
 * hands that opening to one side. So the order is derived:
 *
 * 0. **Only headline facts are ranked.** A fact with `supports` is evidence
 *    for a larger claim, and reads inside that claim rather than competing
 *    with it for the top of the page. A viewpoint citing a supporting fact
 *    counts towards its parent — relying on a detail is relying on the claim
 *    the detail supports.
 * 1. **Each viewpoint ranks its own facts** (see `rankingFor`).
 * 2. **Round-robin by rank.** Round 1 places every viewpoint's 1st-ranked
 *    fact, round 2 every viewpoint's 2nd, and so on. No viewpoint's (k+1)th
 *    fact can be placed before every viewpoint's kth has been placed or that
 *    viewpoint has run out of facts. A viewpoint that ranks twenty facts
 *    therefore cannot bury a viewpoint that ranks three.
 * 3. **A shared pick costs both viewpoints their turn.** Indexing is into the
 *    viewpoint's own list, not into "its highest unplaced fact": if two
 *    viewpoints both rank X first, X is placed once and neither gets to
 *    substitute something else into round 1. Agreeing on what matters is not
 *    supposed to win a side extra slots.
 * 4. **Within a round, breadth of agreement wins.** A fact picked by more
 *    viewpoints in that round comes first; ties break on how many viewpoints
 *    rank the fact at all (`citesFacts` or `acknowledges` — *not*
 *    `setsAside`, which says the claim does no work), then on id.
 *    Deliberately *not* on file order or on a viewpoint's position in the
 *    section — either would permanently hand slot 1 to the same side.
 * 5. **Unranked headline facts form a tail**, by status then id. A `complicated`,
 *    `unknown` or `not-supported` fact can only ever reach `setsAside` (the
 *    schema and validator allow it nowhere else), so it always lands here:
 *    those statuses claim nothing, so they should not open the page.
 *
 * The result does not depend on the order of `viewpoints` or of `facts`.
 */
export function rankFacts(
  facts: readonly Fact[],
  dataOrder: readonly string[] | readonly { summary: string; body: string }[]
): Fact[] {
  const headlineOf = headlineIds(facts);
  const factById = new Map(facts.map((f) => [f.id, f]));
  const orderIsExplicit = dataOrder.every((item) => typeof item === 'string');
  const rankedIds = orderIsExplicit
    ? (dataOrder as readonly string[])
    : (dataOrder as readonly { summary: string; body: string }[]).flatMap((viewpoint) =>
        citedFactIds(`${viewpoint.summary}\n${viewpoint.body}`)
      );
  const ranked = rankedIds
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
