'use server';

import type { ReactNode } from 'react';
import { listTopicSlugs, loadTopic } from './load';
import { factSlides } from './preview';
import { viewpointWalkthrough } from './walkthrough';
import { SlideChart } from '@/components/topic/slide-chart';

/**
 * The charts of one row on a topic page, drawn here and fetched by
 * `LazyCharts` when the row opens: a viewpoint's step charts, or every chart
 * of a data collection, in step order. A step without a chart is `null`.
 *
 * Callable from the browser, so every argument is checked against the content
 * rather than trusted; anything unknown gets no charts.
 */
export async function rowCharts(slug: string, kind: 'viewpoint' | 'data', id: string): Promise<ReactNode[]> {
  if (!(await listTopicSlugs()).includes(slug)) return [];
  const topic = await loadTopic(slug);
  if (kind === 'viewpoint') {
    const viewpoint = topic.viewpoints.find(v => v.id === id);
    if (!viewpoint) return [];
    return viewpointWalkthrough(topic, viewpoint).steps.map((step, i) => step.chart ? <SlideChart key={i} slide={step.chart} fit="tall" /> : null);
  }
  if (kind === 'data') {
    const fact = topic.facts.find(f => f.id === id);
    if (!fact) return [];
    return factSlides(slug, fact).map((slide, i) => <SlideChart key={i} slide={slide} fit="tall" />);
  }
  return [];
}
