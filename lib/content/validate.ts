import { citedFactTargets } from './markdown';
import { mapTiles } from './map-presets';
import { comparePeriods } from './period';
import { factSources, figureCitations } from './sources';
import { isComponentFigure } from './types';
import type { ComponentFigure, Fact, Figure, Series, Topic } from './types';

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
    for (const series of datasets) errors.push(...seriesErrors(f.id, series));
    const artifactIds = ['series', ...(f.additionalSeries ?? []).map(s => s.id), ...datasets.flatMap(s => s.readings.map(r => r.id)), ...(f.comparisons ?? []).map(c => c.id)];
    if (new Set(artifactIds).size !== artifactIds.length) errors.push(`fact ${f.id}: chart IDs must be unique`);
    const sourceCount = factSources(f).length;
    const chartIds = new Set<string>();
    for (const chart of f.comparisons ?? []) {
      if (chartIds.has(chart.id)) errors.push(`fact ${f.id}: duplicate comparison chart id ${chart.id}`);
      chartIds.add(chart.id);
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

  // A coverage end of "2026" runs to the end of 2026, so an event dated
  // "2026-03" is inside it; compare against the end's own precision.
  for (const event of series.events) {
    if (
      comparePeriods(event.period, series.coverage.from) < 0 ||
      (comparePeriods(event.period, series.coverage.to) > 0 && !event.period.startsWith(series.coverage.to))
    ) {
      errors.push(
        `${where} marks an event at "${event.period}", which is outside the declared coverage ${series.coverage.from}–${series.coverage.to} — it would sit off the end of the chart`
      );
    }
  }

  return errors;
}

/** Whether `#fact-<id>/<section>` names something on the fact's page: its finding, a chart or figure, or a body anchor. */
function knownSection(fact: Fact, section: string): boolean {
  return section === 'finding' ||
    (section === 'chart-series' && fact.series !== undefined) ||
    fact.series?.readings.some(reading => section === `chart-${reading.id}`) === true ||
    fact.additionalSeries?.some(s => section === `chart-${s.id}` || s.readings.some(r => section === `chart-${r.id}`)) === true ||
    fact.comparisons?.some(chart => section === `chart-${chart.id}`) === true ||
    fact.figures?.some(figure => isComponentFigure(figure) && section === `chart-${figure.id}`) === true ||
    fact.body.includes(`{#${fact.id}--${section}}`);
}

/**
 * A fact's `figures` (rules F1–F12 of the visualization spec). The schema
 * has already checked each figure's shape; these are the rules that need the
 * rest of the fact — its sources, charts and body — or the topic.
 */
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
    if (figure.kind === 'section' && !new RegExp(`^##\\s.*\\{#${escapeRegExp(f.id)}--${escapeRegExp(figure.id)}\\}\\s*$`, 'm').test(f.body)) {
      errors.push(`${where} no body section headed "## … {#${f.id}--${figure.id}}"`);
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
        }
      });
      if (figure.defaultSort && !keys.includes(figure.defaultSort.key)) errors.push(`${where} defaultSort key "${figure.defaultSort.key}" is not a column`);
      const headers = figure.rows.map(row => {
        const cell = row[header];
        return String(cell !== null && typeof cell === 'object' ? cell.value : cell);
      });
      for (const value of figure.highlight) if (!headers.includes(value)) errors.push(`${where} highlight "${value}" is not in the row-header column`);
      break;
    }
    case 'timeline': {
      const ids = figure.categories.map(c => c.id);
      if (new Set(ids).size !== ids.length) errors.push(`${where} category ids must be unique`);
      for (const event of figure.events) {
        if (!ids.includes(event.category)) errors.push(`${where} event "${event.title}" has unknown category "${event.category}"`);
        if (event.endDate && comparePeriods(event.endDate, event.date) < 0) errors.push(`${where} event "${event.title}" ends before it starts`);
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
      for (const kf of figure.figures) if (kf.change && !Number.isFinite(kf.change.value)) errors.push(`${where} "${kf.label}" has a change that is not a finite number`);
      break;
    case 'tileMap': {
      const tiles = mapTiles(figure.map).map(tile => tile.id);
      for (const key of Object.keys(figure.data ?? {})) if (!tiles.includes(key)) errors.push(`${where} "${key}" is not an area of ${figure.map}`);
      for (const id of figure.highlight) if (!tiles.includes(id)) errors.push(`${where} highlight "${id}" is not an area of ${figure.map}`);
      const { breaks, domain } = figure;
      if (breaks?.some((b, i) => i > 0 && b <= breaks[i - 1])) errors.push(`${where} breaks must be strictly ascending`);
      if (domain && !(domain[0] < domain[1])) errors.push(`${where} domain must run from low to high`);
      // A missing area reads "No data"; unexplained, a gap looks like a selection.
      const missing = tiles.filter(id => !(id in (figure.data ?? {})));
      if (missing.length > 0 && !figure.note) errors.push(`${where} has no data for ${missing.join(', ')} — say why in \`note\``);
      break;
    }
    case 'barChart': {
      const { domainMax } = figure;
      if (domainMax !== undefined && figure.items.some(item => item.value > domainMax)) errors.push(`${where} domainMax must be at least every value`);
      break;
    }
    case 'compositionBar': {
      const keys = figure.categories.map(c => c.key);
      if (new Set(keys).size !== keys.length) errors.push(`${where} category keys must be unique`);
      for (const row of figure.rows) {
        for (const key of Object.keys(row.values)) if (!keys.includes(key)) errors.push(`${where} row "${row.label}" has unknown category "${key}"`);
        if (!(Object.values(row.values).reduce((a, b) => a + b, 0) > 0)) errors.push(`${where} row "${row.label}" totals zero`);
      }
      break;
    }
    case 'estimateRange': {
      const { domain } = figure;
      for (const e of figure.estimates) {
        const present = [e.low, e.estimate, e.high].filter((v): v is number => v !== undefined);
        if (present.length === 0) errors.push(`${where} "${e.label}" needs an estimate, a low or a high`);
        if (present.some((v, i) => i > 0 && v < present[i - 1])) errors.push(`${where} "${e.label}" must have low ≤ estimate ≤ high`);
        if (domain && present.some(v => v < domain[0] || v > domain[1])) errors.push(`${where} "${e.label}" falls outside the domain`);
      }
      break;
    }
    case 'quoteComparison':
      for (const quote of figure.quotes) errors.push(...verbatimErrors(where, quote.text, quote.source, f));
      break;
    case 'pullQuote':
      errors.push(...verbatimErrors(where, figure.quote.text, figure.quote.source, f));
      break;
    case 'claimCheck': {
      errors.push(...verbatimErrors(where, figure.claim, figure.claimSource, f));
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Unicode NFC, straight quotes, collapsed whitespace, lower case: what F11 compares. */
export function normaliseQuote(text: string): string {
  return text.normalize('NFC').replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * F11 — a quote on the page is the source's words. Each fragment between
 * omission marks ("…" or "...") must appear in the cited source's quote;
 * fragments under four characters are too short to mean anything.
 */
function verbatimErrors(where: string, text: string, citation: number, f: Fact): string[] {
  const quote = factSources(f)[citation - 1]?.quote;
  if (quote === undefined) return []; // F2 reports the bad citation
  const haystack = normaliseQuote(quote);
  return text
    .split(/…|\.\.\./)
    .map(fragment => normaliseQuote(fragment))
    .filter(fragment => fragment.length >= 4 && !haystack.includes(fragment))
    .map(fragment => `${where} "${fragment}" is not in the quote of source ${citation} — quotes must be verbatim`);
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
  for (const c of topic.cruxes) check(`crux ${c.id}`, c.body);

  for (const v of topic.viewpoints) check(`viewpoint ${v.id}`, v.body + '\n' + v.summary);

  return errors;
}
