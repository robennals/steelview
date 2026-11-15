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

/** A step's claim and its reasoning, alone on a slide. Its citations open in pop-ups (`ClaimPopups`). */
function TextSlide({ step }: { step: RenderedStep }) {
  return (
    <div className="sv-deck__text">
      <h3 className="sv-deck__heading">{step.heading}</h3>
      <Prose html={step.html} className="sv-deck__prose" />
    </div>
  );
}

/** The graph a step leans on, under a line saying what it shows. */
function ChartSlide({ step, description, href, index }: { step: RenderedStep; description: string; href: string; index: number }) {
  return (
    <div className="sv-deck__chart sv-walk__chart">
      <p className="sv-deck__shows">{description}</p>
      <ExplorableChart><LazyChart index={index} /></ExplorableChart>
      {step.panel
        ? <ExploreLink {...step.panel} href={href} />
        : step.exploreHtml && <Prose html={step.exploreHtml} className="sv-walk__explore" />}
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
 * The viewpoints as rows, none open at first, each a slideshow once open: every
 * step's text on a slide, and after it, when the step leans on a graph, the
 * graph on a slide of its own. Tables and quotes get no slide: they read as
 * more text, which the step's prose already gives. Tapping a cited claim opens
 * the finding behind it in a pop-up.
 */
export function ViewpointSlides({ slug, viewpoints, walkthroughs, claims }: ViewpointSlidesProps) {
  return (
    <ClaimPopups claims={claims}>
      <TopicAccordion initial="">
        {viewpoints.map(viewpoint => {
          const { steps } = walkthroughs.get(viewpoint.id) ?? { steps: [] };
          const slides = steps.flatMap((step, i) => [
            { outline: { label: step.heading, chart: false }, slide: <TextSlide key={`text-${i}`} step={step} /> },
            ...(step.chartSlide && step.chart
              ? [{ outline: { label: step.chart.label, chart: true }, slide: <ChartSlide key={`chart-${i}`} step={step} description={step.chartSlide.description} href={step.chart.href} index={i} /> }]
              : []),
          ]);
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
              <LazyCharts load={rowCharts.bind(null, slug, 'viewpoint', viewpoint.id)}>
                <Slideshow name={viewpoint.name} outline={slides.map(s => s.outline)}>
                  {slides.map(s => s.slide)}
                </Slideshow>
              </LazyCharts>
            </TopicRow>
          );
        })}
      </TopicAccordion>
    </ClaimPopups>
  );
}
