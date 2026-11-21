import type { Metadata } from 'next';
import { loadTopic, listTopicSlugs } from '@/lib/content/load';
import { topicPath } from '@/lib/content/types';
import { citedSources, renderFeaturedCharts, renderWalkthroughs, type DataStep, type QuotedSource, type RenderedWalkthrough } from '@/lib/content/walkthrough';
import { absoluteUrl } from '@/lib/site';
import { ExplorePanels } from '@/components/topic/explore-panels';
import { FeaturedChartSheets } from '@/components/topic/featured-charts';
import { ViewpointSlides } from '@/components/viewpoints/viewpoint-slides';
import { CruxRows } from '@/components/topic/crux-rows';
import type { Topic } from '@/lib/content/types';
import { FeedbackProvider } from '@/components/feedback/feedback-context';

export async function generateStaticParams() {
  return (await listTopicSlugs()).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await loadTopic(slug);
  const url = absoluteUrl(topicPath(slug));
  return {
    title: topic.title,
    description: topic.subtitle,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: topic.title,
      description: topic.subtitle,
      url,
      siteName: 'Steelview',
    },
    twitter: { card: 'summary_large_image', title: topic.title, description: topic.subtitle },
  };
}

/**
 * The viewpoints, with the cruxes below them: they are what the viewpoints turn
 * on, and no reader should have to find them. The only charts are the ones the
 * viewpoints' cards are made with; each opens in full over the page. A topic
 * that is only `topic.md` — or whose `cruxes/` directory is simply absent,
 * which is legal — must not ship a heading with nothing under it, so each
 * renders only when its list is non-empty. Exported and kept free
 * of `loadTopic` so it is unit-testable without a real content directory.
 */
export function TopicSections({ topic, walkthroughs, featured, sources = {} }: {
  topic: Topic;
  walkthroughs: Map<string, RenderedWalkthrough>;
  /** The sources behind each claim a viewpoint cites (`citedSources`), read behind its footnote marker. */
  sources?: Record<string, QuotedSource[]>;
  /** The charts the viewpoints' cards are made with, in full, keyed by fact id. */
  featured: Map<string, DataStep[]>;
}) {
  const viewpointsById = new Map(topic.viewpoints.map((v) => [v.id, v]));

  return (
    <FeedbackProvider slug={topic.slug}><ExplorePanels panels={[...featured.keys()]}>
      <FeaturedChartSheets slug={topic.slug} facts={topic.facts} charts={featured} />

      {topic.viewpoints.length > 0 && (
        <section className="sv-section">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Viewpoints</h2>
          </div>
          <ViewpointSlides slug={topic.slug} viewpoints={topic.viewpoints} walkthroughs={walkthroughs} sources={sources} />
        </section>
      )}

      {topic.cruxes.length > 0 && (
        <section className="sv-section sv-section--cruxes">
          <div className="sv-section__head">
            <h2 className="sv-section__title">Cruxes</h2>
            <p className="sv-section__blurb">What the viewpoints divide on.</p>
          </div>
          <CruxRows cruxes={topic.cruxes} viewpointsById={viewpointsById} />
        </section>
      )}
    </ExplorePanels></FeedbackProvider>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const topic = await loadTopic(slug);

  const walkthroughs = await renderWalkthroughs(topic);
  const featured = await renderFeaturedCharts(topic);
  const sources = citedSources(topic);

  /*
   * The page head is the title and nothing else: readers came for the facts,
   * and an intro they have to scroll past is a wall in front of them. The
   * subtitle still earns its place on the home page, where it is the card
   * description, and `topic.intro` is still loaded and still in the content
   * model — neither is rendered here.
   */
  return (
    <main className="sv-wrap sv-wrap--wide">
      <header className="sv-pagehead">
        <h1 className="sv-title">{topic.title}</h1>
        <p className="sv-meta sv-pagehead__meta">Last updated {topic.lastUpdated}</p>
      </header>

      <TopicSections topic={topic} walkthroughs={walkthroughs} featured={featured} sources={sources} />
    </main>
  );
}
