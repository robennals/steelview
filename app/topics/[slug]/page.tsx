import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { headlineFacts, supportingFactsByParent } from '@/lib/content/rank-facts';
import { renderMarkdown } from '@/lib/content/markdown';
import { HashSync } from '@/components/topic/hash-sync';
import { FactItem } from '@/components/topic/fact-item';
import { ViewpointItem } from '@/components/topic/viewpoint-item';
import { PrincipleItem } from '@/components/topic/principle-item';
import { CruxItem } from '@/components/topic/crux-item';
import type { ItemKind, Topic } from '@/lib/content/types';

export async function generateStaticParams() {
  return (await listTopicSlugs()).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await loadTopic(slug);
  return { title: topic.title, description: topic.subtitle };
}

/** The key `bodies` is keyed on. Exported so the collision it guards against is unit-tested. */
export function bodyKey(kind: ItemKind, id: string): string {
  return `${kind}:${id}`;
}

/**
 * Render every markdown body once, here, so the components stay synchronous.
 * Ids are filenames and are unique only *within* a kind's directory — a fact
 * and a principle may legitimately share an id — so the map key must carry
 * the kind too, or one kind's prose silently overwrites another's.
 */
type BodiedItem = { id: string; body: string };

export async function buildBodies(topic: {
  facts: BodiedItem[];
  viewpoints: BodiedItem[];
  principles: BodiedItem[];
  cruxes: BodiedItem[];
}): Promise<Map<string, string>> {
  const bodies = new Map<string, string>();
  const kinds: Array<[ItemKind, BodiedItem[]]> = [
    ['fact', topic.facts],
    ['viewpoint', topic.viewpoints],
    ['principle', topic.principles],
    ['crux', topic.cruxes],
  ];
  for (const [kind, items] of kinds) {
    for (const item of items) {
      bodies.set(bodyKey(kind, item.id), await renderMarkdown(item.body));
    }
  }
  return bodies;
}

/**
 * How many headline facts the Facts section shows before it collapses the rest.
 * Facts arrive in diversity-ranked order (see lib/content/rank-facts.ts), so
 * for most readers these three *are* the page — which is why that ranking is
 * derived from what every viewpoint ranks first, rather than authored.
 */
export const FACTS_SHOWN = 3;

/**
 * The four item sections. A topic that is only `topic.md` — or whose
 * `cruxes/` directory is simply absent, which is legal — must not ship a
 * heading with nothing under it, so each section renders only when its list
 * is non-empty. Exported and kept free of `loadTopic` so it is unit-testable
 * without a real content directory.
 */
export function TopicSections({ topic, bodies }: { topic: Topic; bodies: Map<string, string> }) {
  const factsById = new Map(topic.facts.map((f) => [f.id, f]));
  const principlesById = new Map(topic.principles.map((p) => [p.id, p]));
  const viewpointsById = new Map(topic.viewpoints.map((v) => [v.id, v]));

  /*
   * Only headline facts are listed. A fact with `supports` is evidence for a
   * larger claim and reads inside that claim, so the list is the set of
   * things the argument is actually about rather than every checkable item on
   * the page — which is what made it unreadably long.
   */
  const supportingByParent = supportingFactsByParent(topic.facts);
  const headline = headlineFacts(topic.facts);
  const shownFacts = headline.slice(0, FACTS_SHOWN);
  const restFacts = headline.slice(FACTS_SHOWN);
  const renderFact = (fact: Topic['facts'][number]) => (
    <FactItem
      key={fact.id}
      fact={fact}
      bodyHtml={bodies.get(bodyKey('fact', fact.id)) ?? ''}
      supporting={(supportingByParent.get(fact.id) ?? []).map((child) => ({
        fact: child,
        bodyHtml: bodies.get(bodyKey('fact', child.id)) ?? '',
      }))}
    />
  );

  return (
    <div className="sv-sections">
      {headline.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Facts</h2>
          </div>
          {shownFacts.map(renderFact)}
          {restFacts.length > 0 && (
            /*
             * A native <details> again, for the same reason every item on this
             * page is one: the collapse has to work with JavaScript off, and
             * find-in-page, printing and screen readers all understand it.
             * The count is in the label because a bare "Show more" hides how
             * much is behind it — on this page that is most of the evidence.
             */
            <details className="sv-more">
              <summary className="sv-more__summary">
                <span className="sv-more__label" data-when="closed">
                  Show {restFacts.length} more {restFacts.length === 1 ? 'fact' : 'facts'}
                </span>
                <span className="sv-more__label" data-when="open">
                  Show fewer
                </span>
              </summary>
              <div className="sv-more__body">{restFacts.map(renderFact)}</div>
            </details>
          )}
        </section>
      )}

      {topic.viewpoints.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Viewpoints</h2>
          </div>
          {topic.viewpoints.map((viewpoint) => (
            <ViewpointItem
              key={viewpoint.id}
              viewpoint={viewpoint}
              bodyHtml={bodies.get(bodyKey('viewpoint', viewpoint.id)) ?? ''}
              factsById={factsById}
              principlesById={principlesById}
            />
          ))}
        </section>
      )}

      {topic.principles.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Principles</h2>
          </div>
          {topic.principles.map((principle) => (
            <PrincipleItem
              key={principle.id}
              principle={principle}
              bodyHtml={bodies.get(bodyKey('principle', principle.id)) ?? ''}
            />
          ))}
        </section>
      )}

      {topic.cruxes.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Cruxes</h2>
          </div>
          {topic.cruxes.map((crux) => (
            <CruxItem
              key={crux.id}
              crux={crux}
              bodyHtml={bodies.get(bodyKey('crux', crux.id)) ?? ''}
              viewpointsById={viewpointsById}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const topic = await loadTopic(slug);

  const bodies = await buildBodies(topic);

  /*
   * The page head is the title and nothing else: readers came for the facts,
   * and an intro they have to scroll past is a wall in front of them. The
   * subtitle still earns its place on the home page, where it is the card
   * description, and `topic.intro` is still loaded and still in the content
   * model — neither is rendered here.
   */
  return (
    <main className="sv-wrap">
      <HashSync />
      <header className="sv-pagehead">
        <h1 className="sv-title">{topic.title}</h1>
        <p className="sv-meta sv-pagehead__meta">Last updated {topic.lastUpdated}</p>
      </header>

      <TopicSections topic={topic} bodies={bodies} />
    </main>
  );
}
