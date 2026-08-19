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
  FACT_STATUSES,
} from './schema';
import { validateTopic } from './validate';
import type { Topic, Item, Fact } from './types';

/**
 * Editorial reading order for facts, not the declaration order of
 * `FACT_STATUSES`. The healthy shape of a topic is "mostly well-supported, a
 * few contested that genuinely divide the sides, and a short tail of the
 * rest defusing familiar talking points" — sorting facts into this order
 * makes the Facts section render that shape directly, backbone first.
 */
const FACT_STATUS_ORDER: readonly (typeof FACT_STATUSES)[number][] = [
  'well-supported',
  'contested',
  'complicated',
  'unknown',
  'not-supported',
];

export const CONTENT_ROOT = path.join(process.cwd(), 'content', 'topics');

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
 * is legal, a topic with a malformed crux is not.
 */
async function readItems<S extends z.ZodTypeAny>(
  dir: string,
  schema: S
): Promise<Array<Item<z.infer<S>>>> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
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

/**
 * Sort facts by status in editorial order, then by id within each status.
 * `readItems` already returns facts sorted by id (filename order), so a
 * stable sort on status alone is sufficient to get both orderings.
 */
function sortFactsByStatus(facts: Fact[]): void {
  facts.sort(
    (a, b) => FACT_STATUS_ORDER.indexOf(a.status) - FACT_STATUS_ORDER.indexOf(b.status)
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
  sortFactsByStatus(facts);

  const topic: Topic = {
    ...parsed.data,
    slug,
    intro: content.trim(),
    facts,
    viewpoints: await readItems(path.join(dir, 'viewpoints'), viewpointFrontmatterSchema),
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
