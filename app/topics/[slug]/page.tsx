import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { renderMarkdown } from '@/lib/content/markdown';
import { anchorFor } from '@/lib/content/types';
import { Disclosure } from '@/components/topic/disclosure';
import { Prose } from '@/components/topic/prose';

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

  return (
    <main>
      <h1>{topic.title}</h1>
      <p>{topic.subtitle}</p>
      <p>Last updated {topic.lastUpdated}</p>
      <Prose html={intro} />

      <h2>Facts</h2>
      {topic.facts.map((fact) => (
        <Disclosure key={fact.id} anchor={anchorFor('fact', fact.id)} summary={<>{fact.claim} — {fact.status}</>}>
          <Prose html={bodies.get(fact.id) ?? ''} />
          <ul>
            {fact.sources.map((source, i) => (
              <li key={i}>
                <q>{source.quote}</q>{' '}
                <a href={source.url}>{source.title}</a>, {source.publisher}, {source.date} ({source.stance})
              </li>
            ))}
          </ul>
        </Disclosure>
      ))}

      <h2>Viewpoints</h2>
      {topic.viewpoints.map((viewpoint) => (
        <Disclosure
          key={viewpoint.id}
          anchor={anchorFor('viewpoint', viewpoint.id)}
          summary={<>{viewpoint.name} — {viewpoint.summary}</>}
        >
          <Prose html={bodies.get(viewpoint.id) ?? ''} />
          {(
            [
              ['Builds on', viewpoint.citesFacts],
              ['Accepts', viewpoint.acknowledges],
              ['Sets aside', viewpoint.setsAside],
            ] as const
          ).map(([label, ids]) =>
            ids.length === 0 ? null : (
              <p key={label}>
                {label}:{' '}
                {ids.map((id) => {
                  const fact = topic.facts.find((f) => f.id === id);
                  return (
                    <a key={id} href={`#${anchorFor('fact', id)}`}>
                      {fact?.claim ?? id}
                    </a>
                  );
                })}
              </p>
            )
          )}
        </Disclosure>
      ))}

      <h2>Principles</h2>
      {topic.principles.map((principle) => (
        <Disclosure key={principle.id} anchor={anchorFor('principle', principle.id)} summary={principle.name}>
          <Prose html={bodies.get(principle.id) ?? ''} />
        </Disclosure>
      ))}

      <h2>Cruxes</h2>
      {topic.cruxes.map((crux) => (
        <Disclosure key={crux.id} anchor={anchorFor('crux', crux.id)} summary={crux.question}>
          <Prose html={bodies.get(crux.id) ?? ''} />
          <dl>
            {crux.positions.map((position) => (
              <div key={position.viewpoint}>
                <dt>{topic.viewpoints.find((v) => v.id === position.viewpoint)?.name ?? position.viewpoint}</dt>
                <dd>{position.holds}</dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      ))}
    </main>
  );
}
