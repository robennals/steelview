import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allFactParams, factDescription, loadFactPage } from '@/lib/content/fact-page';
import { factPath } from '@/lib/content/types';
import { renderDataWalkthroughs } from '@/lib/content/walkthrough';
import { absoluteUrl } from '@/lib/site';
import { DataPanel } from '@/components/topic/data-rows';
import { BackToTopic, FactArticle } from '@/components/topic/fact-article';
import { panelCharts } from '@/components/topic/fact-figures';
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
    title: fact.title ?? fact.claim,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: fact.title ?? fact.claim,
      description,
      url,
      siteName: 'Steelview',
    },
    twitter: { card: 'summary_large_image', title: fact.title ?? fact.claim, description },
    other: { 'article:section': topic.title },
  };
}

/**
 * A report at its own address: its data panel, the one a topic page opens in a
 * row, with a way back to the topic and the rest of the report under it.
 *
 * The sheet over a topic page is an interception of this route. Both kinds of
 * fact get a page — a supporting fact is cited as readily as a headline one —
 * and a supporting fact's page opens by naming the claim it is evidence for,
 * because that claim is what makes the detail mean anything.
 *
 * Unlike a row's, the panel's charts are drawn here, so the page is whole
 * without script; and its observations keep their footnotes and fact links,
 * since the sources they point at are on this page.
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
  const walkthroughs = await renderDataWalkthroughs(topic, [fact], { citationsAsText: false, footnotes: true });
  const steps = walkthroughs.get(fact.id) ?? [];
  const charts = panelCharts(fact, { slug, asOf: topic.lastUpdated, facts: topic.facts }, { addressed: true });

  return (
    <main className="sv-wrap sv-wrap--wide sv-factmain">
      <FactJsonLd slug={slug} topic={topic} fact={fact} />
      <BackToTopic slug={slug} topicTitle={topic.title} fact={fact} />
      <FactArticle
        variant="page"
        panel={steps.length > 0 && <DataPanel slug={slug} fact={fact} steps={steps} charts={charts} />}
        slug={slug}
        fact={fact}
        bodyHtml={bodyHtml}
        supporting={supporting}
        parent={parent}
        topic={topic}
      />
    </main>
  );
}
