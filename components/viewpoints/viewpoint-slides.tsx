import type { Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import type { QuotedSource, RenderedStep, RenderedWalkthrough } from '@/lib/content/walkthrough';
import { ExplorableChart, ExploreLink } from '@/components/topic/explore-panels';
import { Prose } from '@/components/topic/prose';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from '@/components/topic/lazy-charts';
import { RowThumb, TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { ChartThumb } from '@/components/topic/chart-thumb';
import { ThumbStrip } from '@/components/topic/thumb-strip';
import { Slideshow } from './slideshow';
import { SourcePopups } from './source-popups';

type StepCardProps = { step: RenderedStep; index: number };

/**
 * One step of the argument, as one card. Its heading makes the point, and the
 * line under it completes the step: read card after card, the two make the
 * whole argument. A card made with a graph or quotes is just those three, the
 * line its section's only paragraph (`cardParagraphErrors`); a card without
 * one gives the rest of its section under the line.
 */
function StepCard({ step, index }: StepCardProps) {
  const visual = step.cardVisual;
  const reasoning = <span className="sv-deck__reasoning" dangerouslySetInnerHTML={{ __html: step.reasoningHtml }} />;
  return (
    <div className="sv-deck__card" data-visual={visual ? true : undefined}>
      <h3 className="sv-deck__heading">{step.heading}</h3>
      {visual ? (
        <>
          <p className="sv-deck__details">{reasoning}</p>
          <ExplorableChart>
            <div className="sv-slide"><LazyChart index={index} /></div>
            <ExploreLink {...visual.panel} href={`#${visual.panel.observation}`} />
          </ExplorableChart>
        </>
      ) : (
        <>
          <p className="sv-deck__details">{reasoning}</p>
          <Prose html={step.evidenceHtml} className="sv-deck__prose" />
        </>
      )}
    </div>
  );
}

type ViewpointSlidesProps = {
  slug: string;
  viewpoints: Viewpoint[];
  walkthroughs: Map<string, RenderedWalkthrough>;
  /** The sources behind each cited claim (`citedSources`), opened from its footnote marker. */
  sources: Record<string, QuotedSource[]>;
};

/**
 * The viewpoints as rows, none open at first. Closed, a row previews the graphs
 * its argument is made with, each opening the row at its card. Open, it is a
 * slideshow: one card per step of the argument, made with a graph or quotes where the
 * step has one. A card's graph opens in full over the page, and a claim's
 * footnote marker opens its sources' own words.
 */
export function ViewpointSlides({ slug, viewpoints, walkthroughs, sources }: ViewpointSlidesProps) {
  return (
    <>
      <SourcePopups sources={sources} />
      <TopicAccordion initial="">
        {viewpoints.map(viewpoint => {
          const { steps } = walkthroughs.get(viewpoint.id) ?? { steps: [] };
          const graphs = steps.flatMap((step, card) => (step.cardVisual ? [{ step, chart: step.cardVisual.chart, picked: step.cardVisual.picked, card }] : []));
          return (
            <TopicRow
              key={viewpoint.id}
              slug={viewpoint.id}
              anchor={anchorFor('viewpoint', viewpoint.id)}
              className="sv-row--walk sv-row--deck sv-row--viewpoint"
              title={viewpoint.shortName}
              subtitle={viewpoint.name}
              meta={viewpoint.draft === 'ai' ? <p key="meta" className="sv-row__meta"><span className="sv-tag">AI draft</span></p> : null}
              thumbs={
                // Without a key, React's development build reports this strip as an
                // unkeyed list child of TopicRow. The walkthrough rows pass the same
                // strip without the warning; the cause is not yet found.
                <ThumbStrip
                  key="thumbs"
                  total={graphs.length}
                  steps={graphs.map(({ card }) => card)}
                  thumbs={graphs.map(({ step, chart, picked, card }) => (
                    <li key={card}>
                      <RowThumb step={card}>
                        <span className="sv-row__thumb" aria-hidden="true">
                          <ChartThumb fact={chart.fact} chart={chart.chart} reading={chart.reading} picked={picked} preview />
                        </span>
                        <span className="sv-walk__thumb-label">{card + 1}. {step.heading}</span>
                      </RowThumb>
                    </li>
                  ))}
                />
              }
            >
              <LazyCharts load={rowCharts.bind(null, slug, 'viewpoint', viewpoint.id)}>
                <Slideshow name={viewpoint.name} headings={steps.map(step => step.heading)}>
                  {steps.map((step, i) => <StepCard key={i} step={step} index={i} />)}
                </Slideshow>
              </LazyCharts>
            </TopicRow>
          );
        })}
      </TopicAccordion>
    </>
  );
}
