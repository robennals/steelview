'use server';

import { Fragment, type ReactNode } from 'react';
import { listTopicSlugs, loadTopic } from './load';
import { topicQuotes } from './figure-props';
import { slideCitations, viewpointWalkthrough } from './walkthrough';
import { ChartSources } from '@/components/topic/chart-sources';
import { panelCharts } from '@/components/topic/fact-figures';
import { SlideChart } from '@/components/topic/slide-chart';

/**
 * The charts of one row on a topic page, drawn here and fetched by
 * `LazyCharts` when the row opens: each card's graph or quotes for a viewpoint
 * (`cardVisual`), at a card's shapes, or every chart of a data collection in
 * full, in step order. A card without a visual is `null`.
 *
 * Callable from the browser, so every argument is checked against the content
 * rather than trusted; anything unknown gets no charts.
 */
export async function rowCharts(slug: string, kind: 'viewpoint' | 'data', id: string): Promise<ReactNode[]> {
  if (!(await listTopicSlugs()).includes(slug)) return [];
  const topic = await loadTopic(slug);
  // A card's quotes lead on to the topic's whole list, as a data panel's do.
  const page = { slug, asOf: topic.lastUpdated, facts: topic.facts, quotes: topicQuotes(topic.facts, topic.lastUpdated) };
  if (kind === 'viewpoint') {
    const viewpoint = topic.viewpoints.find(v => v.id === id);
    if (!viewpoint) return [];
    const { steps } = viewpointWalkthrough(topic, viewpoint);
    return steps.map(({ cardVisual }, i) => {
      if (!cardVisual) return null;
      const { chart, cited } = cardVisual;
      return (
        <Fragment key={i}>
          {/* A card of quotes picks out the speakers its point rests on: the rows its observation marks. */}
          <SlideChart slide={chart} fit="card" page={page} picked={chart.fact.observationMarks?.[cited.section]?.rows} />
          <ChartSources fact={chart.fact} numbers={slideCitations(chart.fact, chart)} />
        </Fragment>
      );
    });
  }
  if (kind === 'data') {
    const fact = topic.facts.find(f => f.id === id);
    if (!fact) return [];
    // Every chart and figure is drawn in full, with its controls, and its list
    // of quotes is the topic's whole collection.
    return panelCharts(fact, page);
  }
  return [];
}
