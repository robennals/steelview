import type { Fact, FactStatus, Viewpoint } from './types';

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
 * What one viewpoint would put at the top of the Facts section, most
 * important first: the facts it argues *from* (`citesFacts`, in the order
 * written), then the facts it concedes (`acknowledges`, in the order
 * written). A fact it only sets aside is not ranked by it at all — setting a
 * claim aside is a statement that it does no work for this viewpoint.
 *
 * Duplicates are collapsed to their first appearance so a repeated id cannot
 * buy a viewpoint two turns in the round-robin below.
 */
function rankingFor(viewpoint: Viewpoint, factIds: ReadonlySet<string>): string[] {
  const seen = new Set<string>();
  const ranking: string[] = [];
  for (const id of [...viewpoint.citesFacts, ...viewpoint.acknowledges]) {
    if (!factIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    ranking.push(id);
  }
  return ranking;
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
 *    reference the fact anywhere (including `setsAside`), then on id.
 *    Deliberately *not* on file order or on a viewpoint's position in the
 *    section — either would permanently hand slot 1 to the same side.
 * 5. **Unranked facts form a tail**, by status then id. A `complicated`,
 *    `unknown` or `not-supported` fact can only ever reach `setsAside` (the
 *    schema and validator allow it nowhere else), so it always lands here:
 *    those statuses claim nothing, so they should not open the page.
 *
 * The result does not depend on the order of `viewpoints` or of `facts`.
 */
export function rankFacts(facts: readonly Fact[], viewpoints: readonly Viewpoint[]): Fact[] {
  const factIds = new Set(facts.map((f) => f.id));
  const rankings = viewpoints.map((v) => rankingFor(v, factIds));

  // How many viewpoints reference each fact in any way at all — the first
  // tie-break within a round.
  const references = new Map<string, number>();
  for (const v of viewpoints) {
    for (const id of new Set([...v.citesFacts, ...v.acknowledges, ...v.setsAside])) {
      if (factIds.has(id)) references.set(id, (references.get(id) ?? 0) + 1);
    }
  }

  const placed: string[] = [];
  const isPlaced = new Set<string>();
  const rounds = rankings.reduce((max, r) => Math.max(max, r.length), 0);

  for (let k = 0; k < rounds; k++) {
    const picks = new Map<string, number>();
    for (const ranking of rankings) {
      const id = ranking[k];
      // An already-placed fact still spends this viewpoint's turn — it just
      // adds nothing new to the round.
      if (id === undefined || isPlaced.has(id)) continue;
      picks.set(id, (picks.get(id) ?? 0) + 1);
    }
    const round = [...picks.entries()].sort(
      ([idA, countA], [idB, countB]) =>
        countB - countA ||
        (references.get(idB) ?? 0) - (references.get(idA) ?? 0) ||
        byId(idA, idB)
    );
    for (const [id] of round) {
      isPlaced.add(id);
      placed.push(id);
    }
  }

  const factById = new Map(facts.map((f) => [f.id, f]));
  const ranked = placed.map((id) => factById.get(id)!);
  const tail = facts
    .filter((f) => !isPlaced.has(f.id))
    .sort(
      (a, b) =>
        FACT_STATUS_ORDER.indexOf(a.status) - FACT_STATUS_ORDER.indexOf(b.status) ||
        byId(a.id, b.id)
    );

  return [...ranked, ...tail];
}

/**
 * Sort viewpoints by their explicit `order`, id as tie-break. Trivial, but it
 * lives beside `rankFacts` because it answers the same question — what does
 * the reader meet first — and because the two must not drift apart into
 * "one section is derived, the other is whatever the filenames happen to be".
 */
export function sortViewpoints(viewpoints: Viewpoint[]): void {
  viewpoints.sort((a, b) => a.order - b.order || byId(a.id, b.id));
}
