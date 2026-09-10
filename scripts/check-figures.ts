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
 * inside a `quote` somewhere in the same topic. A figure with no such quote is
 * an error and fails the build.
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
import { canonical, collectQuotes, figuresIn, quoteCorpus, quotedSomewhere } from './figures';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'topics');

const KINDS = ['facts', 'viewpoints', 'principles', 'cruxes'] as const;

type Finding = { item: string; figure: string; context: string };

/** The line the figure sits on, trimmed, so a report line is actionable. */
function contextFor(body: string, figure: string): string {
  const line = body.split('\n').find((l) => l.includes(figure)) ?? '';
  const trimmed = line.trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;
}

async function readMarkdown(dir: string): Promise<Array<{ id: string; data: Record<string, unknown>; body: string }>> {
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

async function auditTopic(slug: string): Promise<{ unmatched: Finding[]; advisories: Finding[] }> {
  const dir = path.join(CONTENT_ROOT, slug);
  const topicFile = matter(await readFile(path.join(dir, 'topic.md'), 'utf8'));

  const items: Array<{ kind: string; id: string; data: Record<string, unknown>; body: string }> = [
    { kind: 'topic', id: slug, data: topicFile.data, body: topicFile.content },
  ];
  for (const kind of KINDS) {
    for (const item of await readMarkdown(path.join(dir, kind))) {
      items.push({ kind: kind.replace(/e?s$/, ''), ...item });
    }
  }

  const quotes: string[] = [];
  for (const item of items) collectQuotes(item.data, quotes);
  const corpus = quoteCorpus(quotes);

  const unmatched: Finding[] = [];
  const advisories: Finding[] = [];

  for (const item of items) {
    const label = `${item.kind}/${item.id}`;
    const seen = new Set<string>();
    for (const figure of figuresIn(item.body)) {
      if (seen.has(canonical(figure))) continue;
      seen.add(canonical(figure));
      if (!quotedSomewhere(figure, corpus)) {
        unmatched.push({ item: label, figure, context: contextFor(item.body, figure) });
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

async function main(): Promise<void> {
  const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  let unmatchedTotal = 0;
  let advisoryTotal = 0;

  console.log('Figures audit — every money, percentage or thousands figure in a');
  console.log('markdown body must appear in a quoted source on the same topic.\n');

  for (const slug of slugs) {
    const { unmatched, advisories } = await auditTopic(slug);
    unmatchedTotal += unmatched.length;
    advisoryTotal += advisories.length;

    console.log(`## ${slug}`);
    if (unmatched.length === 0) {
      console.log('  no unmatched figures');
    } else {
      console.log(`  ${unmatched.length} unmatched figure(s) — asserted in prose, quoted nowhere:`);
      for (const f of unmatched) {
        console.log(`    ${f.item}: ${f.figure}`);
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

main();
