import type { Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import type { CitedClaim, RenderedStep, RenderedWalkthrough } from '@/lib/content/walkthrough';
import { ExplorableChart, ExploreLink } from '@/components/topic/explore-panels';
import { Prose } from '@/components/topic/prose';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from '@/components/topic/lazy-charts';
import { RowThumb, TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { ChartThumb } from '@/components/topic/chart-thumb';
import { ThumbStrip } from '@/components/topic/thumb-strip';
import { ClaimPopups } from './claim-popups';
import { Slideshow } from './slideshow';

type StepCardProps = { step: RenderedStep; index: number };

/**
 * One step of the argument, as one card. Its heading makes the point, and the
 * line under it, the section's first paragraph, completes the step: read card
 * after card, the two make the whole argument. The rest of the section is the
 * evidence. A card made with a graph or quotes opens it from that line, over them;
 * a card without one gives it in full.
 * Citations open in pop-ups (`ClaimPopups`).
 */
function StepCard({ step, index }: StepCardProps) {
  const visual = step.cardVisual;
  const reasoning = <span className="sv-deck__reasoning" dangerouslySetInnerHTML={{ __html: step.reasoningHtml }} />;
  return (
    <div className="sv-deck__card" data-visual={visual ? true : undefined}>
      <h3 className="sv-deck__heading">{step.heading}</h3>
      {visual ? (
        <>
          <details className="sv-deck__details">
            <summary>
              {reasoning}
              <span className="sv-deck__more" aria-hidden="true" />
            </summary>
            <div className="sv-deck__pop">
              <Prose html={step.evidenceHtml} className="sv-deck__prose" />
            </div>
          </details>
          <ExplorableChart>
            <div className="sv-slide"><LazyChart index={index} /></div>
            {visual.panel
              ? <ExploreLink {...visual.panel} href={visual.chart.href} />
              : <Prose html={visual.exploreHtml} className="sv-walk__explore" />}
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
  /** The findings the viewpoints cite (`renderCitedClaims`). */
  claims: Record<string, CitedClaim>;
};

/**
 * The viewpoints as rows, none open at first. Closed, a row previews the graphs
 * its argument is made with, each opening the row at its card. Open, it is a
 * slideshow: one card per step of the argument, made with a graph or quotes where the
 * step has one. Tapping a cited claim opens the finding behind it in a pop-up.
 */
export function ViewpointSlides({ slug, viewpoints, walkthroughs, claims }: ViewpointSlidesProps) {
  return (
    <>
      <ClaimPopups claims={claims} />
      <TopicAccordion initial="">
        {viewpoints.map(viewpoint => {
          const { steps } = walkthroughs.get(viewpoint.id) ?? { steps: [] };
          const graphs = steps.flatMap((step, card) => (step.cardVisual ? [{ step, chart: step.cardVisual.chart, card }] : []));
          return (
            <TopicRow
              key={viewpoint.id}
              slug={viewpoint.id}
              anchor={anchorFor('viewpoint', viewpoint.id)}
              className="sv-row--walk sv-row--deck sv-row--viewpoint"
              title={viewpoint.shortName}
              subtitle={viewpoint.name}
              meta={null}
              thumbs={
                // Without a key, React's development build reports this strip as an
                // unkeyed list child of TopicRow. The walkthrough rows pass the same
                // strip without the warning; the cause is not yet found.
                <ThumbStrip
                  key="thumbs"
                  total={graphs.length}
                  steps={graphs.map(({ card }) => card)}
                  thumbs={graphs.map(({ step, chart, card }) => (
                    <li key={card}>
                      <RowThumb step={card}>
                        <span className="sv-row__thumb" aria-hidden="true">
                          <ChartThumb fact={chart.fact} chart={chart.chart} reading={chart.reading} preview />
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
