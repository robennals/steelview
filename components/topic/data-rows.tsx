import type { ReactNode } from 'react';
import type { Fact } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import { slideGroup } from '@/lib/content/preview';
import type { DataStep } from '@/lib/content/walkthrough';
import { RowThumb, TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { ChartAbout } from '@/components/report/chart-about';
import { ChartThumb } from './chart-thumb';
import { PanelHost } from './explore-panels';
import { ObservationBar, ObservationStep } from './observation-bar';
import { ThumbStrip } from './thumb-strip';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from './lazy-charts';
import { Walkthrough } from './walkthrough';

/** The most chart silhouettes that fit on a closed row's line at the page's full width. */
const THUMBS = 7;

type ChartStepProps = { step: DataStep; number: number; addressed: boolean };

/**
 * One chart, stepped through observation by observation, each picking out its
 * part of the chart. Script finds its addresses by `data-chart-anchor`;
 * `addressed`, on a report's own page, makes them real ids so they work without
 * it, except those the chart itself carries.
 */
function ChartStep({ step, number, addressed }: ChartStepProps) {
  const { fact, chart } = step.chart;
  const drawn = [`${fact.id}--chart-${chart}`, `${fact.id}--chart-${slideGroup(fact, step.chart)}`];
  return (
    <div className="sv-walk__step" data-chart>
      {step.anchors.map(anchor => <span key={anchor} className="sv-walk__anchor" id={addressed && !drawn.includes(anchor) ? anchor : undefined} data-chart-anchor={anchor} />)}
      <div className="sv-walk__chart">
        <ObservationStep observations={step.observations} more={step.more} addressed={addressed}>
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

type DataPanelProps = {
  slug: string;
  fact: Fact;
  steps: DataStep[];
  /** The charts, already drawn, on a report's own page. Otherwise they load as the row opens. */
  charts?: ReactNode[];
};

/**
 * A data collection's charts and observations: the body of its row on the
 * topic page, which a viewpoint's "Explore this data" lifts into a sheet, and
 * the top of its report's own page.
 */
export function DataPanel({ slug, fact, steps, charts }: DataPanelProps) {
  const title = fact.title ?? fact.claim;
  return (
    <LazyCharts fact={fact.id} load={rowCharts.bind(null, slug, 'data', fact.id)} drawn={charts}>
      <PanelHost fact={fact.id} title={title}>
        <Walkthrough
          name={title}
          headings={steps.map(s => s.chart.label)}
          noun="Chart"
          endLabel="Last chart"
          thumbs={steps.map(s => <ChartThumb key={s.chart.href} fact={fact} chart={s.chart.chart} reading={s.chart.reading} />)}
        >
          {steps.map((step, i) => <ChartStep key={i} step={step} number={i + 1} addressed={charts !== undefined} />)}
        </Walkthrough>
      </PanelHost>
    </LazyCharts>
  );
}

type DataRowsProps = { slug: string; facts: Fact[]; walkthroughs: Map<string, DataStep[]> };

/**
 * The Data section: one row per headline data collection. Closed, a row is
 * its title, a one-line overview and its first charts in miniature; open, every
 * chart runs across the top as a miniature, and the chosen one sits large under
 * them, with the observations made about it between its title and its graph.
 * Supporting collections are read inside their parent, so have no row.
 */
export function DataRows({ slug, facts, walkthroughs }: DataRowsProps) {
  return (
    <TopicAccordion initial="">
      {facts.map(fact => {
        const steps = walkthroughs.get(fact.id) ?? [];
        const title = fact.title ?? fact.claim;
        return (
          <TopicRow
            key={fact.id}
            slug={fact.id}
            anchor={anchorFor('fact', fact.id)}
            className="sv-row--walk sv-row--data"
            title={title}
            subtitle={fact.title ? fact.claim : ''}
            meta={null}
            thumbs={
              <ThumbStrip
                total={steps.length}
                thumbs={steps.slice(0, THUMBS).map((step, i) => (
                  <li key={i}>
                    <RowThumb step={i}>
                      <span className="sv-row__thumb" aria-hidden="true"><ChartThumb fact={fact} chart={step.chart.chart} reading={step.chart.reading} /></span>
                      <span className="sv-walk__thumb-label">{i + 1}. {step.chart.label}</span>
                    </RowThumb>
                  </li>
                ))}
              />
            }
          >
            {steps.length > 0 && <DataPanel slug={slug} fact={fact} steps={steps} />}
          </TopicRow>
        );
      })}
    </TopicAccordion>
  );
}
