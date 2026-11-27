import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';
import {
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
} from './schema';
import { rankFacts, sortViewpoints } from './rank-facts';
import { evidenceErrors, validateTopic } from './validate';
import { cardParagraphErrors, cardVisualErrors, repeatedCardVisualErrors } from './walkthrough';
import { joinViewpoint, viewpointLinksSchema, type ViewpointLinks } from './viewpoint-links';
import type { Topic, Item, Viewpoint } from './types';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'topics');

/**
 * Thrown for any content problem: a missing file, frontmatter that does not
 * match its schema. Cross-item integrity is checked separately by
 * `pnpm check:integrity`, so authors can work through an in-progress edit in
 * the dev server without being blocked by temporary reference gaps.
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentError';
  }
}

function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

/**
 * Read every `.md` file in `dir`, validate its frontmatter, and return items
 * sorted by id. A missing directory yields no items — a topic with no cruxes
 * is legal, a topic with a malformed crux is not. Any other `readdir` failure
 * (a permissions error, or a file sitting where a directory should be) is
 * rethrown rather than swallowed as "no items" — that would be indistinguishable
 * from a mistyped directory name (`crux/` instead of `cruxes/`) silently
 * emptying a section.
 */
// Typed by the schema's output (what `safeParse` returns), with the input left
// open: frontmatter schemas use `.default([])`, so input and output differ.
async function readItems<T extends Record<string, unknown>>(
  dir: string,
  schema: z.ZodType<T, unknown>
): Promise<Array<Item<T>>> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') return [];
    throw err;
  }

  const files = names.filter((n) => n.endsWith('.md')).sort();
  return Promise.all(
    files.map(async (file) => {
      const full = path.join(dir, file);
      const { data, content } = matter(await readFile(full, 'utf8'));
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new ContentError(`${full}: ${formatIssues(parsed.error)}`);
      }
      return {
        ...parsed.data,
        id: path.basename(file, '.md'),
        body: content.trim(),
      };
    })
  );
}

/**
 * Read a topic's viewpoints: each `<id>.md` is the text, joined with the
 * citations, card visuals and checks in `<id>.links.yaml` beside it. A
 * missing links file leaves the text unlinked and unchecked, which only
 * `pnpm check:integrity` reports, so an editor's new draft renders while the
 * agent has yet to link it.
 */
async function readViewpoints(dir: string): Promise<Viewpoint[]> {
  const items = await readItems(dir, viewpointFrontmatterSchema);
  return Promise.all(
    items.map(async (item) => {
      const file = path.join(dir, `${item.id}.links.yaml`);
      let links: ViewpointLinks;
      try {
        const parsed = viewpointLinksSchema.safeParse(parseYaml(await readFile(file, 'utf8')));
        if (!parsed.success) throw new ContentError(`${file}: ${formatIssues(parsed.error)}`);
        links = parsed.data;
      } catch (err) {
        if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT')) throw err;
        links = viewpointLinksSchema.parse({});
      }
      const joined = joinViewpoint(item.body, links);
      // The text is the editor's; a link in it is a citation in the wrong file.
      const inText = [...item.body.matchAll(/\[[^\]]+\]\(#[^)\s]+\)/g)].map(
        ([link]) => `the text links ${link}; citations go in ${item.id}.links.yaml`
      );
      return {
        ...item,
        body: joined.body,
        summary: joined.summary,
        researchNeeded: links.researchNeeded,
        visuals: joined.visuals,
        linkErrors: [...inText, ...joined.linkErrors],
        unverified: joined.unverified,
      };
    })
  );
}

export type LoadTopicOptions = {
  /** Run the publication-time cross-item integrity checks. */
  validateIntegrity?: boolean;
};

export async function loadTopic(
  slug: string,
  root: string = CONTENT_ROOT,
  options: LoadTopicOptions = {}
): Promise<Topic> {
  const dir = path.join(root, slug);
  const topicFile = path.join(dir, 'topic.md');

  let raw: string;
  try {
    raw = await readFile(topicFile, 'utf8');
  } catch {
    throw new ContentError(`No topic.md found for topic "${slug}" (looked in ${dir})`);
  }

  const { data, content } = matter(raw);
  const parsed = topicFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new ContentError(`${topicFile}: ${formatIssues(parsed.error)}`);
  }

  const facts = await readItems(path.join(dir, 'facts'), factFrontmatterSchema);
  const viewpoints = await readViewpoints(path.join(dir, 'viewpoints'));
  sortViewpoints(viewpoints);

  const topic: Topic = {
    ...parsed.data,
    slug,
    intro: content.trim(),
    // Fact order is derived from what the viewpoints rank, so it can only be
    // computed once both are loaded. See rank-facts.ts.
    facts: rankFacts(facts, parsed.data.dataOrder),
    viewpoints,
    cruxes: await readItems(path.join(dir, 'cruxes'), cruxFrontmatterSchema),
  };

  // A "not measured since" band ends, unless the author says otherwise, on
  // the date the report was last checked — it claims no more than that.
  for (const fact of topic.facts) {
    for (const series of [fact.series, ...(fact.additionalSeries ?? [])]) {
      if (series?.notMeasuredSince && series.notMeasuredSince.until === undefined) {
        series.notMeasuredSince.until = topic.lastUpdated;
      }
    }
  }

  if (options.validateIntegrity) {
    const errors = [...validateTopic(topic), ...evidenceErrors(topic), ...repeatedCardVisualErrors(topic), ...cardParagraphErrors(topic), ...cardVisualErrors(topic), ...viewpointLinkErrors(topic)];
    if (errors.length > 0) {
      throw new ContentError(`Topic "${slug}" has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
    }
  }

  return topic;
}

/**
 * A viewpoint's text and links file out of step, or a passage the agent has
 * not checked as it now stands. Publication waits on both: what a reader sees
 * must be cited, and checked, as written.
 */
function viewpointLinkErrors(topic: Topic): string[] {
  return topic.viewpoints.flatMap((v) => [...(v.linkErrors ?? []), ...(v.unverified ?? [])].map((e) => `viewpoint ${v.id}: ${e}`));
}

export async function listTopicSlugs(root: string = CONTENT_ROOT): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}
