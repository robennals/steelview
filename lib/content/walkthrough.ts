import { citedFactTargets, renderMarkdown } from './markdown';
import { headlineFacts } from './rank-facts';
import { factPath } from './types';
import type { Fact, Topic, Viewpoint } from './types';
import { factSlides, type PreviewSlide } from './preview';

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
  /** That citation's observation, as an element id: `<fact>--<observation>`. */
  observation?: string;
};

export type Walkthrough = {
  /** The markdown before the first section: the belief being defended. */
  lead: string;
  steps: WalkthroughStep[];
};

/** One observation in a data collection: an addressable finding about the chart it sits beside. */
export type Observation = {
  /** Its id within the fact: the `<id>` of `#<fact>--<id>`. */
  id: string;
  heading: string;
  /** Its explanation, without the heading. */
  markdown: string;
};

/**
 * A fact's observations, grouped by the chart they are drawn beside, in
 * order. Observations sit under an `## Observations {#<fact>--observations-<key>}`
 * heading, where the key is the id of the reading, comparison or figure they
 * belong to, each headed `### <heading> {#<fact>--<id>}`.
 */
export function observationsByChart(fact: Fact): Map<string, Observation[]> {
  const groups = new Map<string, Observation[]>();
  let group: Observation[] | undefined;
  let current: Observation | undefined;
  for (const line of fact.body.split('\n')) {
    if (line.startsWith('## ')) {
      const key = line.match(/\{#[a-z0-9-]+--observations-([a-z0-9-]+)\}$/)?.[1];
      group = key ? (groups.get(key) ?? groups.set(key, []).get(key)) : undefined;
      current = undefined;
      continue;
    }
    const heading = line.match(/^### (.*) \{#[a-z0-9-]+?--([a-z0-9-]+)\}$/);
    if (heading && group) {
      current = { id: heading[2], heading: heading[1], markdown: '' };
      group.push(current);
    } else if (current) {
      current.markdown += `${line}\n`;
    }
  }
  for (const observations of groups.values()) for (const o of observations) o.markdown = o.markdown.trim();
  return groups;
}

/** Each observation's group key in a fact's body: the chart it is drawn beside. */
function observationGroups(fact: Fact): Map<string, string> {
  return new Map([...observationsByChart(fact)].flatMap(([key, observations]) => observations.map(o => [o.id, key] as const)));
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
      if (chart) return { heading: heading.trim(), markdown, chart, citation: `#fact-${id}/${observation}`, observation: `${id}--${observation}` };
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
  /** Whether the chart's collection has a data panel on the page for "Explore this data" to open. */
  hasPanel: boolean;
};

export type RenderedWalkthrough = { lead: string; steps: RenderedStep[] };

/**
 * Every viewpoint's walkthrough with its prose rendered, keyed by viewpoint id.
 * Rendering happens here, once, so the components that draw it stay
 * synchronous, as the topic page's other sections are.
 */
export async function renderWalkthroughs(topic: Topic): Promise<Map<string, RenderedWalkthrough>> {
  const rendered = new Map<string, RenderedWalkthrough>();
  const panels = new Set(headlineFacts(topic.facts).map(fact => fact.id));
  for (const viewpoint of topic.viewpoints) {
    const { lead, steps } = viewpointWalkthrough(topic, viewpoint);
    rendered.set(viewpoint.id, {
      lead,
      steps: await Promise.all(steps.map(async ({ heading, markdown, chart, citation, observation }) => ({
        heading,
        chart,
        observation,
        hasPanel: chart !== undefined && panels.has(chart.fact.id),
        // The step's chart is beside its prose, so the facts it cites are plain text.
        html: await renderMarkdown(markdown, topic.slug, topic.facts, { citationsAsText: true }),
        exploreHtml: citation && await renderMarkdown(`[Explore this data](${citation})`, topic.slug, topic.facts),
      }))),
    });
  }
  return rendered;
}

/** One chart of a data collection, with its observations rendered, ready to step through. */
export type DataStep = {
  chart: PreviewSlide;
  /** The observations drawn beside this chart, in order: what to notice in it. */
  observations: { id: string; heading: string; html: string }[];
  /** What the chart shows, for a chart with no observations of its own. */
  description: string;
};

/**
 * Each data collection as a walkthrough of its charts, keyed by fact id: every
 * chart in turn, beside the observations made about it. Observations are shown
 * away from their collection here, so they leave out source footnotes and fact
 * links, which the collection itself carries.
 */
export async function renderDataWalkthroughs(topic: Topic, facts: Fact[]): Promise<Map<string, DataStep[]>> {
  const rendered = new Map<string, DataStep[]>();
  const options = { citationsAsText: true, footnotes: false };
  for (const fact of facts) {
    const groups = observationsByChart(fact);
    rendered.set(fact.id, await Promise.all(factSlides(topic.slug, fact).map(async chart => {
      const series = chart.chart === 'series' ? fact.series : fact.additionalSeries?.find(s => s.id === chart.chart);
      const key = chart.reading ?? series?.readings[0].id ?? chart.chart;
      const description = series?.description ?? fact.comparisons?.find(c => c.id === chart.chart)?.description ?? '';
      return {
        chart,
        description,
        observations: await Promise.all((groups.get(key) ?? []).map(async o => ({
          id: `${fact.id}--${o.id}`,
          heading: o.heading,
          html: await renderMarkdown(o.markdown, topic.slug, topic.facts, options),
        }))),
      };
    })));
  }
  return rendered;
}
