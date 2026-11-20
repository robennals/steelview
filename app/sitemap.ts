import type { MetadataRoute } from 'next';
import { listTopicSlugs, loadTopic } from '@/lib/content/load';
import { topicPath } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/site';

/**
 * Home, About, How it's made, Privacy and every topic: a fact has no page of its own. `lastModified`
 * comes from the topic's own `lastUpdated`, the only date the content model
 * has, so it says something true rather than "whenever this built".
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));

  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/how-its-made'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
    ...topics.map((topic) => ({
      url: absoluteUrl(topicPath(topic.slug)),
      lastModified: topic.lastUpdated,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
