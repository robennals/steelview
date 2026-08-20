import type { MetadataRoute } from 'next';
import { listTopicSlugs, loadTopic } from '@/lib/content/load';
import { factPath, topicPath } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/site';

/**
 * Home, every topic, and every fact — headline and supporting alike.
 *
 * Facts are listed individually because they are the unit other people cite;
 * a crawler that only ever saw topic pages would index the argument and not
 * the evidence, which is the wrong way round for this site. `lastModified`
 * comes from the topic's own `lastUpdated`, the only date the content model
 * has, so it says something true rather than "whenever this built".
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));

  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    ...topics.flatMap((topic) => [
      {
        url: absoluteUrl(topicPath(topic.slug)),
        lastModified: topic.lastUpdated,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      ...topic.facts.map((fact) => ({
        url: absoluteUrl(factPath(topic.slug, fact.id)),
        lastModified: topic.lastUpdated,
        changeFrequency: 'monthly' as const,
        priority: fact.supports ? 0.5 : 0.7,
      })),
    ]),
  ];
}
