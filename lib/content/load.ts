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
import type { Topic, Item } from './types';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'topics');

/**
 * Thrown for any content problem: a missing file, frontmatter that does not
 * match its schema, or a cross-reference violation. Content problems must fail
 * the build rather than render a partial page, so nothing catches this.
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
async function readItems<S extends z.ZodTypeAny>(
  dir: string,
  schema: S
): Promise<Array<Item<z.infer<S>>>> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
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
      const frontmatter = parsed.data as Record<string, unknown>;
      return {
        ...frontmatter,
        id: path.basename(file, '.md'),
        body: content.trim(),
      } as Item<z.infer<S>>;
    })
  );
}

export async function loadTopic(slug: string, root: string = CONTENT_ROOT): Promise<Topic> {
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
    principles: await readItems(path.join(dir, 'principles'), principleFrontmatterSchema),
    cruxes: await readItems(path.join(dir, 'cruxes'), cruxFrontmatterSchema),
  };

  const errors = validateTopic(topic);
  if (errors.length > 0) {
    throw new ContentError(`Topic "${slug}" has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
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
