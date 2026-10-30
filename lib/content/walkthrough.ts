import { citedFactTargets, renderMarkdown } from './markdown';
import { factPath } from './types';
import type { Fact, Topic, Viewpoint } from './types';
import type { PreviewSlide } from './preview';

/** One step of a viewpoint's walkthrough: one `###` section, beside the chart it leans on. */
export type WalkthroughStep = {
  /** The section's heading: one claim in the argument. */
  heading: string;
  /** The section's markdown, without its heading. */
  markdown: string;
  /** The chart behind the section's first cited observation that sits beside a chart. */
  chart?: PreviewSlide;
  /** The citation that chart was chosen for, in authoring syntax: `#fact-<fact>/<observation>`. */
  citation?: string;
};

export type Walkthrough = {
  /** The markdown before the first section: the belief being defended. */
  lead: string;
  steps: WalkthroughStep[];
};

/**
 * Each observation's group key in a fact's body. Observations sit under an
 * `## Observations {#<fact>--observations-<key>}` heading, where the key is the
 * id of the reading, comparison or figure they are drawn beside.
 */
function observationGroups(fact: Fact): Map<string, string> {
  const groups = new Map<string, string>();
  let key: string | undefined;
  for (const line of fact.body.split('\n')) {
    if (line.startsWith('## ')) {
      key = line.match(/\{#[a-z0-9-]+--observations-([a-z0-9-]+)\}$/)?.[1];
      continue;
    }
    const observation = line.match(/^### .*\{#[a-z0-9-]+?--([a-z0-9-]+)\}$/)?.[1];
    if (observation && key) groups.set(observation, key);
  }
  return groups;
}

/**
 * The preview chart an observation group is drawn beside, when it is a series
 * reading or a comparison: the two kinds a carousel slide can draw.
 */
function chartFor(slug: string, fact: Fact, key: string, observation: string): PreviewSlide | undefined {
  const href = `${factPath(slug, fact.id)}#${fact.id}--${observation}`;
  const reading = (series: NonNullable<Fact['series']>) => series.readings.find(r => r.id === key);
  if (fact.series && reading(fact.series)) {
    return { fact, chart: 'series', reading: key, label: fact.series.title, href };
  }
  const additional = fact.additionalSeries?.find(s => reading(s));
  if (additional) return { fact, chart: additional.id, reading: key, label: additional.title, href };
  const comparison = fact.comparisons?.find(c => c.id === key);
  if (comparison) return { fact, chart: comparison.id, label: comparison.title, href };
  return undefined;
}

/**
 * A viewpoint as a sequence of steps, one per `###` section, each paired with
 * a chart. The chart is derived, not authored: it is the one beside the first
 * observation the section cites that has a chart, so a section reads beside
 * the evidence its own argument leads with.
 */
export function viewpointWalkthrough(topic: Topic, viewpoint: Viewpoint): Walkthrough {
  const [lead, ...sections] = viewpoint.body.split(/^### /m);
  const groups = new Map(topic.facts.map(fact => [fact.id, observationGroups(fact)]));
  const steps = sections.map(section => {
    const [heading, ...rest] = section.split('\n');
    const markdown = rest.join('\n').trim();
    for (const { id, section: observation } of citedFactTargets(markdown)) {
      const fact = topic.facts.find(f => f.id === id);
      const key = observation && groups.get(id)?.get(observation);
      const chart = fact && key && chartFor(topic.slug, fact, key, observation);
      if (chart) return { heading: heading.trim(), markdown, chart, citation: `#fact-${id}/${observation}` };
    }
    return { heading: heading.trim(), markdown };
  });
  return { lead: lead.trim(), steps };
}

/** A step with its prose rendered, ready for a synchronous component. */
export type RenderedStep = Omit<WalkthroughStep, 'markdown' | 'citation'> & {
  html: string;
  /** "Explore this data", rendered as a citation so it opens the data collection over the page. */
  exploreHtml?: string;
};

export type RenderedWalkthrough = { lead: string; steps: RenderedStep[] };

/**
 * Every viewpoint's walkthrough with its prose rendered, keyed by viewpoint id.
 * Rendering happens here, once, so the components that draw it stay
 * synchronous, as the topic page's other sections are.
 */
export async function renderWalkthroughs(topic: Topic): Promise<Map<string, RenderedWalkthrough>> {
  const rendered = new Map<string, RenderedWalkthrough>();
  for (const viewpoint of topic.viewpoints) {
    const { lead, steps } = viewpointWalkthrough(topic, viewpoint);
    rendered.set(viewpoint.id, {
      lead,
      steps: await Promise.all(steps.map(async ({ heading, markdown, chart, citation }) => ({
        heading,
        chart,
        // The step's chart is beside its prose, so the facts it cites are plain text.
        html: await renderMarkdown(markdown, topic.slug, topic.facts, { citationsAsText: true }),
        exploreHtml: citation && await renderMarkdown(`[Explore this data](${citation})`, topic.slug, topic.facts),
      }))),
    });
  }
  return rendered;
}
