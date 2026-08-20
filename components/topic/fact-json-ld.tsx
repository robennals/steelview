import type { Fact, Topic } from '@/lib/content/types';
import { factPath, topicPath } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/site';
import { factDescription } from '@/lib/content/fact-page';

/**
 * Machine-readable markup for one fact.
 *
 * The point of giving every fact its own URL is that other people can use
 * them: cite one, import one, crawl the lot. A page a machine has to guess at
 * is only half addressable, so each fact page states in `schema.org` terms
 * what it is — a claim, with the topic it belongs to, and every source quoted
 * under it as a citation with its publisher and date.
 *
 * `ClaimReview` is deliberately *not* used: it carries a truth rating on a
 * fixed scale, and this site's five statuses are statements about the state of
 * the evidence, not verdicts on a claim's truth. Flattening them into a rating
 * would misrepresent the editorial position in exactly the direction the
 * status rubric exists to avoid.
 */
export function FactJsonLd({ slug, topic, fact }: { slug: string; topic: Topic; fact: Fact }) {
  const url = absoluteUrl(factPath(slug, fact.id));
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Claim',
    '@id': url,
    url,
    name: fact.claim,
    text: fact.claim,
    description: factDescription(fact, 300),
    isPartOf: {
      '@type': 'WebPage',
      '@id': absoluteUrl(topicPath(slug)),
      name: topic.title,
    },
    ...(fact.supports
      ? { isBasedOn: { '@type': 'Claim', '@id': absoluteUrl(factPath(slug, fact.supports)) } }
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
