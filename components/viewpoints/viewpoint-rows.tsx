import type { Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import type { RenderedStep, RenderedWalkthrough } from '@/lib/content/walkthrough';
import { ChartThumb } from '@/components/topic/chart-thumb';
import { Prose } from '@/components/topic/prose';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from '@/components/topic/lazy-charts';
import { TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { Walkthrough } from '@/components/topic/walkthrough';

/** Markdown links reduced to their text, for a lead shown as a plain subtitle. */
const plain = (md: string) => md.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

type StepProps = { step: RenderedStep; number: number };

/** One step: its claim and prose, beside the chart it leans on. */
function Step({ step, number }: StepProps) {
  return (
    <div className="sv-walk__step" data-chart={step.chart ? true : undefined}>
      <div className="sv-walk__text">
        <p className="sv-walk__kicker">Step {number}</p>
        <h3 className="sv-walk__heading">{step.heading}</h3>
        <Prose html={step.html} className="sv-walk__prose" />
      </div>
      {step.chart && (
        <div className="sv-walk__chart">
          <div className="sv-slide"><LazyChart index={number - 1} /></div>
          {step.exploreHtml && <Prose html={step.exploreHtml} className="sv-walk__explore" />}
        </div>
      )}
    </div>
  );
}

type ViewpointRowsProps = { slug: string; viewpoints: Viewpoint[]; walkthroughs: Map<string, RenderedWalkthrough> };

/**
 * The viewpoints as rows, none open at first. Closed, a row shows the sequence
 * of charts its argument walks through; open, it steps through those sections
 * one at a time beside their charts. Every viewpoint is drawn identically, so
 * none looks more important than another.
 */
export function ViewpointRows({ slug, viewpoints, walkthroughs }: ViewpointRowsProps) {
  return (
    <TopicAccordion initial="">
      {viewpoints.map(viewpoint => {
        const { lead, steps } = walkthroughs.get(viewpoint.id) ?? { lead: '', steps: [] };
        return (
          <TopicRow
            key={viewpoint.id}
            slug={viewpoint.id}
            anchor={anchorFor('viewpoint', viewpoint.id)}
            className="sv-row--walk sv-row--viewpoint"
            title={viewpoint.name}
            subtitle={plain(lead)}
            meta={null}
            thumbs={
              <ol className="sv-row__thumbs sv-walk__thumbs" aria-hidden="true">
                {steps.map((step, i) => (
                  <li key={i}>
                    <div className="sv-row__thumb">
                      {step.chart ? <ChartThumb fact={step.chart.fact} chart={step.chart.chart} reading={step.chart.reading} /> : <span className="sv-walk__no-chart">No chart</span>}
                    </div>
                    <span>{i + 1}. {step.heading}</span>
                  </li>
                ))}
              </ol>
            }
          >
            <LazyCharts load={rowCharts.bind(null, slug, 'viewpoint', viewpoint.id)}>
              <Walkthrough name={viewpoint.name} headings={steps.map(s => s.heading)} noun="Step" endLabel="End of the argument">
                {steps.map((step, i) => <Step key={i} step={step} number={i + 1} />)}
              </Walkthrough>
            </LazyCharts>
          </TopicRow>
        );
      })}
    </TopicAccordion>
  );
}
