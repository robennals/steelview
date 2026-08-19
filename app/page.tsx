import Link from 'next/link';
import { listTopicSlugs, loadTopic } from '@/lib/content/load';

export default async function HomePage() {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));

  return (
    <main>
      <h1>Steelview</h1>
      <p>The strongest version of every side of an argument, and the facts underneath it.</p>
      <ul>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/topics/${topic.slug}`}>{topic.title}</Link>
            <p>{topic.subtitle}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
