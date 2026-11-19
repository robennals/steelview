'use server';

import type { ReactNode } from 'react';
import { listTopicSlugs, loadTopic } from './load';
import { topicQuotes } from './figure-props';
import { renderDataWalkthroughs } from './walkthrough';
import { DataPanel } from '@/components/topic/data-rows';
import { panelCharts } from '@/components/topic/fact-figures';

/**
 * One data collection's whole panel, its charts drawn in full, of which a
 * sheet shows the one chart a reader opened. Fetched by the home page when a
 * reader opens a preview chart, so the page does not carry a panel for every
 * preview it shows.
 *
 * Callable from the browser, so every argument is checked against the content
 * rather than trusted; anything unknown gets no panel.
 */
export async function previewPanel(slug: string, factId: string): Promise<ReactNode> {
  if (!(await listTopicSlugs()).includes(slug)) return null;
  const topic = await loadTopic(slug);
  const fact = topic.facts.find(f => f.id === factId);
  if (!fact) return null;
  const steps = (await renderDataWalkthroughs(topic, [fact])).get(fact.id) ?? [];
  const page = { slug, asOf: topic.lastUpdated, facts: topic.facts, quotes: topicQuotes(topic.facts, topic.lastUpdated) };
  return <DataPanel slug={slug} fact={fact} steps={steps} charts={panelCharts(fact, page)} />;
}
