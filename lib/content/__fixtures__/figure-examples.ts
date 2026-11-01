import { readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown } from '../markdown';
import { factFrontmatterSchema } from '../schema';
import type { Fact, Topic } from '../types';

export const FIGURE_EXAMPLES_PATH = path.join(__dirname, 'figure-examples.md');

/** The fixture's frontmatter, unparsed: what an author wrote. */
export function figureExamplesFrontmatter(): Record<string, unknown> {
  return matter(readFileSync(FIGURE_EXAMPLES_PATH, 'utf8')).data;
}

/** The fixture fact, parsed exactly as the loader parses a fact file. */
export function figureExamplesFact(): Fact {
  const { data, content } = matter(readFileSync(FIGURE_EXAMPLES_PATH, 'utf8'));
  return { ...factFrontmatterSchema.parse(data), id: 'figure-examples', body: content.trim() };
}

/** A topic holding the fixture, sound under validateTopic, for perturbing one rule at a time. */
export function figureExamplesTopic(fact: Fact = figureExamplesFact()): Topic {
  return {
    slug: 'figure-examples',
    title: 'Figure examples',
    subtitle: 'Every figure kind',
    lastUpdated: '2026-10-29',
    firstPublished: '2026-08-18',
    intro: '',
    facts: [fact],
    viewpoints: [
      { id: 'one', name: 'One', shortName: 'One', summary: 'One.', order: 1, body: 'One.' },
      { id: 'two', name: 'Two', shortName: 'Two', summary: 'Two.', order: 2, body: 'Two.' },
    ],
    principles: [],
    cruxes: [],
  };
}

/** The fixture fact with its body rendered, as a fact page receives it. */
export async function figureExamplesPage(fact: Fact = figureExamplesFact()): Promise<{ fact: Fact; bodyHtml: string }> {
  return { fact, bodyHtml: await renderMarkdown(fact.body, 'figure-examples', [fact]) };
}
