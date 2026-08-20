import type { Topic } from './types';

/**
 * Check the cross-reference graph of an already-shape-valid topic. Returns one
 * message per violation rather than throwing, so a single run reports every
 * problem in a topic instead of only the first — an author fixing content
 * wants the whole list.
 *
 * Rules are numbered to match the "Validation" section of the design spec.
 */
export function validateTopic(topic: Topic): string[] {
  const errors: string[] = [];
  const factById = new Map(topic.facts.map((f) => [f.id, f]));
  const viewpointById = new Map(topic.viewpoints.map((v) => [v.id, v]));
  const principleById = new Map(topic.principles.map((p) => [p.id, p]));
  const viewpointIds = new Set(topic.viewpoints.map((v) => v.id));
  const principleIds = new Set(topic.principles.map((p) => p.id));

  // Facts referenced by any viewpoint in any way, and principles claimed by a
  // real viewpoint — used for the orphan check (rule 8).
  const referencedFacts = new Set<string>();
  const heldPrinciples = new Set<string>();

  const CITABLE_STATUSES = new Set(['well-supported', 'contested']);

  for (const v of topic.viewpoints) {
    const lists: Array<[string, string[]]> = [
      ['citesFacts', v.citesFacts],
      ['acknowledges', v.acknowledges],
      ['setsAside', v.setsAside],
    ];
    const listOfFact = new Map<string, string>();

    for (const [listName, ids] of lists) {
      for (const id of ids) {
        const f = factById.get(id);
        if (!f) {
          // rule 1
          errors.push(`viewpoint ${v.id}: ${listName} references unknown fact "${id}"`);
          continue;
        }
        referencedFacts.add(id);

        // rule 2 — one relationship per fact per viewpoint
        const previous = listOfFact.get(id);
        if (previous) {
          errors.push(`viewpoint ${v.id}: fact "${id}" appears in both ${previous} and ${listName}`);
        } else {
          listOfFact.set(id, listName);
        }

        // rule 2 — status gates
        if (listName === 'citesFacts' && !CITABLE_STATUSES.has(f.status)) {
          errors.push(
            `viewpoint ${v.id}: citesFacts may not include "${id}" (status ${f.status}) — only well-supported or contested facts can be built on; put it in setsAside instead`
          );
        }
        if (listName === 'acknowledges' && f.status !== 'well-supported') {
          errors.push(
            `viewpoint ${v.id}: acknowledges may only include well-supported facts, but "${id}" is ${f.status}`
          );
        }
      }
    }

    // rule 6
    if (v.acknowledges.length === 0) {
      errors.push(
        `viewpoint ${v.id}: acknowledges is empty — a viewpoint that concedes nothing is advocacy, not a steelman`
      );
    }

    // rule 1
    for (const id of v.principles) {
      if (!principleIds.has(id)) errors.push(`viewpoint ${v.id}: references unknown principle "${id}"`);
    }
  }

  for (const f of topic.facts) {
    // rule 3 — every fact, whatever its status. Nothing is presented as a
    // fact on this page without a quoted source behind it; a `complicated` or
    // `unknown` fact makes a claim about the evidence too, and an unsourced
    // one is just an assertion in a badge.
    if (f.sources.length === 0) {
      errors.push(`fact ${f.id}: every fact needs at least one source, whatever its status`);
    }
    // rule 4 — every fact needs a body. A bare claim plus a status badge is
    // exactly the misleading-in-isolation number this project exists to
    // avoid; the body is where scope, denominator and comparison live.
    if (f.body.trim().length === 0) {
      errors.push(
        `fact ${f.id}: every fact needs a body giving its context — what it measures and does not, how it compares, how confident to be, and what it is commonly mistaken for`
      );
    }
    // rule 11 — the fact hierarchy is exactly two levels deep. A supporting
    // fact is evidence for one headline claim; a headline claim stands on its
    // own. Chains and cycles are rejected rather than flattened, because a
    // tree of arbitrary depth is not something a reader can hold in their
    // head, and because a silently flattened chain would put a fact somewhere
    // its author did not intend.
    if (f.supports !== undefined) {
      const parent = factById.get(f.supports);
      if (!parent) {
        errors.push(`fact ${f.id}: supports references unknown fact "${f.supports}"`);
      } else if (parent.id === f.id) {
        errors.push(`fact ${f.id}: supports itself`);
      } else if (parent.supports !== undefined) {
        errors.push(
          `fact ${f.id}: supports "${parent.id}", which is itself a supporting fact (it supports "${parent.supports}") — the hierarchy is exactly one level deep, so point at a headline fact instead`
        );
      }
    }
    // rule 5
    if (f.status === 'contested') {
      if (!f.sources.some((s) => s.stance === 'supports')) {
        errors.push(`fact ${f.id}: a contested fact needs at least one "supports" source`);
      }
      if (!f.sources.some((s) => s.stance === 'contests')) {
        errors.push(`fact ${f.id}: a contested fact needs at least one "contests" source`);
      }
    }
  }

  for (const p of topic.principles) {
    for (const id of p.heldBy) {
      // rule 1
      if (!viewpointIds.has(id)) {
        errors.push(`principle ${p.id}: heldBy references unknown viewpoint "${id}"`);
        continue;
      }
      heldPrinciples.add(p.id);

      // rule 10 — heldBy and principles are the same relationship stated from
      // two ends; if they disagree, the disagreeing end renders with no
      // inbound link from anywhere on the page.
      const v = viewpointById.get(id);
      if (v && !v.principles.includes(p.id)) {
        errors.push(
          `principle ${p.id}: heldBy lists viewpoint "${id}", but ${id}.principles does not list "${p.id}" — add it there too`
        );
      }
    }
  }

  for (const v of topic.viewpoints) {
    for (const id of v.principles) {
      const p = principleById.get(id);
      // rule 10, the other direction
      if (p && !p.heldBy.includes(v.id)) {
        errors.push(
          `viewpoint ${v.id}: principles lists "${id}", but principle ${id}.heldBy does not list "${v.id}" — add it there too`
        );
      }
    }
  }

  for (const c of topic.cruxes) {
    const positioned = new Set(c.positions.map((p) => p.viewpoint));
    for (const id of c.divides) {
      // rule 1
      if (!viewpointIds.has(id)) {
        errors.push(`crux ${c.id}: divides references unknown viewpoint "${id}"`);
        continue;
      }
      // rule 7
      if (!positioned.has(id)) {
        errors.push(`crux ${c.id}: no position given for viewpoint "${id}"`);
      }
    }
    for (const p of c.positions) {
      if (!viewpointIds.has(p.viewpoint)) {
        errors.push(`crux ${c.id}: position references unknown viewpoint "${p.viewpoint}"`);
      } else if (!c.divides.includes(p.viewpoint)) {
        errors.push(`crux ${c.id}: gives a position for "${p.viewpoint}", which it does not list in divides`);
      }
    }
  }

  // rule 9 — a page showing "all sides" needs at least a fact to found itself
  // on and two sides to show; catches a mistyped directory name (`crux/`
  // instead of `cruxes/`) that would otherwise ship a silently empty section.
  if (topic.facts.length < 1) {
    errors.push('topic: needs at least 1 fact — add a fact under facts/');
  }
  if (topic.viewpoints.length < 2) {
    errors.push('topic: needs at least 2 viewpoints — add another viewpoint under viewpoints/');
  }

  // rule 8. A supporting fact is exempt: its parent is what justifies it
  // being on the page, so it need not be referenced by any viewpoint. The
  // rule still bites on headline facts, which is where it does its work —
  // keeping the top-level Facts list from silting up with true-but-irrelevant
  // material.
  for (const f of topic.facts) {
    if (f.supports !== undefined && factById.has(f.supports)) continue;
    if (!referencedFacts.has(f.id)) {
      errors.push(
        `fact ${f.id}: orphan — no viewpoint cites, acknowledges or sets it aside, so it does no work on the page`
      );
    }
  }
  for (const p of topic.principles) {
    if (!heldPrinciples.has(p.id)) {
      errors.push(`principle ${p.id}: orphan — no real viewpoint holds it`);
    }
  }

  return errors;
}
