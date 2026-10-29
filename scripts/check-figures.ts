/**
 * The figures audit.
 *
 * The project's rule is "nothing is presented as a fact without a quoted
 * source". `lib/content/validate.ts` enforces that for the *structured* part
 * of a fact — every fact carries sources. But a number asserted in prose is
 * presented as a fact just as firmly as one in a `claim` field, and prose is
 * exactly where an unsourced figure hides: a viewpoint that says "the bill ran
 * to £15.3 billion" is making a factual assertion nobody validated.
 *
 * So this script reads the markdown **bodies** of every content item and
 * checks that every money, percentage or thousands figure in them also appears
 * inside a `quote` the item is entitled to lean on. A figure with no such
 * quote is an error and fails the build.
 *
 * Which quotes count depends on the item, so a report cannot borrow a number
 * from another report's sources:
 *
 * - a **fact** is matched against its own frontmatter only — its sources,
 *   series sources and verified derived figures;
 * - a **viewpoint, crux or the topic intro** is matched against the union of
 *   the corpora of the facts it cites (inline `#fact-…` links, plus the legacy
 *   `citesFacts` list), so it cannot state a figure no cited fact supports;
 * - a **principle** is matched topic-wide: principles are shared across
 *   topics and should carry no figures at all.
 *
 * It deliberately does *not* look at frontmatter. `claim` and `holds` are
 * already covered: a fact's claim is backed by that fact's own sources (rule
 * 3), and a crux position is a statement of what a viewpoint believes rather
 * than an assertion of fact. Bodies are the gap.
 *
 * It also deliberately does not extract years, ordinals, or bare small
 * integers. "in 2024", "the third route", "two of the five" are not figures
 * anyone can cherry-pick, and matching them would bury the real findings.
 *
 * Second, advisory, output: the owner wants a fact carrying a number to show a
 * time series wherever the source publishes one, because a single year is the
 * easiest way to give a misleading picture honestly. The `series` field exists
 * (`lib/content/schema.ts`) but is optional — some facts are point-in-time and
 * have nothing to chart — so this reads the raw frontmatter for it and reports
 * every numeric fact that lacks one. Advisories never fail the build.
 *
 * Third output, the chart-value audit (`scripts/chart-values.ts`): every
 * number a series or comparison draws must be in its own source's quote, on
 * a named table (`valuesFrom`), or a verified derivation. It is advisory until
 * the trial topics pass it: untraced values are listed but exit 0 unless
 * `--strict-values` is given.
 *
 * Usage: `pnpm check:figures [--strict-values]`. Exit 1 on unmatched figures
 * (and, with `--strict-values`, on untraced chart values), 0 otherwise.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { loadPrinciples, ContentError } from '../lib/content/load';
import { citedFactIds } from '../lib/content/markdown';
import { factFrontmatterSchema, topicFrontmatterSchema } from '../lib/content/schema';
import { auditValue, chartValues, isWeakMatch, type ValueVerdict } from './chart-values';
import { canonical, collectQuotes, figuresIn, quoteCorpus, quotedSomewhere, type QuoteCorpus } from './figures';

import { verifiedDerivedFigures } from './derived-figures';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'topics');

const KINDS = [
  { dir: 'facts', kind: 'fact' },
  { dir: 'viewpoints', kind: 'viewpoint' },
  { dir: 'cruxes', kind: 'crux' },
] as const;

/** One content item as the audit sees it: raw frontmatter plus markdown body. */
export type AuditItem = {
  kind: 'topic' | 'fact' | 'viewpoint' | 'crux' | 'principle';
  id: string;
  data: Record<string, unknown>;
  body: string;
};

/** `corpus` names the quotes the figure was looked for in, so a report line says where to look. */
export type Finding = { item: string; figure: string; context: string; corpus?: string };

/** One chart value and where the audit traced it to. */
export type AuditedValue = {
  item: string;
  chart: string;
  where: string;
  value: string;
  verdict: ValueVerdict;
  /** Quoted only as a bare integer under 10, which any quote mentioning that number satisfies. */
  weak: boolean;
  valuesFrom?: string;
};

/** The line the figure sits on, trimmed, so a report line is actionable. */
function contextFor(body: string, figure: string): string {
  const line = body.split('\n').find((l) => l.includes(figure)) ?? '';
  const trimmed = line.trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;
}

async function readMarkdown(dir: string): Promise<Array<Pick<AuditItem, 'id' | 'data' | 'body'>>> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  return Promise.all(
    names
      .filter((n) => n.endsWith('.md'))
      .sort()
      .map(async (name) => {
        const { data, content } = matter(await readFile(path.join(dir, name), 'utf8'));
        return { id: path.basename(name, '.md'), data, body: content };
      })
  );
}

/** The quotes and verified derivations in one item's own frontmatter. */
function ownQuotes(data: Record<string, unknown>): string[] {
  return [...collectQuotes(data), ...verifiedDerivedFigures(data)];
}

/** Every fact an item leans on: inline `#fact-…` links, plus the legacy `citesFacts` list. */
function citedFacts(item: AuditItem): string[] {
  const legacy = Array.isArray(item.data.citesFacts)
    ? item.data.citesFacts.filter((id): id is string => typeof id === 'string')
    : [];
  return [...new Set([...citedFactIds(item.body), ...legacy])];
}

/** The corpus an item's figures are matched against, and the words a report line uses to name it. */
function corpusFor(
  item: AuditItem,
  factQuotes: ReadonlyMap<string, string[]>,
  topicWide: QuoteCorpus
): { corpus: QuoteCorpus; missing: string } {
  if (item.kind === 'fact') {
    return { corpus: quoteCorpus(factQuotes.get(item.id) ?? []), missing: "not in this fact's sources" };
  }
  if (item.kind === 'principle') {
    return { corpus: topicWide, missing: 'not quoted anywhere on the topic' };
  }
  // An unknown fact id is the integrity check's to report; here it contributes no quotes.
  const cited = citedFacts(item).filter((id) => factQuotes.has(id));
  return {
    corpus: quoteCorpus(cited.flatMap((id) => factQuotes.get(id) ?? [])),
    missing:
      cited.length === 0
        ? 'cites no fact whose sources could back it'
        : `not in the sources of the ${cited.length === 1 ? 'fact' : `${cited.length} facts`} it cites`,
  };
}

/**
 * The prose audit for one topic, pure so it can be tested: every figure in
 * every body must appear in the corpus that item is entitled to (see the file
 * comment). `items` is the topic intro, its facts, viewpoints and cruxes, and
 * the shared principles it references.
 */
export function auditTopic(items: readonly AuditItem[]): {
  unmatched: Finding[];
  advisories: Finding[];
  values: AuditedValue[];
} {
  const factQuotes = new Map(
    items.filter((item) => item.kind === 'fact').map((item) => [item.id, ownQuotes(item.data)])
  );
  const topicWide = quoteCorpus(
    items.flatMap((item) => (item.kind === 'fact' ? factQuotes.get(item.id) ?? [] : ownQuotes(item.data)))
  );

  const unmatched: Finding[] = [];
  const advisories: Finding[] = [];
  const values: AuditedValue[] = [];

  for (const item of items) {
    const label = `${item.kind}/${item.id}`;
    const { corpus, missing } = corpusFor(item, factQuotes, topicWide);
    const seen = new Set<string>();
    for (const figure of figuresIn(item.body)) {
      if (seen.has(canonical(figure))) continue;
      seen.add(canonical(figure));
      if (!quotedSomewhere(figure, corpus)) {
        unmatched.push({ item: label, figure, context: contextFor(item.body, figure), corpus: missing });
      }
    }

    // Advisory: a numeric claim with no time series behind it. `series` is
    // optional on a fact, so this reports every numeric fact that omits it —
    // an advisory, not an error, since some facts are point-in-time.
    if (item.kind === 'fact') {
      const claim = typeof item.data.claim === 'string' ? item.data.claim : '';
      const claimFigures = figuresIn(claim);
      const series = item.data.series;
      const hasSeries = Array.isArray(series) ? series.length > 0 : Boolean(series);
      if (claimFigures.length > 0 && !hasSeries) {
        advisories.push({ item: label, figure: claimFigures.join(', '), context: claim });
      }

      // A fact whose frontmatter does not parse is the loader's to report;
      // the chart-value audit skips it rather than crashing.
      const parsed = factFrontmatterSchema.safeParse(item.data);
      if (parsed.success) {
        const derived = quoteCorpus(verifiedDerivedFigures(item.data));
        for (const v of chartValues(parsed.data)) {
          const verdict = auditValue(v, derived);
          values.push({
            item: label,
            chart: v.chart,
            where: v.where,
            value: v.asPublished ?? v.renderings[0],
            verdict,
            weak: verdict === 'quoted' && isWeakMatch(v),
            valuesFrom: v.valuesFrom,
          });
        }
      }
    }
  }

  return { unmatched, advisories, values };
}

/**
 * The chart-value section of one topic's report; returns the number of
 * untraced values. Advisory runs list untraced values one line per chart,
 * because a long series from an unquoted table is hundreds of values; a
 * `--strict-values` run lists every one, since each is then a failure.
 */
function printValues(values: readonly AuditedValue[], strict: boolean): number {
  const count = (verdict: ValueVerdict) => values.filter((v) => v.verdict === verdict).length;
  const untraced = values.filter((v) => v.verdict === 'untraced');
  const weak = values.filter((v) => v.weak);

  const charts = new Map<string, AuditedValue[]>();
  for (const v of values) {
    const key = `${v.item} ${v.chart}`;
    charts.set(key, [...(charts.get(key) ?? []), v]);
  }

  console.log(
    `\n  chart values — ${values.length} drawn: ${count('quoted')} quoted (${weak.length} only as a bare integer under 10), ` +
      `${count('derived')} derived, ${count('table')} on a named table, ${untraced.length} untraced`
  );
  if (untraced.length > 0) {
    console.log('  untraced — in no quote the chart cites, no derivation, and no named table:');
    if (strict) {
      for (const v of untraced) console.log(`    ${v.item} ${v.where}: ${v.value}`);
    } else {
      for (const [chart, drawn] of charts) {
        const missing = drawn.filter((v) => v.verdict === 'untraced');
        if (missing.length === 0) continue;
        const first = missing[0];
        console.log(`    ${chart}: ${missing.length} of ${drawn.length} values, first ${first.where}: ${first.value}`);
      }
    }
  }
  if (weak.length > 0) {
    console.log('  matched only as a bare integer under 10 — check by eye:');
    for (const v of weak) console.log(`    ${v.item} ${v.where}: ${v.value}`);
  }

  for (const [chart, drawn] of charts) {
    const onTable = drawn.filter((v) => v.verdict === 'table');
    if (onTable.length === 0) continue;
    console.log(`  advisory — ${chart}: ${onTable.length} of ${drawn.length} values rest on the named table "${onTable[0].valuesFrom}"`);
  }
  return untraced.length;
}

/** A topic's intro, facts, viewpoints, cruxes and referenced principles, read from disk. */
async function readTopic(slug: string): Promise<AuditItem[]> {
  const dir = path.join(CONTENT_ROOT, slug);
  const topicFile = matter(await readFile(path.join(dir, 'topic.md'), 'utf8'));

  const items: AuditItem[] = [{ kind: 'topic', id: slug, data: topicFile.data, body: topicFile.content }];
  for (const { dir: kindDir, kind } of KINDS) {
    for (const item of await readMarkdown(path.join(dir, kindDir))) items.push({ kind, ...item });
  }

  const references = topicFrontmatterSchema.parse(topicFile.data).principles;
  const catalog = new Map((await loadPrinciples()).map((p) => [p.id, p]));
  for (const id of references) {
    const principle = catalog.get(id);
    if (!principle) throw new ContentError(`topic ${slug}: references unknown shared principle "${id}"`);
    items.push({ kind: 'principle', id, data: { name: principle.name }, body: principle.body });
  }
  return items;
}

async function main(): Promise<void> {
  const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  const strictValues = process.argv.includes('--strict-values');
  let unmatchedTotal = 0;
  let advisoryTotal = 0;
  let untracedTotal = 0;

  console.log('Figures audit — every money, percentage or thousands figure in a');
  console.log("markdown body must appear in a quoted source it may lean on: a fact's");
  console.log('own sources, or the sources of the facts a viewpoint, crux or intro cites.\n');

  for (const slug of slugs) {
    const { unmatched, advisories, values } = auditTopic(await readTopic(slug));
    unmatchedTotal += unmatched.length;
    advisoryTotal += advisories.length;

    console.log(`## ${slug}`);
    if (unmatched.length === 0) {
      console.log('  no unmatched figures');
    } else {
      console.log(`  ${unmatched.length} unmatched figure(s) — asserted in prose, not in a source it may use:`);
      for (const f of unmatched) {
        console.log(`    ${f.item}: ${f.figure} — ${f.corpus}`);
        console.log(`      ${f.context}`);
      }
    }
    if (advisories.length > 0) {
      console.log(`\n  advisory — ${advisories.length} fact(s) with a figure in the claim and no time series:`);
      for (const a of advisories) console.log(`    ${a.item}: ${a.context}`);
    }
    untracedTotal += printValues(values, strictValues);
    console.log('');
  }

  const failed = unmatchedTotal > 0 || (strictValues && untracedTotal > 0);
  console.log(
    `${unmatchedTotal} unmatched figure(s), ${advisoryTotal} advisory, ` +
      `${untracedTotal} untraced chart value(s)${strictValues ? '' : ' (advisory; --strict-values fails on them)'}. ` +
      (failed ? 'FAIL' : 'PASS')
  );
  process.exitCode = failed ? 1 : 0;
}

// Run only as a script, so tests can import `auditTopic` without reading content.
if (require.main === module) main();
