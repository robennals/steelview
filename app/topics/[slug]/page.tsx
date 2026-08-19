import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { renderMarkdown } from '@/lib/content/markdown';
import { Prose } from '@/components/topic/prose';
import { HashSync } from '@/components/topic/hash-sync';
import { FactItem } from '@/components/topic/fact-item';
import { ViewpointItem } from '@/components/topic/viewpoint-item';
import { PrincipleItem } from '@/components/topic/principle-item';
import { CruxItem } from '@/components/topic/crux-item';

export async function generateStaticParams() {
  return (await listTopicSlugs()).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const topic = await loadTopic(slug);

  // Render every markdown body once, here, so the components stay synchronous.
  const intro = await renderMarkdown(topic.intro);
  const bodies = new Map<string, string>();
  for (const item of [...topic.facts, ...topic.viewpoints, ...topic.principles, ...topic.cruxes]) {
    bodies.set(item.id, await renderMarkdown(item.body));
  }

  const factsById = new Map(topic.facts.map((f) => [f.id, f]));
  const principlesById = new Map(topic.principles.map((p) => [p.id, p]));
  const viewpointsById = new Map(topic.viewpoints.map((v) => [v.id, v]));

  return (
    <main>
      <HashSync />
      <header>
        <h1>{topic.title}</h1>
        <p>{topic.subtitle}</p>
        <Prose html={intro} />
        <p>Last updated {topic.lastUpdated}</p>
      </header>

      <section>
        <h2>Facts</h2>
        {topic.facts.map((fact) => (
          <FactItem key={fact.id} fact={fact} bodyHtml={bodies.get(fact.id) ?? ''} />
        ))}
      </section>

      <section>
        <h2>Viewpoints</h2>
        {topic.viewpoints.map((viewpoint) => (
          <ViewpointItem
            key={viewpoint.id}
            viewpoint={viewpoint}
            bodyHtml={bodies.get(viewpoint.id) ?? ''}
            factsById={factsById}
            principlesById={principlesById}
          />
        ))}
      </section>

      <section>
        <h2>Principles</h2>
        {topic.principles.map((principle) => (
          <PrincipleItem key={principle.id} principle={principle} bodyHtml={bodies.get(principle.id) ?? ''} />
        ))}
      </section>

      <section>
        <h2>Cruxes</h2>
        {topic.cruxes.map((crux) => (
          <CruxItem key={crux.id} crux={crux} bodyHtml={bodies.get(crux.id) ?? ''} viewpointsById={viewpointsById} />
        ))}
      </section>
    </main>
  );
}
