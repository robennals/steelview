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
 * Usage: `pnpm check:figures`. Exit 1 on unmatched figures, 0 otherwise.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { loadPrinciples, ContentError } from '../lib/content/load';
import { citedFactIds } from '../lib/content/markdown';
import { topicFrontmatterSchema } from '../lib/content/schema';
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
export function auditTopic(items: readonly AuditItem[]): { unmatched: Finding[]; advisories: Finding[] } {
  const factQuotes = new Map(
    items.filter((item) => item.kind === 'fact').map((item) => [item.id, ownQuotes(item.data)])
  );
  const topicWide = quoteCorpus(
    items.flatMap((item) => (item.kind === 'fact' ? factQuotes.get(item.id) ?? [] : ownQuotes(item.data)))
  );

  const unmatched: Finding[] = [];
  const advisories: Finding[] = [];

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
    }
  }

  return { unmatched, advisories };
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

  let unmatchedTotal = 0;
  let advisoryTotal = 0;

  console.log('Figures audit — every money, percentage or thousands figure in a');
  console.log("markdown body must appear in a quoted source it may lean on: a fact's");
  console.log('own sources, or the sources of the facts a viewpoint, crux or intro cites.\n');

  for (const slug of slugs) {
    const { unmatched, advisories } = auditTopic(await readTopic(slug));
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
    console.log('');
  }

  console.log(
    `${unmatchedTotal} unmatched figure(s), ${advisoryTotal} advisory. ` +
      (unmatchedTotal > 0 ? 'FAIL' : 'PASS')
  );
  process.exitCode = unmatchedTotal > 0 ? 1 : 0;
}

// Run only as a script, so tests can import `auditTopic` without reading content.
if (require.main === module) main();
