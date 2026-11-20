import type { ReactNode } from 'react';
import type { Fact } from '@/lib/content/types';
import { previewTarget } from '@/lib/content/preview';
import { plottedReadings } from '@/lib/chart/series-chart';
import type { DataStep } from '@/lib/content/walkthrough';
import { ChartAbout } from '@/components/report/chart-about';
import { PanelHost } from './explore-panels';
import { ObservationBar, ObservationStep } from './observation-bar';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from './lazy-charts';

/**
 * One featured chart in full. Script finds its addresses by
 * `data-chart-anchor`, except those the chart itself carries.
 */
function ChartStep({ step, number }: { step: DataStep; number: number }) {
  const { fact, chart } = step.chart;
  // The ids the chart carries itself: its own, and each reading that has a plot.
  const target = previewTarget(fact, chart);
  const plots = target?.kind === 'series' ? plottedReadings(target.series).map(r => r.id) : [];
  const drawn = new Set([chart, ...plots].map(id => `${fact.id}--chart-${id}`));
  return (
    <div className="sv-walk__step" data-chart>
      {step.anchors.filter(anchor => !drawn.has(anchor)).map(anchor => <span key={anchor} className="sv-walk__anchor" data-chart-anchor={anchor} />)}
      <div className="sv-walk__chart">
        <ObservationStep observations={step.observations} views={step.views} more={step.more}>
          <div className="sv-slide">
            <LazyChart index={number - 1}>
              <ChartAbout description={step.description} />
              <ObservationBar />
            </LazyChart>
          </div>
        </ObservationStep>
      </div>
    </div>
  );
}

type FeaturedChartsProps = {
  slug: string;
  fact: Fact;
  steps: DataStep[];
  /** The charts, already drawn, for the home page's sheet. Otherwise they load as a reader reaches for one. */
  charts?: ReactNode[];
};

/**
 * One collection's featured charts, each opened alone and in full over the
 * page, from a viewpoint's card or a home-page preview. Nothing shows until
 * then: the page holds only each chart's addresses, so arriving at one opens
 * its chart.
 */
export function FeaturedCharts({ slug, fact, steps, charts }: FeaturedChartsProps) {
  const panelSteps = steps.map((step, i) => ({
    content: <ChartStep key={i} step={step} number={i + 1} />,
    label: step.label,
    addresses: [...step.anchors, ...step.observations.map(o => o.id), ...(step.views ?? []).flatMap(view => view.anchors)],
  }));
  return (
    <LazyCharts fact={fact.id} load={rowCharts.bind(null, slug, 'featured', fact.id)} drawn={charts}>
      <PanelHost fact={fact.id} title={fact.title ?? fact.claim} steps={panelSteps}>
        <div hidden>
          {[...new Set(panelSteps.flatMap(step => step.addresses))].map(address => <span key={address} data-chart-anchor={address} />)}
        </div>
      </PanelHost>
    </LazyCharts>
  );
}

/** Every featured chart on a topic page, keyed by collection (`renderFeaturedCharts`). */
export function FeaturedChartSheets({ slug, facts, charts }: { slug: string; facts: Fact[]; charts: Map<string, DataStep[]> }) {
  return facts.flatMap(fact => {
    const steps = charts.get(fact.id);
    return steps ? [<FeaturedCharts key={fact.id} slug={slug} fact={fact} steps={steps} />] : [];
  });
}
