'use server';

import type { ReactNode } from 'react';
import { listTopicSlugs, loadTopic } from './load';
import { topicQuotes } from './figure-props';
import { featuredSlides, renderFeaturedCharts } from './walkthrough';
import { FeaturedCharts } from '@/components/topic/featured-charts';
import { panelCharts } from '@/components/topic/fact-figures';

/**
 * One collection's featured charts, drawn in full, of which a sheet shows the
 * one chart a reader opened. Fetched by the home page when a reader opens a
 * preview chart, so the page does not carry them for every preview it shows.
 *
 * Callable from the browser, so every argument is checked against the content
 * rather than trusted; anything unknown gets nothing.
 */
export async function previewPanel(slug: string, factId: string): Promise<ReactNode> {
  if (!(await listTopicSlugs()).includes(slug)) return null;
  const topic = await loadTopic(slug);
  const fact = topic.facts.find(f => f.id === factId);
  const slides = featuredSlides(topic).get(factId);
  if (!fact || !slides) return null;
  const steps = (await renderFeaturedCharts(topic)).get(fact.id) ?? [];
  const page = { slug, asOf: topic.lastUpdated, quotes: topicQuotes(topic.facts, topic.lastUpdated) };
  return <FeaturedCharts slug={slug} fact={fact} steps={steps} charts={panelCharts(fact, page, slides)} />;
}
