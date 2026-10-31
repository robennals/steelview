import Link from 'next/link';
import { listTopicSlugs, loadTopic } from '@/lib/content/load';
import { TopicRows } from '@/components/home/topic-rows';

export default async function HomePage() {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));
  topics.sort((a, b) => b.firstPublished.localeCompare(a.firstPublished));

  return (
    <main className="sv-home">
      <header className="sv-home__hero">
        <h1 className="sv-home__tagline">Every side of the argument, at its strongest.</h1>
        <Link className="sv-home__about" href="/about">What is Steelview? <span aria-hidden="true">→</span></Link>
      </header>
      <TopicRows topics={topics} />
    </main>
  );
}
