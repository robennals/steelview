import type { Fact } from '@/lib/content/types';
import type { DataStep } from '@/lib/content/walkthrough';
import { TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { ChartThumb } from './chart-thumb';
import { ObservationCycler } from './observation-cycler';
import { Prose } from './prose';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from './lazy-charts';
import { Walkthrough } from './walkthrough';

/** How many chart silhouettes a closed row shows before it counts the rest. */
const THUMBS = 6;

type ChartStepProps = { step: DataStep; number: number };

/** One chart: what to notice in it, stepped through observation by observation, beside it. */
function ChartStep({ step, number }: ChartStepProps) {
  return (
    <div className="sv-walk__step" data-chart>
      <div className="sv-walk__text">
        <p className="sv-walk__kicker">Chart {number}</p>
        {step.observations.length > 0
          ? <ObservationCycler observations={step.observations} />
          : <p className="sv-walk__prose prose-body">{step.description}</p>}
      </div>
      <div className="sv-walk__chart">
        <div className="sv-slide"><LazyChart index={number - 1} /></div>
        <Prose html={step.exploreHtml} className="sv-walk__explore" />
      </div>
    </div>
  );
}

type DataRowsProps = { slug: string; facts: Fact[]; walkthroughs: Map<string, DataStep[]> };

/**
 * The Data section: one row per headline data collection, laid out like the
 * viewpoints. Closed, a row is its title, a one-line overview and its charts in
 * miniature; open, it steps through those charts one at a time, each beside
 * the observations made about it. "Explore this data" opens the collection at
 * that chart, with its controls and the rest of the collection a tab away.
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
            className="sv-row--walk sv-row--data"
            title={title}
            subtitle={fact.title ? fact.claim : ''}
            meta={null}
            thumbs={
              <ol className="sv-row__thumbs sv-walk__thumbs" aria-hidden="true">
                {steps.slice(0, THUMBS).map((step, i) => (
                  <li key={i}>
                    <div className="sv-row__thumb"><ChartThumb fact={fact} chart={step.chart.chart} reading={step.chart.reading} /></div>
                    <span>{i + 1}. {step.chart.label}</span>
                  </li>
                ))}
                {steps.length > THUMBS && (
                  <li>
                    <div className="sv-row__thumb sv-walk__more">+{steps.length - THUMBS} more</div>
                  </li>
                )}
              </ol>
            }
          >
            {steps.length > 0 && (
              <LazyCharts load={rowCharts.bind(null, slug, 'data', fact.id)}>
                <Walkthrough name={title} headings={steps.map(s => s.chart.label)} noun="Chart" endLabel="Last chart">
                  {steps.map((step, i) => <ChartStep key={i} step={step} number={i + 1} />)}
                </Walkthrough>
              </LazyCharts>
            )}
          </TopicRow>
        );
      })}
    </TopicAccordion>
  );
}
