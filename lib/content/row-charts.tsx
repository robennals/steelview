'use server';

import { Fragment, type ReactNode } from 'react';
import { listTopicSlugs, loadTopic } from './load';
import { slideCitations, viewpointWalkthrough } from './walkthrough';
import { ChartSources } from '@/components/topic/chart-sources';
import { panelCharts } from '@/components/topic/fact-figures';
import { SlideChart } from '@/components/topic/slide-chart';

/**
 * The charts of one row on a topic page, drawn here and fetched by
 * `LazyCharts` when the row opens: a viewpoint's step charts as previews, or
 * every chart of a data collection in full, in step order. A step without a chart is `null`.
 *
 * Callable from the browser, so every argument is checked against the content
 * rather than trusted; anything unknown gets no charts.
 */
export async function rowCharts(slug: string, kind: 'viewpoint' | 'data', id: string): Promise<ReactNode[]> {
  if (!(await listTopicSlugs()).includes(slug)) return [];
  const topic = await loadTopic(slug);
  const page = { slug, asOf: topic.lastUpdated, facts: topic.facts };
  if (kind === 'viewpoint') {
    const viewpoint = topic.viewpoints.find(v => v.id === id);
    if (!viewpoint) return [];
    return viewpointWalkthrough(topic, viewpoint).steps.map(({ chart }, i) => chart ? <Fragment key={i}>
      <SlideChart slide={chart} fit="tall" page={page} />
      <ChartSources fact={chart.fact} numbers={slideCitations(chart.fact, chart)} />
    </Fragment> : null);
  }
  if (kind === 'data') {
    const fact = topic.facts.find(f => f.id === id);
    if (!fact) return [];
    // Every chart and figure is drawn in full, with its controls.
    return panelCharts(fact, page);
  }
  return [];
}
