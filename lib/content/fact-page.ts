import { listTopicSlugs, loadTopic } from './load';
import { renderMarkdown } from './markdown';
import { supportingFactsByParent } from './rank-facts';
import type { Fact, Topic } from './types';

/** A fact and its rendered markdown body. */
export type BodiedFact = { fact: Fact; bodyHtml: string };

/**
 * Everything both renderings of a fact need: its own page and the modal that
 * intercepts it. Loaded once, here, so the two cannot disagree about what a
 * fact is.
 */
export type FactPageData = {
  topic: Topic;
  fact: Fact;
  bodyHtml: string;
  /** The facts that are evidence for this one. Empty unless it is a headline fact. */
  supporting: BodiedFact[];
  /** The headline claim this fact is evidence for, when it has one. */
  parent?: Fact;
};

export async function loadFactPage(slug: string, factId: string): Promise<FactPageData | null> {
  const topic = await loadTopic(slug);
  const fact = topic.facts.find((f) => f.id === factId);
  if (!fact) return null;

  const supporting = await Promise.all(
    (supportingFactsByParent(topic.facts).get(fact.id) ?? []).map(async (child) => ({
      fact: child,
      bodyHtml: await renderMarkdown(child.body, slug),
    }))
  );

  return {
    topic,
    fact,
    bodyHtml: await renderMarkdown(fact.body, slug),
    supporting,
    parent: fact.supports ? topic.facts.find((f) => f.id === fact.supports) : undefined,
  };
}

/**
 * Every fact URL on the site — headline and supporting alike.
 *
 * Both kinds are addressed because both are cited: a viewpoint that leans on a
 * grant-rate movement is citing that movement, and a citation that resolves to
 * nothing is the dead link the validation rules exist to prevent.
 */
export async function allFactParams(): Promise<Array<{ slug: string; factId: string }>> {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));
  return topics.flatMap((topic) =>
    topic.facts.map((fact) => ({ slug: topic.slug, factId: fact.id }))
  );
}

/**
 * The one-line description a fact's page advertises to search engines and
 * social cards: the opening of its body, which is where the context that makes
 * the claim safe to quote actually lives.
 */
export function factDescription(fact: Fact, limit = 200): string {
  const text = fact.body
    .replace(/^#+ .*$/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const stop = cut.lastIndexOf(' ');
  return `${(stop > 0 ? cut.slice(0, stop) : cut).replace(/[,;:]$/, '')}…`;
}
