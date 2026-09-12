import { citedFactIds, citedFactTargets } from './markdown';
import { comparePeriods } from './period';
import type { Fact, Series, Topic } from './types';

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
    for (const id of f.relatedFacts ?? []) {
      if (id === f.id || !topic.facts.some(fact => fact.id === id)) errors.push(`fact ${f.id}: related fact ${id} must name another fact`);
    }
    // rule 14
    const datasets = [...(f.series ? [f.series] : []), ...(f.additionalSeries ?? [])];
    for (const series of datasets) errors.push(...seriesErrors(f.id, series));
    const artifactIds = ['series', ...(f.additionalSeries ?? []).map(s => s.id), ...datasets.flatMap(s => s.readings.map(r => r.id)), ...(f.comparisons ?? []).map(c => c.id)];
    if (new Set(artifactIds).size !== artifactIds.length) errors.push(`fact ${f.id}: chart IDs must be unique`);
    const sourceCount = f.sources.length + datasets.reduce((n, series) => n + 1 + series.readings.filter(r => r.source).length, 0);
    const chartIds = new Set<string>();
    for (const chart of f.comparisons ?? []) {
      if (chartIds.has(chart.id)) errors.push(`fact ${f.id}: duplicate comparison chart id ${chart.id}`);
      chartIds.add(chart.id);
      if (chart.groups) {
        if (chart.defaultGroup !== undefined && chart.defaultGroup >= chart.groups.length) errors.push(`fact ${f.id}: invalid default comparison group`);
        if (new Set(chart.groups).size !== chart.groups.length) errors.push(`fact ${f.id}: duplicate comparison group`);
        for (const item of chart.items) {
          if (!item.values || item.values.length !== chart.groups.length || Math.abs(item.values.reduce((a, b) => a + b, 0) - item.value) > 1e-8) errors.push(`fact ${f.id}: comparison components must match groups and sum to the total for ${item.label}`);
        }
      } else if (chart.defaultGroup !== undefined || chart.items.some(item => item.values)) errors.push(`fact ${f.id}: comparison breakdown requires group labels`);

      for (const n of chart.sources) {
        if (n > sourceCount) errors.push(`fact ${f.id}: unknown comparison source ${n}`);
      }
    }
    for (const id of f.featuredCharts ?? []) {
      const child = factById.get(id);
      if (!child || child.supports !== f.id || (!child.series && !child.comparisons?.length)) {
        errors.push(`fact ${f.id}: featured chart ${id} must belong to a supporting fact with charts`);
      }
    }
    for (const n of f.claimSources ?? []) {
      if (n > sourceCount) errors.push(`fact ${f.id}: unknown lead source ${n}`);
    }
    const anchors = [...f.body.matchAll(/\{#([a-z0-9-]+)\}/g)].map(m => m[1]);
    if (new Set(anchors).size !== anchors.length) errors.push(`fact ${f.id}: duplicate section id`);
    for (const match of f.body.matchAll(/\]\(#source-([a-z0-9-]+)-(\d+)\)/g)) {
      if (match[1] !== f.id || Number(match[2]) > sourceCount || Number(match[2]) < 1) errors.push(`fact ${f.id}: unknown source reference ${match[1]}-${match[2]}`);
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

  errors.push(...citationErrors(topic, factById));

  return errors;
}

/**
 * Rule 14 — a fact's time series.
 *
 * The shape is already guaranteed by the schema: a title, a description, a
 * period label, a declared coverage, at least one reading, each with a unit,
 * a value-axis label and at least one line of at least two points, and a
 * complete quoted source. What the schema cannot see is whether the data
 * *keeps the promise the coverage makes*, and that is the whole feature:
 *
 * > It's very easy to give a misleading picture by cherry picking dates.
 * > Harder if we require always showing a time series.
 *
 * A series that declares 1964–2025 and supplies 1990–2025 is exactly the
 * cherry-pick the chart exists to expose, dressed up as the fix for it. So the
 * coverage is not a caption: every line must begin at `coverage.from` and end
 * at `coverage.to`, or the build fails. Trimming a line to a flattering window
 * is then impossible without also editing the claim about what the source
 * publishes — which is a lie a reader can check against the cited workbook,
 * rather than an omission they cannot see.
 *
 * The remaining rules keep the drawing honest: points strictly ascending (an
 * unordered or duplicated period draws a line that doubles back on itself),
 * and every annotated break inside the range it is annotating.
 */
function seriesErrors(factId: string, series: Series): string[] {
  const errors: string[] = [];
  const where = `fact ${factId}: series`;

  if (comparePeriods(series.coverage.from, series.coverage.to) > 0) {
    errors.push(
      `${where} coverage runs backwards — from "${series.coverage.from}" to "${series.coverage.to}"`
    );
  }

  const seenReadings = new Set<string>();
  for (const reading of series.readings) {
    if (seenReadings.has(reading.id)) {
      errors.push(`${where} has two readings with id "${reading.id}"`);
    }
    seenReadings.add(reading.id);

    for (const line of reading.lines) {
      const at = `${where} reading "${reading.id}" line "${line.name}"`;

      let ordered = true;
      for (let i = 1; i < line.points.length; i += 1) {
        const previous = line.points[i - 1].period;
        const period = line.points[i].period;
        if (comparePeriods(previous, period) >= 0) {
          errors.push(
            `${at}: point "${period}" does not come after "${previous}" — points must be in ascending order with no repeats`
          );
          ordered = false;
          break;
        }
      }
      if (!ordered) continue;

      const first = line.points[0].period;
      const last = line.points[line.points.length - 1].period;
      if (comparePeriods(first, series.coverage.from) !== 0) {
        errors.push(
          `${at}: starts at "${first}" but the series says the source publishes from "${series.coverage.from}" — show the whole published range, or the chart is the cherry-pick it is meant to prevent`
        );
      }
      if (comparePeriods(last, series.coverage.to) !== 0) {
        errors.push(
          `${at}: ends at "${last}" but the series says the source publishes to "${series.coverage.to}" — show the whole published range, or the chart is the cherry-pick it is meant to prevent`
        );
      }
    }
  }

  for (const gap of series.breaks) {
    if (
      comparePeriods(gap.period, series.coverage.from) < 0 ||
      comparePeriods(gap.period, series.coverage.to) > 0
    ) {
      errors.push(
        `${where} annotates a break at "${gap.period}", which is outside the declared coverage ${series.coverage.from}–${series.coverage.to}`
      );
    }
  }

  return errors;
}

/**
 * Rules 12 and 13 — inline fact citations in prose.
 *
 * A body may cite a fact by linking to its anchor:
 * `[net migration reached 944,000](#fact-net-migration-2024)`. That link is
 * the page's honesty signal at the point of use, so it gets the same
 * treatment as every other cross-reference on the page:
 *
 * 12. it must resolve to a real fact in this topic — a dead citation is a
 *     claim that looks sourced and is not, which is worse than an unlinked
 *     one;
 * 13. in a *viewpoint*, it must point at a fact that viewpoint already lists
 *     in `citesFacts`, `acknowledges` or `setsAside`. The frontmatter lists
 *     are what the ranking, the chips and the orphan rule all read; if the
 *     prose could lean on a fact the lists do not mention, the page would be
 *     saying two different things about what the viewpoint rests on, and the
 *     one a reader can see would be the one nothing checks. A supporting fact
 *     counts when its parent headline fact is listed — a viewpoint relying on
 *     a detail is relying on the claim that detail supports, which is exactly
 *     how the fact ranking already rolls citations up.
 */
function citationErrors(topic: Topic, factById: Map<string, Fact>): string[] {
  const errors: string[] = [];

  const check = (what: string, body: string) => {
    for (const { id, section } of citedFactTargets(body)) {
      const fact = factById.get(id);
      if (fact && section && section !== 'finding' && !(section === 'chart-series' && fact.series) && !fact.series?.readings.some(reading => section === `chart-${reading.id}`) && !fact.additionalSeries?.some(s => section === `chart-${s.id}` || s.readings.some(r => section === `chart-${r.id}`)) && !fact.comparisons?.some(chart => section === `chart-${chart.id}`) && !fact.body.includes(`{#${id}--${section}}`)) {
        errors.push(`${what}: unknown section "${section}" in fact "${id}"`);
      }
      if (!factById.has(id)) {
        errors.push(`${what}: body links to "#fact-${id}", which is not a fact in this topic`);
      }
    }
  };

  check('topic intro', topic.intro);
  for (const f of topic.facts) check(`fact ${f.id}`, f.body);
  for (const p of topic.principles) check(`principle ${p.id}`, p.body);
  for (const c of topic.cruxes) check(`crux ${c.id}`, c.body);

  for (const v of topic.viewpoints) {
    check(`viewpoint ${v.id}`, v.body + '\n' + v.summary);

    const listed = new Set([...v.citesFacts, ...v.acknowledges, ...v.setsAside]);
    for (const id of citedFactIds(v.body + '\n' + v.summary)) {
      const cited = factById.get(id);
      if (!cited) continue; // already reported by rule 12
      if (listed.has(id)) continue;
      if (cited.supports !== undefined && listed.has(cited.supports)) continue;
      const via =
        cited.supports !== undefined ? `, nor is its parent fact "${cited.supports}"` : '';
      errors.push(
        `viewpoint ${v.id}: body cites fact "${id}", which is not in citesFacts, acknowledges or setsAside${via} — add it to one of those lists, or cite a fact the viewpoint already relates to`
      );
    }
  }

  return errors;
}
