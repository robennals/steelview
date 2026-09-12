import Link from 'next/link';
import { listTopicSlugs, loadTopic } from '@/lib/content/load';

export default async function HomePage() {
  const slugs = await listTopicSlugs();
  const topics = await Promise.all(slugs.map((slug) => loadTopic(slug)));

  return (
    <main className="sv-wrap">
      <header className="sv-pagehead">
        <h1 className="sv-title">Steelview</h1>
        <p className="sv-index__lede">
          The strongest version of every side of an argument, and the data underneath it.
        </p>
      </header>
      <ul className="sv-topics">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/topics/${topic.slug}`}>
              <span className="sv-topics__title">{topic.title}</span>
              <span className="sv-topics__blurb">{topic.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
