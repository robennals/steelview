import type { Metadata } from 'next';
import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { headlineFacts } from '@/lib/content/rank-facts';
import { renderMarkdown } from '@/lib/content/markdown';
import { topicPath } from '@/lib/content/types';
import { renderDataWalkthroughs, renderWalkthroughs, type DataStep, type RenderedWalkthrough } from '@/lib/content/walkthrough';
import { absoluteUrl } from '@/lib/site';
import { HashSync } from '@/components/topic/hash-sync';
import { DataRows } from '@/components/topic/data-rows';
import { ExplorePanels } from '@/components/topic/explore-panels';
import { ViewpointRows } from '@/components/viewpoints/viewpoint-rows';
import { PrincipleItem } from '@/components/topic/principle-item';
import { PrincipleModals } from '@/components/topic/principle-modals';
import { CruxItem } from '@/components/topic/crux-item';
import type { ItemKind, Topic } from '@/lib/content/types';

export async function generateStaticParams() {
  return (await listTopicSlugs()).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await loadTopic(slug);
  const url = absoluteUrl(topicPath(slug));
  return {
    title: topic.title,
    description: topic.subtitle,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: topic.title,
      description: topic.subtitle,
      url,
      siteName: 'Steelview',
    },
    twitter: { card: 'summary_large_image', title: topic.title, description: topic.subtitle },
  };
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
 *
 * `slug` is needed because a fact citation in prose renders as a link to that
 * fact's page, which is inside the topic.
 */
type BodiedItem = { id: string; body: string };

export async function buildBodies(
  topic: {
    facts?: Topic['facts'];
    viewpoints: BodiedItem[];
    principles: BodiedItem[];
    cruxes: BodiedItem[];
  },
  slug: string
): Promise<Map<string, string>> {
  const bodies = new Map<string, string>();
  const kinds: Array<[ItemKind, BodiedItem[]]> = [
    ['viewpoint', topic.viewpoints],
    ['principle', topic.principles],
    ['crux', topic.cruxes],
  ];
  for (const [kind, items] of kinds) {
    for (const item of items) {
      bodies.set(bodyKey(kind, item.id), await renderMarkdown(item.body, slug, topic.facts));
    }
  }
  return bodies;
}

/** Apply a rare, topic-level editorial placement before the derived tail. */
export function orderHeadlineFacts(topic: Topic): Topic['facts'] {
  const headline = headlineFacts(topic.facts);
  if (!topic.dataOrder?.length) return headline;

  const byId = new Map(headline.map((fact) => [fact.id, fact]));
  const placed = topic.dataOrder.flatMap((id) => {
    const fact = byId.get(id);
    return fact ? [fact] : [];
  });
  const placedIds = new Set(placed.map((fact) => fact.id));
  return [...placed, ...headline.filter((fact) => !placedIds.has(fact.id))];
}

/**
 * The four item sections. A topic that is only `topic.md` — or whose
 * `cruxes/` directory is simply absent, which is legal — must not ship a
 * heading with nothing under it, so each section renders only when its list
 * is non-empty. Exported and kept free of `loadTopic` so it is unit-testable
 * without a real content directory.
 */
export function TopicSections({ topic, bodies, walkthroughs, dataWalkthroughs }: {
  topic: Topic;
  bodies: Map<string, string>;
  walkthroughs: Map<string, RenderedWalkthrough>;
  /** Each headline data collection's charts and observations, keyed by fact id. */
  dataWalkthroughs: Map<string, DataStep[]>;
}) {
  const viewpointsById = new Map(topic.viewpoints.map((v) => [v.id, v]));

  /*
   * Only headline facts get a row. A fact with `supports` is evidence for a
   * larger claim and reads inside that claim, so the rows are the things the
   * argument is actually about rather than every checkable item on the page.
   * The supporting facts, and the shape of the argument they carry, live on
   * the parent fact's own reading (its modal or page).
   */
  const headline = orderHeadlineFacts(topic);

  return (
    <ExplorePanels><div className="sv-sections">
      <PrincipleModals principles={topic.principles.map((principle) => ({
        id: principle.id,
        name: principle.name,
        bodyHtml: bodies.get(bodyKey('principle', principle.id)) ?? '',
      }))} />
      {topic.viewpoints.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Viewpoints</h2>
          </div>
          <ViewpointRows slug={topic.slug} viewpoints={topic.viewpoints} walkthroughs={walkthroughs} />
        </section>
      )}

      {headline.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Data</h2>
          </div>
          <DataRows slug={topic.slug} facts={headline} walkthroughs={dataWalkthroughs} />
        </section>
      )}

      {topic.principles.length > 0 && (
        <section className="sv-section sv-section--reading">
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
        <section className="sv-section sv-section--reading">
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
    </div></ExplorePanels>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const topic = await loadTopic(slug);

  const bodies = await buildBodies(topic, slug);
  const walkthroughs = await renderWalkthroughs(topic);
  const dataWalkthroughs = await renderDataWalkthroughs(topic, orderHeadlineFacts(topic));

  /*
   * The page head is the title and nothing else: readers came for the facts,
   * and an intro they have to scroll past is a wall in front of them. The
   * subtitle still earns its place on the home page, where it is the card
   * description, and `topic.intro` is still loaded and still in the content
   * model — neither is rendered here.
   */
  return (
    <main className="sv-wrap sv-wrap--wide">
      <HashSync />
      <header className="sv-pagehead">
        <h1 className="sv-title">{topic.title}</h1>
        <p className="sv-meta sv-pagehead__meta">Last updated {topic.lastUpdated}</p>
      </header>

      <TopicSections topic={topic} bodies={bodies} walkthroughs={walkthroughs} dataWalkthroughs={dataWalkthroughs} />
    </main>
  );
}
