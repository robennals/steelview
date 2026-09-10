import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allFactParams, factDescription, loadFactPage } from '@/lib/content/fact-page';
import { factPath } from '@/lib/content/types';
import { absoluteUrl } from '@/lib/site';
import { FactArticle, FactCrumbs } from '@/components/topic/fact-article';
import { FactJsonLd } from '@/components/topic/fact-json-ld';

export async function generateStaticParams() {
  return allFactParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; factId: string }>;
}): Promise<Metadata> {
  const { slug, factId } = await params;
  const data = await loadFactPage(slug, factId);
  if (!data) return {};
  const { topic, fact } = data;
  const url = absoluteUrl(factPath(slug, factId));
  const description = factDescription(fact);
  return {
    title: fact.claim,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: fact.claim,
      description,
      url,
      siteName: 'Steelview',
    },
    twitter: { card: 'summary_large_image', title: fact.claim, description },
    other: { 'article:section': topic.title },
  };
}

/**
 * A fact at its own address.
 *
 * This is the canonical rendering: the modal over the topic page is an
 * interception of exactly this route, showing exactly this component. Both
 * kinds of fact get a page — a supporting fact is cited as readily as a
 * headline one — and a supporting fact's page opens by naming the claim it is
 * evidence for, because that claim is what makes the detail mean anything.
 */
export default async function FactPage({
  params,
}: {
  params: Promise<{ slug: string; factId: string }>;
}) {
  const { slug, factId } = await params;
  const data = await loadFactPage(slug, factId);
  if (!data) notFound();
  const { topic, fact, bodyHtml, supporting, parent } = data;

  return (
    <main className="sv-wrap sv-factmain">
      <FactJsonLd slug={slug} topic={topic} fact={fact} />
      <FactCrumbs slug={slug} topicTitle={topic.title} />
      <FactArticle
        variant="page"
        slug={slug}
        fact={fact}
        bodyHtml={bodyHtml}
        supporting={supporting}
        parent={parent}
      />
    </main>
  );
}
