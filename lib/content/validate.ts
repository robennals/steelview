import { extentValues, pointValue, type FigureNumber } from '@/components/report/qualified';
import { appliedFilters, slice } from '@/components/report/slice';
import { observationTargets } from './chart-observations';
import { citedFactTargets, neededClaims } from './markdown';
import { mapAreaIds, mapAreas } from './map-presets';
import { PARTIAL_DATE, comparePeriods, datePlacement } from './period';
import { PREVIEW_FIGURE_KINDS, isPreviewable, previewTarget } from './preview';
import { factSources, figureCitations } from './sources';
import { componentFigure, isComponentFigure } from './types';
import type { ComponentFigure, Crux, Fact, Figure, FigureOf, ObservationMark, Series, Topic } from './types';
import { observationGroups } from './walkthrough';

/**
 * Check the cross-reference graph of an already-shape-valid topic. Returns one
 * message per violation rather than throwing, so a single run reports every
 * problem in a topic instead of only the first — an author fixing content
 * wants the whole list.
 *
 * Rules are numbered to match the "Validation" section of the design spec.
 */
/** A crux states a tension and stops: these keep it to that. */
const MAX_TENSION_WORDS = 45;
const MAX_HOLDS_WORDS = 25;

const wordCount = (text: string) => text.trim().split(/\s+/).length;

/** A crux names the conflict and leaves it open: short, with no evidence argued. */
function tensionErrors(crux: Crux): string[] {
  const errors: string[] = [];
  if (crux.body) errors.push(`crux ${crux.id}: a crux has no body`);
  if (wordCount(crux.tension) > MAX_TENSION_WORDS) errors.push(`crux ${crux.id}: tension is over ${MAX_TENSION_WORDS} words`);
  if (/\d|\]\(/.test(crux.tension)) errors.push(`crux ${crux.id}: tension may not contain figures or links`);
  for (const p of crux.positions) {
    if (wordCount(p.holds) > MAX_HOLDS_WORDS) errors.push(`crux ${crux.id}: position for "${p.viewpoint}" is over ${MAX_HOLDS_WORDS} words`);
  }
  return errors;
}

export function validateTopic(topic: Topic): string[] {
  const errors: string[] = [];
  const factById = new Map(topic.facts.map((f) => [f.id, f]));
  const viewpointIds = new Set(topic.viewpoints.map((v) => v.id));

  if (topic.dataOrder) {
    const seen = new Set<string>();
    for (const id of topic.dataOrder) {
      const fact = factById.get(id);
      if (!fact) errors.push(`topic: dataOrder references unknown data "${id}"`);
      else if (fact.supports) errors.push(`topic: dataOrder may only name headline data, not supporting data "${id}"`);
      if (seen.has(id)) errors.push(`topic: dataOrder contains "${id}" more than once`);
      seen.add(id);
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
    const sourceCount = factSources(f).length;
    for (const series of datasets) errors.push(...seriesErrors(f.id, series, topic.lastUpdated, sourceCount));
    const artifactIds = ['series', ...(f.additionalSeries ?? []).map(s => s.id), ...datasets.flatMap(s => s.readings.map(r => r.id)), ...(f.comparisons ?? []).map(c => c.id)];
    if (new Set(artifactIds).size !== artifactIds.length) errors.push(`fact ${f.id}: chart IDs must be unique`);
    const chartIds = new Set<string>();
    for (const chart of f.comparisons ?? []) {
      if (chartIds.has(chart.id)) errors.push(`fact ${f.id}: duplicate comparison chart id ${chart.id}`);
      chartIds.add(chart.id);
      errors.push(...rowLabelErrors(chart.items, `fact ${f.id}: comparison ${chart.id}`));
      if (chart.domainMax !== undefined && chart.items.some(item => item.value > chart.domainMax!)) {
        errors.push(`fact ${f.id}: comparison domainMax must be at least every item value`);
      }
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
      if (!child || child.supports !== f.id || (!child.series && !child.comparisons?.length && !child.figures?.length)) {
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
    errors.push(...figureErrors(f, topic));
    errors.push(...observationMarkErrors(f));
    errors.push(...observationGroupErrors(f));
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

  for (const c of topic.cruxes) {
    errors.push(...tensionErrors(c));
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

  const headlines = topic.facts.filter((f) => f.supports === undefined).map((f) => f.id);
  for (const id of topic.dataOrder ?? []) {
    if (!headlines.includes(id)) errors.push(`topic: dataOrder references unknown or supporting data "${id}"`);
  }
  for (const id of headlines) {
    if ((topic.dataOrder?.length ?? 0) > 0 && !(topic.dataOrder ?? []).includes(id)) errors.push(`topic: dataOrder is missing headline data "${id}"`);
  }

  errors.push(...citationErrors(topic, factById));
  errors.push(...researchNeededErrors(topic));
  errors.push(...previewChartErrors(topic, factById));

  return errors;
}

/**
 * A topic's home-page preview charts resolve, appear once each, and between
 * them represent every viewpoint: each viewpoint must cite, inline, the fact
 * behind at least one of them. Whether that chart is among the viewpoint's
 * *strongest* evidence stays an editorial judgement (AUTHORING.md).
 */
function previewChartErrors(topic: Topic, factById: Map<string, Fact>): string[] {
  const previews = topic.previewCharts ?? [];
  if (previews.length === 0) return [];
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const { fact, chart, reading } of previews) {
    const key = `${fact}/${chart}`;
    const owner = factById.get(fact);
    const target = owner && previewTarget(owner, chart);
    if (!target) errors.push(`topic: preview chart ${key} does not resolve to a chart or figure`);
    else if (target.kind === 'figure' && !isPreviewable(target)) {
      errors.push(`topic: preview chart ${key} is a ${target.figure.kind} figure, which has no graph to preview — choose a series, a comparison or a figure of kind ${PREVIEW_FIGURE_KINDS.join(', ')}`);
    } else if (reading !== undefined) {
      if (target.kind !== 'series') errors.push(`topic: preview chart ${key} is not a series, so it cannot name a reading`);
      else if (!target.series.readings.some(r => r.id === reading)) errors.push(`topic: preview chart ${key} has no reading "${reading}"`);
    }
    if (seen.has(key)) errors.push(`topic: preview chart ${key} is listed twice`);
    seen.add(key);
  }
  const previewedFacts = new Set(previews.map(p => p.fact));
  for (const v of topic.viewpoints) {
    if (!citedFactTargets(v.body).some(({ id }) => previewedFacts.has(id))) {
      errors.push(`topic: viewpoint ${v.id} cites none of the preview charts' facts — add a chart it relies on to previewCharts`);
    }
  }
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
function seriesErrors(factId: string, series: Series, lastUpdated: string, sourceCount: number): string[] {
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

      // A line whose source publishes a different range declares its own
      // span; the full-range rule then holds against that span instead.
      const span = line.coverage ?? series.coverage;
      const says = line.coverage ? 'the line says its source publishes' : 'the series says the source publishes';
      const first = line.points[0].period;
      const last = line.points[line.points.length - 1].period;
      if (comparePeriods(first, span.from) !== 0) {
        errors.push(
          `${at}: starts at "${first}" but ${says} from "${span.from}" — show the whole published range, or the chart is the cherry-pick it is meant to prevent`
        );
      }
      if (comparePeriods(last, span.to) !== 0) {
        errors.push(
          `${at}: ends at "${last}" but ${says} to "${span.to}" — show the whole published range, or the chart is the cherry-pick it is meant to prevent`
        );
      }
      if (line.coverage && (comparePeriods(span.from, series.coverage.from) < 0 || comparePeriods(span.to, series.coverage.to) > 0)) {
        errors.push(
          `${at}: its own coverage ${span.from}–${span.to} runs outside the series coverage ${series.coverage.from}–${series.coverage.to}`
        );
      }
    }
  }

  // With per-line coverage the series declares the union of the lines'
  // spans, exactly: wider would stretch the axis past every line's data.
  const spans = series.readings.flatMap(reading => reading.lines.map(line => line.coverage ?? series.coverage));
  if (series.readings.some(reading => reading.lines.some(line => line.coverage))) {
    const earliest = spans.map(s => s.from).sort(comparePeriods)[0];
    const latest = spans.map(s => s.to).sort(comparePeriods).at(-1)!;
    if (comparePeriods(series.coverage.from, earliest) !== 0 || comparePeriods(series.coverage.to, latest) !== 0) {
      errors.push(
        `${where} coverage ${series.coverage.from}–${series.coverage.to} must be the union of its lines' ranges, ${earliest}–${latest}`
      );
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

  // A "not measured since" band runs from the last point (coverage.to, by
  // the rule above) to `until`, which defaults to the date the report was
  // last checked and may not claim past it.
  const band = series.notMeasuredSince;
  const until = band ? band.until ?? lastUpdated : undefined;
  if (band && until !== undefined) {
    if (comparePeriods(until, series.coverage.to) <= 0) {
      errors.push(`${where} is "not measured since" ${series.coverage.to} until "${until}", which is not after the last point`);
    }
    if (comparePeriods(until, lastUpdated) > 0) {
      errors.push(`${where} is "not measured since" until "${until}", after the topic was last updated (${lastUpdated})`);
    }
    if (band.source > sourceCount) {
      errors.push(`${where} cites unknown source ${band.source} for its "not measured since" note`);
    }
  }
  for (const event of series.events) {
    for (const n of event.sources) if (n > sourceCount) errors.push(`${where} event "${event.label}" cites unknown source ${n}`);
  }

  // A coverage end of "2026" runs to the end of 2026, so an event dated
  // "2026-03" is inside it; compare against the end's own precision. Events
  // may fall inside a "not measured since" band — what stopped the
  // measurement is often one of them.
  const eventsEnd = until !== undefined && comparePeriods(until, series.coverage.to) > 0 ? until : series.coverage.to;
  for (const event of series.events) {
    if (
      comparePeriods(event.period, series.coverage.from) < 0 ||
      (comparePeriods(event.period, eventsEnd) > 0 && !event.period.startsWith(eventsEnd))
    ) {
      errors.push(
        `${where} marks an event at "${event.period}", which is outside the declared coverage ${series.coverage.from}–${eventsEnd} — it would sit off the end of the chart`
      );
    }
  }

  // A focus window magnifies part of the published range; it may not reach
  // outside it, and it must hold enough data to draw a line.
  if (series.focus) {
    const from = series.focus.from;
    const to = series.focus.to ?? series.coverage.to;
    if (comparePeriods(from, series.coverage.from) < 0 || comparePeriods(to, series.coverage.to) > 0) {
      errors.push(`${where} focus ${from}–${to} runs outside the declared coverage ${series.coverage.from}–${series.coverage.to}`);
    }
    if (comparePeriods(from, to) >= 0) {
      errors.push(`${where} focus starts at "${from}", which is not before its end "${to}"`);
    }
    const inside = (period: string) => comparePeriods(period, from) >= 0 && (comparePeriods(period, to) <= 0 || period.startsWith(to));
    if (!series.readings.some(reading => reading.lines.some(line => line.points.filter(point => inside(point.period)).length >= 2))) {
      errors.push(`${where} focus ${from}–${to} holds fewer than two points of every line — there is nothing to draw at readable scale`);
    }
  }

  // Forecasts are the line's tail: a measured value after a forecast would
  // put history inside the shaded zone. Their vintage goes in coverage.note.
  let forecasts = false;
  for (const reading of series.readings) {
    for (const line of reading.lines) {
      const first = line.points.findIndex(point => point.status === 'forecast');
      if (first < 0) continue;
      forecasts = true;
      const after = line.points.slice(first).find(point => point.status !== 'forecast');
      if (after) {
        errors.push(`${where} reading "${reading.id}" line "${line.name}": point "${after.period}" is not a forecast but follows one — forecasts must be the line's last points`);
      }
    }
  }
  if (forecasts && !series.coverage.note) {
    errors.push(`${where} has forecast points but no coverage.note — name the forecast's vintage there`);
  }

  return errors;
}

/**
 * An Observations or Subtleties group addressed to a chart
 * (`## Observations {#<fact>--observations-<id>}`) attaches to the series
 * reading, comparison, figure or placed section with that id
 * (`observationTargets`), or is itself placed by a `section` entry naming its
 * whole anchor (`observations-<id>`). Any other group stays where it is
 * written, after the last figure — which content uses on purpose for a group
 * about no one chart ("observations-latest"). So an unattached group is an
 * error only when its id looks like a slip for one that would attach: it names
 * a series or featured fact rather than a reading, or is a target with a
 * hyphenated part added or dropped, or within two letters of one. A group with
 * no `-<id>` suffix (`{#<fact>--observations}`) is the body's own.
 */
function observationGroupErrors(f: Fact): string[] {
  const targets = observationTargets(f);
  const sections = new Set((f.figures ?? []).flatMap(figure => (figure.kind === 'section' ? [figure.id] : [])));
  const notTargets = ['series', ...(f.additionalSeries ?? []).map(s => s.id), ...(f.featuredCharts ?? [])];
  const errors: string[] = [];
  for (const [, heading, kind, id] of f.body.matchAll(new RegExp(`^## (.*?)\\s*\\{#${f.id}--(observations|subtleties)-([a-z0-9-]+)\\}\\s*$`, 'gm'))) {
    if (targets.includes(id) || sections.has(`${kind}-${id}`)) continue;
    const meant = notTargets.includes(id) ? undefined : targets.find(target => looksLikeSlipFor(id, target));
    if (notTargets.includes(id) || meant) {
      errors.push(`fact ${f.id}: "## ${heading}" is addressed to "${id}", which is not a series reading, comparison, figure or placed section of this fact${meant ? ` — did you mean "${meant}"?` : ''} — the group would sit at the end of the body`);
    }
  }
  return errors;
}

/** `id` is `target` with a hyphenated part added or dropped at either end, or within two single-letter edits of it. */
function looksLikeSlipFor(id: string, target: string): boolean {
  const [shorter, longer] = id.length < target.length ? [id, target] : [target, id];
  if (longer.startsWith(`${shorter}-`) || longer.endsWith(`-${shorter}`)) return true;
  return editDistance(id, target) <= 2;
}

/** The Levenshtein distance between two short strings. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

/** Whether `#fact-<id>/<section>` names something on the fact's page: its finding, a chart or figure, or a body anchor. */
function knownSection(fact: Fact, section: string): boolean {
  return section === 'finding' ||
    (section === 'chart-series' && fact.series !== undefined) ||
    fact.series?.readings.some(reading => section === `chart-${reading.id}`) === true ||
    fact.additionalSeries?.some(s => section === `chart-${s.id}` || s.readings.some(r => section === `chart-${r.id}`)) === true ||
    fact.comparisons?.some(chart => section === `chart-${chart.id}`) === true ||
    fact.figures?.some(figure => isComponentFigure(figure) && (section === `chart-${figure.id}` || figure.replaces?.includes(section) === true)) === true ||
    fact.body.includes(`{#${fact.id}--${section}}`);
}

/**
 * A fact's `figures` (rules F1–F12 of the visualization spec). The schema
 * has already checked each figure's shape; these are the rules that need the
 * rest of the fact — its sources, charts and body — or the topic.
 */
/**
 * M1 — a mark must land on its observation's chart, since a reader takes what
 * it picks out as what the observation is about. Line charts take a region, a
 * point and lines, and comparisons and data tables take rows.
 */
function observationMarkErrors(f: Fact): string[] {
  const groups = observationGroups(f);
  return Object.entries(f.observationMarks ?? {}).flatMap(([id, mark]) => {
    const where = `fact ${f.id}: observation mark "${id}"`;
    const key = groups.get(id);
    if (key === undefined) return [`${where} is not an observation of a chart`];
    return markErrors(f, key, mark).map(error => `${where} ${error}`);
  });
}

function markErrors(f: Fact, key: string, mark: ObservationMark): string[] {
  const series = [f.series, ...(f.additionalSeries ?? [])].find(s => s?.readings.some(r => r.id === key));
  const reading = series?.readings.find(r => r.id === key);
  if (series && reading) {
    const names = reading.lines.map(line => line.name);
    const picked = reading.lines.filter(line => !mark.lines || mark.lines.includes(line.name));
    const outside = (period: string) => comparePeriods(period, series.coverage.from) < 0 || comparePeriods(period, series.coverage.to) > 0;
    return [
      ...(mark.rows ? ['names rows, but its chart is a line chart'] : []),
      ...(mark.lines ?? []).filter(name => !names.includes(name)).map(name => `names "${name}", which is not a line of ${key}`),
      ...[mark.from, mark.to].flatMap(period => (period && outside(period) ? [`period ${period} is outside the series`] : [])),
      ...(mark.from && mark.to && comparePeriods(mark.from, mark.to) >= 0 ? ['must have from before to'] : []),
      ...(mark.at && !picked.some(line => line.points.some(p => p.period === mark.at)) ? [`at ${mark.at} is not a point on the lines it picks out`] : []),
    ];
  }
  const figure = componentFigure(f, key);
  const rows = f.comparisons?.find(c => c.id === key)?.items.map(item => item.label)
    ?? (figure?.kind === 'dataTable' ? tableRowHeaders(figure) : undefined);
  if (!rows) return ['is on a chart that cannot show marks yet'];
  return [
    ...(mark.from || mark.to || mark.at || mark.lines ? ['names periods or lines, but its chart has rows'] : []),
    ...(mark.rows ?? []).filter(row => !rows.includes(row)).map(row => `names "${row}", which is not a row of ${key}`),
  ];
}

/** Each row's label in a data table: what its `highlight` and marks name it by. */
function tableRowHeaders(figure: FigureOf<'dataTable'>): string[] {
  const header = figure.columns.find(column => column.rowHeader)?.key ?? figure.columns[0].key;
  return figure.rows.map(row => {
    const cell = row[header];
    return String(cell !== null && typeof cell === 'object' ? cell.value : cell);
  });
}

export function figureErrors(f: Fact, topic: Topic): string[] {
  const figures = f.figures;
  if (!figures) return [];
  const errors: string[] = [];
  const sources = factSources(f);
  const label = (figure: Figure, i: number) => ('id' in figure && figure.id) || (figure.kind === 'featured' ? figure.fact : String(i));
  const at = (figure: Figure, i: number) => `fact ${f.id}: figure ${label(figure, i)}:`;

  // F1 — a figure's id is its DOM id and its Observations' key, so it may
  // not repeat, or collide with a series, reading or comparison.
  const taken = new Set(['series', ...(f.additionalSeries ?? []).map(s => s.id), ...[...(f.series ? [f.series] : []), ...(f.additionalSeries ?? [])].flatMap(s => s.readings.map(r => r.id)), ...(f.comparisons ?? []).map(c => c.id)]);
  figures.forEach((figure, i) => {
    if (!isComponentFigure(figure) && figure.kind !== 'section') return;
    if (taken.has(figure.id)) errors.push(`${at(figure, i)} id "${figure.id}" is already used by another chart, reading or figure`);
    taken.add(figure.id);
  });
  // A replaced anchor becomes an element id on the page too, so it may not
  // still be in the body, name a chart, or be replaced twice.
  const chartAnchors = new Set([...taken].map(id => `chart-${id}`));
  const replaced = new Set<string>();
  figures.forEach((figure, i) => {
    if (!isComponentFigure(figure)) return;
    for (const anchor of figure.replaces ?? []) {
      if (replaced.has(anchor)) errors.push(`${at(figure, i)} replaces "${anchor}", which another figure already replaces`);
      else if (chartAnchors.has(anchor)) errors.push(`${at(figure, i)} replaces "${anchor}", which is the id of a chart or figure`);
      else if (f.body.includes(`{#${f.id}--${anchor}}`)) errors.push(`${at(figure, i)} replaces "${anchor}", which is still an anchor in the body`);
      replaced.add(anchor);
    }
  });

  // F3 — once present, `figures` is the whole reading order: every chart
  // the fact has is placed exactly once, so none silently drops to the end.
  const count = (key: string) => figures.filter(figure => refKey(figure) === key).length;
  const expected = [
    ...(f.series ? ['series:'] : []),
    ...(f.additionalSeries ?? []).map(s => `series:${s.id}`),
    ...(f.comparisons ?? []).map(c => `comparison:${c.id}`),
    ...(f.featuredCharts ?? []).map(id => `featured:${id}`),
  ];
  for (const key of expected) {
    const n = count(key);
    if (n !== 1) errors.push(`fact ${f.id}: figures must place ${describeRef(key)} exactly once (found ${n})`);
  }
  figures.forEach((figure, i) => {
    const key = refKey(figure);
    if (key && !expected.includes(key)) errors.push(`${at(figure, i)} references ${describeRef(key)}, which this fact does not have${figure.kind === 'featured' ? ' in featuredCharts' : ''}`);
  });

  figures.forEach((figure, i) => {
    const where = at(figure, i);

    // F4
    if (figure.kind === 'section') {
      const error = sectionHeadingError(f.body, `${f.id}--${figure.id}`);
      if (error) errors.push(`${where} ${error}`);
    }
    if (!isComponentFigure(figure)) return;

    // F2
    for (const n of figureCitations(figure)) {
      if (n < 1 || n > sources.length) errors.push(`${where} cites source ${n}, but the fact has ${sources.length}`);
    }
    // F5 — a caveat list is exempt: it records what is missing.
    if (figure.kind !== 'caveatList' && figureCitations(figure).length === 0) {
      errors.push(`${where} cites no source — give \`sources\` or a source on each item`);
    }

    errors.push(...kindErrors(figure, where, f, topic));
  });

  return errors;
}

/** F6–F12: the rules particular to one kind. */
function kindErrors(figure: ComponentFigure, where: string, f: Fact, topic: Topic): string[] {
  const errors: string[] = [];
  switch (figure.kind) {
    case 'dataTable': {
      const keys = figure.columns.map(c => c.key);
      if (new Set(keys).size !== keys.length) errors.push(`${where} column keys must be unique`);
      if (figure.columns.filter(c => c.rowHeader).length > 1) errors.push(`${where} at most one column may be the row header`);
      const header = (figure.columns.find(c => c.rowHeader) ?? figure.columns[0]).key;
      figure.rows.forEach((row, r) => {
        for (const key of Object.keys(row)) if (!keys.includes(key)) errors.push(`${where} row ${r + 1} has key "${key}", which is not a column`);
        for (const column of figure.columns) {
          const cell = row[column.key];
          const value = cell !== null && typeof cell === 'object' ? cell.value : cell;
          if (typeof column.format === 'object' && value !== undefined && value !== null && typeof value !== 'number') {
            errors.push(`${where} row ${r + 1} column "${column.key}" has a numeric format, so its cells must be numbers or null`);
          }
          if (column.format === 'date' && value !== undefined && value !== null && !PARTIAL_DATE.test(String(value))) {
            errors.push(`${where} row ${r + 1} column "${column.key}" is a date column, so "${String(value)}" must be YYYY, YYYY-MM or YYYY-MM-DD`);
          }
        }
      });
      if (figure.defaultSort && !keys.includes(figure.defaultSort.key)) errors.push(`${where} defaultSort key "${figure.defaultSort.key}" is not a column`);
      for (const [name, key] of [['leadColumn', figure.leadColumn], ['dateColumn', figure.dateColumn]]) {
        if (key === undefined) continue;
        if (!figure.layout) errors.push(`${where} ${name} needs a layout`);
        if (!keys.includes(key)) errors.push(`${where} ${name} "${key}" is not a column`);
        if (key === header) errors.push(`${where} ${name} "${key}" is the row header, which is already the card's title`);
      }
      if (figure.leadColumn && figure.leadColumn === figure.dateColumn) errors.push(`${where} leadColumn and dateColumn must differ`);
      const headers = tableRowHeaders(figure);
      for (const value of figure.highlight) if (!headers.includes(value)) errors.push(`${where} highlight "${value}" is not in the row-header column`);
      break;
    }
    case 'timeline': {
      const ids = figure.categories.map(c => c.id);
      if (new Set(ids).size !== ids.length) errors.push(`${where} category ids must be unique`);
      for (const event of figure.events) {
        if (!ids.includes(event.category)) errors.push(`${where} event "${event.title}" has unknown category "${event.category}"`);
        if (event.endDate && comparePeriods(event.endDate, datePlacement(event.date)) < 0) errors.push(`${where} event "${event.title}" ends before it starts`);
      }
      break;
    }
    case 'periodTimeline': {
      const ids = figure.categories.map(c => c.id);
      for (const row of figure.rows) {
        for (const period of row.periods) {
          if (period.to && comparePeriods(period.to, period.from) < 0) errors.push(`${where} row "${row.label}" has a period that ends before it starts`);
          if (period.category && !ids.includes(period.category)) errors.push(`${where} row "${row.label}" has unknown category "${period.category}"`);
        }
      }
      for (const event of figure.events) {
        // An axis end of "2026" runs to the end of 2026, as for series coverage.
        if ((figure.from && comparePeriods(event.period, figure.from) < 0) || (figure.to && comparePeriods(event.period, figure.to) > 0 && !event.period.startsWith(figure.to))) {
          errors.push(`${where} event "${event.label}" at "${event.period}" is outside the axis`);
        }
      }
      break;
    }
    case 'keyFigures':
      if (figure.figures.length > 6) errors.push(`${where} at most six key figures`);
      for (const kf of figure.figures) {
        if (kf.change && !Number.isFinite(kf.change.value)) errors.push(`${where} "${kf.label}" has a change that is not a finite number`);
        // The older sibling `qualifier`/`asPublished` and a qualified `value` say the same thing; two places can disagree.
        if (typeof kf.value === 'object' && (kf.qualifier !== undefined || kf.asPublished !== undefined)) {
          errors.push(`${where} "${kf.label}" gives its qualifier or wording beside a qualified value — put them in \`value\` only`);
        }
      }
      break;
    case 'map': {
      const shown = mapAreas(figure).tiles.map(tile => tile.id);
      errors.push(...mapErrors(figure, mapAreaIds(figure.preset), shown, figure.preset, where));
      for (const inset of figure.insets ?? []) {
        for (const id of inset.regionIds) if (!shown.includes(id)) errors.push(`${where} inset area "${id}" is not an area of ${figure.preset}`);
      }
      break;
    }
    case 'scatterPlot': {
      const ids = figure.points.map(p => p.id);
      if (new Set(ids).size !== ids.length) errors.push(`${where} point ids must be unique`);
      const groups = (figure.groups ?? []).map(g => g.id);
      if (new Set(groups).size !== groups.length) errors.push(`${where} group ids must be unique`);
      for (const p of figure.points) if (p.group !== undefined && !groups.includes(p.group)) errors.push(`${where} point "${p.id}" has unknown group "${p.group}"`);
      for (const id of figure.highlight) if (!ids.includes(id)) errors.push(`${where} highlight "${id}" is not a point`);
      for (const axis of ['x', 'y'] as const) {
        const domain = figure[axis].domain;
        if (!domain) continue;
        if (!(domain[0] < domain[1])) errors.push(`${where} ${axis} domain must run from low to high`);
        for (const p of figure.points) if (pointValue(p[axis]) < domain[0] || pointValue(p[axis]) > domain[1]) errors.push(`${where} point "${p.id}" falls outside the ${axis} domain`);
      }
      break;
    }
    case 'barChart': {
      const { domainMax, series } = figure;
      errors.push(...rowLabelErrors(figure.items, where));
      const drawn = figure.items.flatMap(item => [item.value, ...Object.values(item.values ?? {})].filter((v): v is FigureNumber => v !== undefined && v !== null));
      if (domainMax !== undefined && drawn.some(value => extentValues(value).some(v => v > domainMax))) errors.push(`${where} domainMax must be at least every value, a range's high end included`);
      if (series) errors.push(...pairedBarErrors(figure, series, where));
      break;
    }
    case 'sliceExplorer':
      errors.push(...sliceErrors(figure, where));
      break;
    case 'smallMultiples':
      errors.push(...smallMultiplesErrors(figure, where));
      break;
    case 'compositionBar': {
      const keys = figure.categories.map(c => c.key);
      if (new Set(keys).size !== keys.length) errors.push(`${where} category keys must be unique`);
      for (const row of figure.rows) {
        for (const key of Object.keys(row.values)) if (!keys.includes(key)) errors.push(`${where} row "${row.label}" has unknown category "${key}"`);
        const parts = Object.values(row.values);
        if (parts.some(part => extentValues(part).some(v => v < 0))) errors.push(`${where} row "${row.label}" has a negative part — a composition's parts are sizes`);
        if (!(parts.reduce<number>((sum, part) => sum + pointValue(part), 0) > 0)) errors.push(`${where} row "${row.label}" totals zero`);
        const sumError = compositionSumError(parts, row.total ?? (figure.unit === 'percent' ? 100 : undefined));
        if (sumError) errors.push(`${where} row "${row.label}" ${sumError}`);
      }
      break;
    }
    case 'estimateRange': {
      const { domain } = figure;
      errors.push(...rowLabelErrors(figure.estimates, where));
      for (const e of figure.estimates) {
        const present = [e.low, e.estimate === undefined ? undefined : pointValue(e.estimate), e.high].filter((v): v is number => v !== undefined);
        if (present.length === 0) errors.push(`${where} "${e.label}" needs an estimate, a low or a high`);
        if (present.some((v, i) => i > 0 && v < present[i - 1])) errors.push(`${where} "${e.label}" must have low ≤ estimate ≤ high`);
        if (domain && present.some(v => v < domain[0] || v > domain[1])) errors.push(`${where} "${e.label}" falls outside the domain`);
      }
      break;
    }
    case 'quotes': {
      for (const quote of figure.quotes) errors.push(...verbatimErrors(where, quote.text, quote.sources, f));
      // A stance names a category; a category no quote takes would be an empty filter.
      const ids = (figure.categories ?? []).map(c => c.id);
      if (new Set(ids).size !== ids.length) errors.push(`${where} category ids must be unique`);
      for (const quote of figure.quotes) {
        if (quote.stance === undefined) continue;
        if (!figure.categories) errors.push(`${where} quote by "${quote.speaker}" has stance "${quote.stance}", but the figure has no \`categories\``);
        else if (!ids.includes(quote.stance)) errors.push(`${where} quote by "${quote.speaker}" has unknown stance "${quote.stance}"`);
      }
      for (const id of ids) if (!figure.quotes.some(quote => quote.stance === id)) errors.push(`${where} category "${id}" has no quote`);
      break;
    }
    case 'pullQuote':
      errors.push(...verbatimErrors(where, figure.quote.text, figure.quote.sources, f));
      break;
    case 'claimCheck': {
      errors.push(...verbatimErrors(where, figure.claim, [figure.claimSource], f));
      const { evidence } = figure;
      if (evidence) {
        const target = topic.facts.find(fact => fact.id === evidence.fact);
        if (!target) errors.push(`${where} evidence names "${evidence.fact}", which is not a fact in this topic`);
        else if (evidence.section && !knownSection(target, evidence.section)) errors.push(`${where} unknown section "${evidence.section}" in fact "${target.id}"`);
      }
      break;
    }
    case 'caveatList':
      break;
  }
  return errors;
}

/**
 * F10, for a bar chart with `series`: the series keys are distinct, every
 * row gives every series (`null` where the source has no figure, so a gap
 * is a decision, not an omission) and at least one value, a dumbbell has
 * exactly two series, and only a dumbbell labels its ends, by series key.
 */
/** Past this a row label wraps into a block beside its bar; AUTHORING asks for about 40. */
const MAX_ROW_LABEL = 60;

/** A chart row is one short title; what else it has to say goes behind the row (`detail`, or an estimate's `note`). */
function rowLabelErrors(rows: Array<{ label: string }>, where: string): string[] {
  return rows.filter(row => row.label.length > MAX_ROW_LABEL).map(row => `${where} row label "${row.label}" is over ${MAX_ROW_LABEL} characters: give the row a short title and put the rest in \`detail\` (\`note\` on an estimate)`);
}

function pairedBarErrors(figure: FigureOf<'barChart'>, series: Array<{ key: string }>, where: string): string[] {
  const errors: string[] = [];
  const keys = series.map(s => s.key);
  if (new Set(keys).size !== keys.length) errors.push(`${where} series keys must be unique`);
  const dumbbell = figure.style === 'dumbbell';
  if (dumbbell && keys.length !== 2) errors.push(`${where} a dumbbell joins two measures, but the chart has ${keys.length} series`);
  for (const item of figure.items) {
    const values = item.values ?? {};
    for (const key of Object.keys(values)) if (!keys.includes(key)) errors.push(`${where} row "${item.label}" has a value for "${key}", which is not a series`);
    const missing = keys.filter(key => !(key in values));
    if (missing.length > 0) errors.push(`${where} row "${item.label}" has no value for ${missing.map(key => `"${key}"`).join(', ')} — give \`null\` where the source publishes none`);
    if (keys.every(key => values[key] === null)) errors.push(`${where} row "${item.label}" has no values`);
    if (item.labels && !dumbbell) errors.push(`${where} row "${item.label}" labels its ends, which only a dumbbell has`);
    for (const key of Object.keys(item.labels ?? {})) if (!keys.includes(key)) errors.push(`${where} row "${item.label}" labels "${key}", which is not a series`);
  }
  return errors;
}

/**
 * A slice explorer's dimensions, measures, rows and defaults agree. Every
 * row names a value of every dimension (one of its `values` when they are
 * listed) and no combination twice — a repeated row would be added in
 * twice — and measures hold numbers. The defaults name what exists, never
 * split by a dimension that may not be combined, and draw at least one bar,
 * so the server-rendered chart is never empty.
 */
function sliceErrors(figure: FigureOf<'sliceExplorer'>, where: string): string[] {
  const errors: string[] = [];
  const dimensionKeys = figure.dimensions.map(d => d.key);
  const measureKeys = figure.measures.map(m => m.key);
  const keys = [...dimensionKeys, ...measureKeys];
  if (new Set(keys).size !== keys.length) errors.push(`${where} dimension and measure keys must all be distinct`);
  const seen = new Set<string>();
  figure.rows.forEach((row, r) => {
    for (const key of Object.keys(row)) if (!keys.includes(key)) errors.push(`${where} row ${r + 1} has key "${key}", which is not a dimension or measure`);
    for (const d of figure.dimensions) {
      const cell = row[d.key];
      if (cell === undefined) errors.push(`${where} row ${r + 1} has no "${d.key}"`);
      else if (d.values && !d.values.includes(String(cell))) errors.push(`${where} row ${r + 1} has ${d.key} "${cell}", which is not one of its values`);
    }
    for (const m of measureKeys) if (row[m] !== undefined && typeof row[m] !== 'number') errors.push(`${where} row ${r + 1} measure "${m}" must be a number`);
    const combination = JSON.stringify(dimensionKeys.map(key => String(row[key])));
    if (seen.has(combination)) errors.push(`${where} row ${r + 1} repeats the combination ${dimensionKeys.map(key => `${key} "${row[key]}"`).join(', ')}, so it would be counted twice`);
    seen.add(combination);
  });
  for (const d of figure.dimensions) {
    const used = new Set(figure.rows.map(row => String(row[d.key])));
    for (const value of d.values ?? []) if (!used.has(value)) errors.push(`${where} dimension "${d.key}" lists "${value}", which no row has`);
    for (const value of d.last ?? []) if (!used.has(value)) errors.push(`${where} dimension "${d.key}" keeps "${value}" last, but no row has it`);
  }
  const dimension = (key: string | undefined, what: string) => {
    if (key === undefined) return undefined;
    const found = figure.dimensions.find(d => d.key === key);
    if (!found) errors.push(`${where} ${what} "${key}" is not a dimension`);
    return found;
  };
  const breakdown = dimension(figure.defaultBreakdown, 'defaultBreakdown') ?? figure.dimensions[0];
  const split = dimension(figure.defaultSplit, 'defaultSplit');
  if (split && split.key === breakdown.key) errors.push(`${where} defaultSplit "${split.key}" is also the breakdown`);
  if (split?.combinable === false) errors.push(`${where} defaultSplit "${split.key}" may not be combined, so it cannot split a bar`);
  if (figure.defaultMeasure !== undefined && !measureKeys.includes(figure.defaultMeasure)) errors.push(`${where} defaultMeasure "${figure.defaultMeasure}" is not a measure`);
  for (const [key, values] of Object.entries(figure.defaultFilters ?? {})) {
    const d = dimension(key, 'defaultFilters key');
    if (!d) continue;
    const used = new Set(figure.rows.map(row => String(row[key])));
    for (const value of values) if (!used.has(value)) errors.push(`${where} defaultFilters ${key} "${value}" is not a value any row has`);
    if (d.combinable === false && values.length > 1) errors.push(`${where} defaultFilters ${key} picks ${values.length} values of a dimension that may not be combined — pick one`);
  }
  if (errors.length === 0) {
    const measure = figure.measures.find(m => m.key === figure.defaultMeasure) ?? figure.measures[0];
    const filters = appliedFilters(figure.rows, figure.dimensions, breakdown, figure.defaultFilters ?? {}, {});
    const shown = slice({ rows: figure.rows, breakdown, split, measure: measure.key, aggregation: measure.aggregation, filters });
    if (shown.groups.length === 0) errors.push(`${where} its default view draws no bars — change defaultFilters`);
  }
  return errors;
}

/**
 * Small multiples are series: panel names are distinct; each panel's points
 * run strictly forwards and from end to end of the published range — the
 * figure's `coverage`, or the panel's own inside it — so no panel shows only
 * the stretch that suits the text; and with per-panel coverage the figure's
 * is their union, exactly.
 */
function smallMultiplesErrors(figure: FigureOf<'smallMultiples'>, where: string): string[] {
  const errors: string[] = [];
  const names = figure.panels.map(p => p.name);
  if (new Set(names).size !== names.length) errors.push(`${where} panel names must be unique`);
  const { coverage } = figure;
  if (comparePeriods(coverage.to, coverage.from) < 0) errors.push(`${where} coverage ends before it starts`);
  for (const panel of figure.panels) {
    const at = `${where} panel "${panel.name}"`;
    if (panel.points.some((point, i) => i > 0 && comparePeriods(point.period, panel.points[i - 1].period) <= 0)) errors.push(`${at}: points must run forwards in time, with no repeats`);
    const span = panel.coverage ?? coverage;
    const says = panel.coverage ? 'its own coverage runs' : 'the coverage runs';
    const first = panel.points[0].period;
    const last = panel.points[panel.points.length - 1].period;
    if (comparePeriods(first, span.from) !== 0) errors.push(`${at}: starts at "${first}" but ${says} from "${span.from}" — show the whole published range`);
    if (comparePeriods(last, span.to) !== 0) errors.push(`${at}: ends at "${last}" but ${says} to "${span.to}" — show the whole published range`);
    if (panel.coverage && (comparePeriods(panel.coverage.from, coverage.from) < 0 || comparePeriods(panel.coverage.to, coverage.to) > 0)) {
      errors.push(`${at}: its own coverage ${panel.coverage.from}–${panel.coverage.to} runs outside the figure's ${coverage.from}–${coverage.to}`);
    }
  }
  if (figure.panels.some(p => p.coverage)) {
    const spans = figure.panels.map(p => p.coverage ?? coverage);
    const earliest = spans.map(s => s.from).sort(comparePeriods)[0];
    const latest = spans.map(s => s.to).sort(comparePeriods).at(-1)!;
    if (comparePeriods(coverage.from, earliest) !== 0 || comparePeriods(coverage.to, latest) !== 0) {
      errors.push(`${where} coverage ${coverage.from}–${coverage.to} must be the union of its panels' ranges, ${earliest}–${latest}`);
    }
  }
  return errors;
}

/**
 * F10 — a composition's parts add up. Against the row's stated `total`, or
 * 100 for percentages without one, the parts may miss by what rounding can
 * explain: half a unit in each part's last published place (three parts
 * published to one decimal may miss by 0.15). Anything more means a
 * part is missing, double-counted or mistyped — and the bar, which always
 * fills its width, would hide it. Undefined when the row adds up.
 */
export function compositionSumError(parts: FigureNumber[], expected: number | undefined): string | undefined {
  if (expected === undefined) return undefined;
  // Each part may be off by half a unit in its own last place; a range by its coarser end's.
  const placesOf = (part: FigureNumber) => Math.min(...extentValues(part).map(decimalPlaces));
  const tolerance = parts.reduce<number>((total, part) => total + 0.5 * 10 ** -placesOf(part), 0);
  const sum = parts.reduce<number>((total, part) => total + pointValue(part), 0);
  if (Math.abs(sum - expected) <= tolerance + 1e-9) return undefined;
  const places = Math.max(0, ...parts.map(placesOf));
  const shown = (n: number) => String(Number(n.toFixed(places + 2)));
  return `sums to ${shown(sum)}, not ${shown(expected)} — more than rounding (±${shown(tolerance)}) can explain`;
}

/** Decimal places a number is written with: 2 for 33.25, 0 for 120. */
function decimalPlaces(n: number): number {
  return /\.(\d+)$/.exec(String(n))?.[1].length ?? 0;
}

/**
 * F9, for every map (and its older spellings, tile and geo maps): every area id belongs to the preset,
 * a numeric scale runs upwards, categories are distinct and every assignment
 * names one, and any area drawn without a value or category is explained.
 * `areas` is every id the preset knows; `shown` the ones this figure draws —
 * fewer when an optional row, such as the US territories, is left out.
 */
function mapErrors(figure: FigureOf<'map'>, areas: string[], shown: string[], preset: string, where: string): string[] {
  const errors: string[] = [];
  const keyed = figure.categories ? figure.areas ?? {} : figure.data ?? {};
  for (const key of Object.keys(keyed)) if (!areas.includes(key)) errors.push(`${where} "${key}" is not an area of ${preset}`);
  for (const id of figure.highlight) if (!areas.includes(id)) errors.push(`${where} highlight "${id}" is not an area of ${preset}`);
  const { breaks, domain, categories } = figure;
  if (breaks?.some((b, i) => i > 0 && b <= breaks[i - 1])) errors.push(`${where} breaks must be strictly ascending`);
  if (domain && !(domain[0] < domain[1])) errors.push(`${where} domain must run from low to high`);
  if (categories) {
    const ids = categories.map(c => c.id);
    if (new Set(ids).size !== ids.length) errors.push(`${where} category ids must be unique`);
    const marks = categories.map(c => c.mark);
    if (new Set(marks).size !== marks.length) errors.push(`${where} category marks must be unique`);
    for (const [area, assignment] of Object.entries(figure.areas ?? {})) {
      const category = typeof assignment === 'string' ? assignment : assignment.category;
      if (!ids.includes(category)) errors.push(`${where} "${area}" has unknown category "${category}"`);
    }
  }
  // A missing area reads "No data"; unexplained, a gap looks like a selection.
  const missing = shown.filter(id => !(id in keyed));
  if (missing.length > 0 && !figure.note) {
    const shown = missing.length > 12 ? `${missing.slice(0, 12).join(', ')} and ${missing.length - 12} more` : missing.join(', ');
    errors.push(`${where} has no data for ${shown} — say why in \`note\``);
  }
  return errors;
}

/** `series:` / `series:<id>` / `comparison:<id>` / `featured:<fact>` for a reference figure; undefined otherwise. */
function refKey(figure: Figure): string | undefined {
  switch (figure.kind) {
    case 'series': return `series:${figure.id ?? ''}`;
    case 'comparison': return `comparison:${figure.id}`;
    case 'featured': return `featured:${figure.fact}`;
    default: return undefined;
  }
}

function describeRef(key: string): string {
  const [kind, id] = key.split(':');
  if (kind === 'series') return id ? `additional series "${id}"` : 'the series';
  if (kind === 'comparison') return `comparison "${id}"`;
  return `featured chart "${id}"`;
}

/**
 * Why a `section` figure cannot move the body heading `{#<anchor>}`, or
 * undefined if it can: it must head a `##` or `###` section, and a `###`
 * under Observations or Subtleties is a disclosure item, not a section
 * (markdown.ts, rehypeEvidenceSections).
 */
function sectionHeadingError(body: string, anchor: string): string | undefined {
  const lines = body.split('\n');
  const at = lines.findIndex(line => new RegExp(`^#{2,3}\\s.*\\{#${escapeRegExp(anchor)}\\}\\s*$`).test(line));
  if (at === -1) return `no body section headed "## … {#${anchor}}" or "### … {#${anchor}}"`;
  if (lines[at].startsWith('## ')) return undefined;
  const parent = lines.slice(0, at).findLast(line => line.startsWith('## '));
  const parentId = parent?.match(/\{#([a-z0-9-]+)\}\s*$/)?.[1] ?? '';
  const parentText = parent?.replace(/^##\s+/, '').replace(/\s*\{#[a-z0-9-]+\}\s*$/, '').trim().toLowerCase();
  if (/--(observations|subtleties)$/.test(parentId) || parentText === 'observations' || parentText === 'subtleties') {
    return `"{#${anchor}}" heads an item under Observations or Subtleties, which stays in its disclosure`;
  }
  return undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Unicode NFC, straight quotes, collapsed whitespace, lower case: what F11 compares. */
export function normaliseQuote(text: string): string {
  return text.normalize('NFC').replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * F11 — a quote on the page is the source's words. Each fragment between
 * omission marks ("…" or "...") must appear in the quote of one of the
 * sources it cites; fragments under four characters are too short to mean
 * anything.
 */
function verbatimErrors(where: string, text: string, citations: number[], f: Fact): string[] {
  const sources = factSources(f);
  const quotes = citations.flatMap(n => (sources[n - 1] ? [normaliseQuote(sources[n - 1].quote)] : []));
  if (quotes.length === 0) return []; // F2 reports the bad citation
  const cited = citations.length === 1 ? `source ${citations[0]}` : `any of sources ${citations.join(', ')}`;
  return text
    .split(/…|\.\.\./)
    .map(fragment => normaliseQuote(fragment))
    .filter(fragment => fragment.length >= 4 && !quotes.some(quote => quote.includes(fragment)))
    .map(fragment => `${where} "${fragment}" is not in the quote of ${cited} — quotes must be verbatim`);
}

/**
 * Inline data citations in prose.
 *
 * A body may cite a fact by linking to its anchor:
 * `[net migration reached 944,000](#fact-net-migration-2024)`. That link is
 * the page's honesty signal at the point of use, so it gets the same
 * treatment as every other cross-reference on the page:
 *
 * 1. it must resolve to real data in this topic — a dead citation is a
 *     claim that looks sourced and is not, which is worse than an unlinked
 *     one;
 * Links in viewpoints are the complete, reader-visible record of the data
 * their argument relies on. There is no second structured list to maintain.
 */
function citationErrors(topic: Topic, factById: Map<string, Fact>): string[] {
  const errors: string[] = [];

  const check = (what: string, body: string) => {
    for (const { id, section } of citedFactTargets(body)) {
      const fact = factById.get(id);
      if (fact && section && !knownSection(fact, section)) {
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

  for (const v of topic.viewpoints) check(`viewpoint ${v.id}`, v.body + '\n' + v.summary);

  return errors;
}

/**
 * A viewpoint's `researchNeeded` list and the `#needed` marks in its prose
 * must name the same claims. The marks are invisible to readers, so a mark
 * missing from the list would drop out of the research queue unseen, and a
 * listed claim with no mark would be queued against text that no longer
 * exists.
 */
function researchNeededErrors(topic: Topic): string[] {
  const errors: string[] = [];
  for (const v of topic.viewpoints) {
    const marked = new Set(neededClaims(v.body + '\n' + v.summary));
    const listed = new Set(v.researchNeeded ?? []);
    for (const claim of marked) {
      if (!listed.has(claim)) errors.push(`viewpoint ${v.id}: "${claim}" is marked #needed but missing from researchNeeded`);
    }
    for (const claim of listed) {
      if (!marked.has(claim)) errors.push(`viewpoint ${v.id}: researchNeeded lists "${claim}", which no #needed link in the body marks`);
    }
  }
  return errors;
}
