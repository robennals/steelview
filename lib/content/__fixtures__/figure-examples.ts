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

/** The fact its claim check's evidence link names, with the section it names. */
export const mailBallotPrivacyFact: Fact = {
  id: 'mail-ballot-privacy',
  claim: 'Surveys of mail-ballot privacy measure reported pressure, not fraud.',
  status: 'complicated',
  sources: [{ stance: 'supports', quote: 'q', title: 't', url: 'https://example.org/privacy', publisher: 'p', date: '2024' }],
  body: '## Privacy surveys {#mail-ballot-privacy--privacy-surveys}\n\nWhat the surveys asked.',
};

/** A topic holding the fixture, sound under validateTopic, for perturbing one rule at a time. */
export function figureExamplesTopic(fact: Fact = figureExamplesFact()): Topic {
  return {
    slug: 'figure-examples',
    title: 'Figure examples',
    subtitle: 'Every figure kind',
    lastUpdated: '2026-10-29',
    firstPublished: '2026-08-18',
    intro: '',
    facts: [fact, mailBallotPrivacyFact],
    viewpoints: [
      { id: 'one', name: 'One', summary: 'One.', order: 1, body: 'One.' },
      { id: 'two', name: 'Two', summary: 'Two.', order: 2, body: 'Two.' },
    ],
    principles: [],
    cruxes: [],
  };
}

/** The fixture fact with its body rendered, as a fact page receives it. */
export async function figureExamplesPage(fact: Fact = figureExamplesFact()): Promise<{ fact: Fact; bodyHtml: string }> {
  return { fact, bodyHtml: await renderMarkdown(fact.body, 'figure-examples', [fact, mailBallotPrivacyFact]) };
}
