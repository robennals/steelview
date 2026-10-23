import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import {
  factFrontmatterSchema,
  viewpointFrontmatterSchema,
  principleFrontmatterSchema,
  cruxFrontmatterSchema,
  topicFrontmatterSchema,
} from './schema';
import { rankFacts, sortViewpoints } from './rank-facts';
import { validateTopic } from './validate';
import type { Topic, Item, Principle } from './types';

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

/** Load the shared catalog independently of any topic. */
export async function loadPrinciples(root: string = path.join(CONTENT_ROOT, '..', 'principles')): Promise<Principle[]> {
  return readItems(root, principleFrontmatterSchema);
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

  // Reject the old layout so a local copy cannot silently shadow the shared definition.
  try {
    await readdir(path.join(dir, 'principles'));
    throw new ContentError(`${topicFile}: move topic-local principles to content/principles and reference their IDs in topic.md`);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
  }

  const catalog = await loadPrinciples(path.join(root, '..', 'principles'));
  const byId = new Map(catalog.map((principle) => [principle.id, principle]));
  const principles = parsed.data.principles.map((id) => {
    const principle = byId.get(id);
    if (!principle) throw new ContentError(`${topicFile}: references unknown shared principle "${id}"`);
    return principle;
  });

  const facts = await readItems(path.join(dir, 'facts'), factFrontmatterSchema);
  const viewpoints = await readItems(path.join(dir, 'viewpoints'), viewpointFrontmatterSchema);
  sortViewpoints(viewpoints);

  const topic: Topic = {
    ...parsed.data,
    slug,
    intro: content.trim(),
    // Fact order is derived from what the viewpoints rank, so it can only be
    // computed once both are loaded. See rank-facts.ts.
    facts: rankFacts(facts, viewpoints),
    viewpoints,
    principles,
    cruxes: await readItems(path.join(dir, 'cruxes'), cruxFrontmatterSchema),
  };

  if (options.validateIntegrity) {
    const errors = validateTopic(topic);
    if (errors.length > 0) {
      throw new ContentError(`Topic "${slug}" has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
    }
  }

  return topic;
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
