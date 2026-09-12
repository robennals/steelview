import type { Fact, Topic } from '@/lib/content/types';
import { factPath, topicPath } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/site';
import { factDescription } from '@/lib/content/fact-page';

/** A collection of evidence and datasets, with its lead finding and citations. */
export function FactJsonLd({ slug, topic, fact }: { slug: string; topic: Topic; fact: Fact }) {
  const url = absoluteUrl(factPath(slug, fact.id));
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    url,
    name: fact.title ?? fact.claim,
    text: fact.claim,
    description: factDescription(fact, 300),
    isPartOf: {
      '@type': 'WebPage',
      '@id': absoluteUrl(topicPath(slug)),
      name: topic.title,
    },
    ...(fact.supports
      ? { isBasedOn: { '@type': 'CollectionPage', '@id': absoluteUrl(factPath(slug, fact.supports)) } }
      : {}),
    citation: fact.sources.map((source) => ({
      '@type': 'CreativeWork',
      name: source.title,
      url: source.url,
      datePublished: source.date,
      publisher: { '@type': 'Organization', name: source.publisher },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Serialised from validated content in this repository, and `<` is
      // escaped so no value can close the script element early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
