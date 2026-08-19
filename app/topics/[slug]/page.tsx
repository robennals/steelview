import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { renderMarkdown } from '@/lib/content/markdown';
import { Prose } from '@/components/topic/prose';
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

  return (
    <div className="sv-sections">
      {topic.facts.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Facts</h2>
          </div>
          {topic.facts.map((fact) => (
            <FactItem key={fact.id} fact={fact} bodyHtml={bodies.get(bodyKey('fact', fact.id)) ?? ''} />
          ))}
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

  const intro = await renderMarkdown(topic.intro);
  const bodies = await buildBodies(topic);

  return (
    <main className="sv-wrap">
      <HashSync />
      <header className="sv-pagehead">
        <h1 className="sv-title">{topic.title}</h1>
        <p className="sv-subtitle">{topic.subtitle}</p>
        <hr className="sv-rule" />
        <Prose html={intro} className="prose-body--lede" />
        <p className="sv-meta mt-8">Last updated {topic.lastUpdated}</p>
      </header>

      <TopicSections topic={topic} bodies={bodies} />
    </main>
  );
}
