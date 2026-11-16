import type { Viewpoint } from '@/lib/content/types';
import { anchorFor } from '@/lib/content/types';
import type { CitedClaim, RenderedStep, RenderedWalkthrough } from '@/lib/content/walkthrough';
import { ExplorableChart, ExploreLink } from '@/components/topic/explore-panels';
import { Prose } from '@/components/topic/prose';
import { rowCharts } from '@/lib/content/row-charts';
import { LazyChart, LazyCharts } from '@/components/topic/lazy-charts';
import { TopicAccordion, TopicRow } from '@/components/home/topic-accordion';
import { ClaimPopups } from './claim-popups';
import { Slideshow } from './slideshow';

/**
 * The topics whose viewpoints are shown as slideshows, a trial of a simpler
 * layout before it replaces the step-and-chart walkthrough everywhere.
 */
export const SLIDESHOW_TOPICS = new Set(['uk-asylum']);

type StepCardProps = { step: RenderedStep; index: number };

/**
 * One step of the argument, as one card: its point as the title, then, when
 * it leans on a graph, a line saying what the graph shows, which opens to the
 * reasoning, over the graph filling the rest of the card. A step with no graph
 * gives its reasoning in full instead. Citations in the reasoning open in
 * pop-ups (`ClaimPopups`).
 */
function StepCard({ step, index }: StepCardProps) {
  const { chart, chartCard: graph } = step;
  return (
    <div className="sv-deck__card" data-graph={chart && graph ? true : undefined}>
      <h3 className="sv-deck__heading">{step.heading}</h3>
      {chart && graph ? (
        <>
          <details className="sv-deck__details">
            <summary>
              <span className="sv-deck__shows">
                {graph.title}{graph.subtitle && <span className="sv-deck__shows-sub">{`. ${graph.subtitle}`}</span>}
              </span>
              <span className="sv-deck__more" aria-hidden="true" />
            </summary>
            <div className="sv-deck__pop">
              <Prose html={step.html} className="sv-deck__prose" />
            </div>
          </details>
          <ExplorableChart>
            <div className="sv-slide"><LazyChart index={index} /></div>
            {step.panel
              ? <ExploreLink {...step.panel} href={chart.href} />
              : step.exploreHtml && <Prose html={step.exploreHtml} className="sv-walk__explore" />}
          </ExplorableChart>
        </>
      ) : (
        <Prose html={step.html} className="sv-deck__prose" />
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
 * The viewpoints as rows, none open at first, each a slideshow once open: one
 * card per step of the argument, made with a graph where the step has one.
 * Tapping a cited claim opens the finding behind it in a pop-up.
 */
export function ViewpointSlides({ slug, viewpoints, walkthroughs, claims }: ViewpointSlidesProps) {
  return (
    <ClaimPopups claims={claims}>
      <TopicAccordion initial="">
        {viewpoints.map(viewpoint => {
          const { steps } = walkthroughs.get(viewpoint.id) ?? { steps: [] };
          return (
            <TopicRow
              key={viewpoint.id}
              slug={viewpoint.id}
              anchor={anchorFor('viewpoint', viewpoint.id)}
              className="sv-row--deck sv-row--viewpoint"
              title={viewpoint.shortName}
              subtitle={viewpoint.name}
              meta={null}
              thumbs={null}
            >
              <LazyCharts load={rowCharts.bind(null, slug, 'viewpoint', viewpoint.id, true)}>
                <Slideshow name={viewpoint.name} headings={steps.map(step => step.heading)}>
                  {steps.map((step, i) => <StepCard key={i} step={step} index={i} />)}
                </Slideshow>
              </LazyCharts>
            </TopicRow>
          );
        })}
      </TopicAccordion>
    </ClaimPopups>
  );
}
