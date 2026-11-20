'use server';

import { Fragment, type ReactNode } from 'react';
import { listTopicSlugs, loadTopic } from './load';
import { topicQuotes } from './figure-props';
import { featuredSlides, slideCitations, viewpointWalkthrough } from './walkthrough';
import { ChartSources } from '@/components/topic/chart-sources';
import { panelCharts } from '@/components/topic/fact-figures';
import { SlideChart } from '@/components/topic/slide-chart';

/**
 * The charts of one row on a topic page, drawn here and fetched by
 * `LazyCharts` when the row opens: each card's graph or quotes for a viewpoint
 * (`cardVisual`), at a card's shapes, or a collection's featured charts
 * (`featuredSlides`) in full, as a reader reaches for one. A card without a
 * visual is `null`.
 *
 * Callable from the browser, so every argument is checked against the content
 * rather than trusted; anything unknown gets no charts.
 */
export async function rowCharts(slug: string, kind: 'viewpoint' | 'featured', id: string): Promise<ReactNode[]> {
  if (!(await listTopicSlugs()).includes(slug)) return [];
  const topic = await loadTopic(slug);
  // A card's quotes lead on to the topic's whole list, as its full version's do.
  const page = { slug, asOf: topic.lastUpdated, quotes: topicQuotes(topic.facts, topic.lastUpdated) };
  if (kind === 'viewpoint') {
    const viewpoint = topic.viewpoints.find(v => v.id === id);
    if (!viewpoint) return [];
    const { steps } = viewpointWalkthrough(topic, viewpoint);
    return steps.map(({ cardVisual }, i) => {
      if (!cardVisual) return null;
      const { chart, picked } = cardVisual;
      return (
        <Fragment key={i}>
          {/* A card picks out the rows its point rests on: the speakers of its quotes, the events of its timeline. */}
          <SlideChart slide={chart} fit="card" page={page} picked={picked} />
          <ChartSources fact={chart.fact} numbers={slideCitations(chart.fact, chart)} />
        </Fragment>
      );
    });
  }
  if (kind === 'featured') {
    const fact = topic.facts.find(f => f.id === id);
    const slides = featuredSlides(topic).get(id);
    // Each chart is drawn in full, with its controls, and its list of quotes is
    // the topic's whole collection.
    return fact && slides ? panelCharts(fact, page, slides) : [];
  }
  return [];
}
