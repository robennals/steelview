import { citedFactTargets, renderMarkdown } from './markdown';
import { headlineFacts } from './rank-facts';
import { componentFigure, factPath, figureLabel, isComponentFigure } from './types';
import type { Fact, ObservationMark, Topic, Viewpoint } from './types';
import { factSlides, slideGroup, type PreviewSlide } from './preview';

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
  /** A Subtlety: stepped through like an observation, after them, but it qualifies the chart rather than reading it. */
  subtlety: boolean;
};

/**
 * A fact's observations, grouped by the chart they are drawn beside, in order,
 * with the chart's Subtleties after them. They sit under an
 * `## Observations {#<fact>--observations-<key>}` or
 * `## Subtleties {#<fact>--subtleties-<key>}` heading, where the key is the id
 * of the reading, comparison or figure they belong to, each headed
 * `### <heading> {#<fact>--<id>}`.
 */
export function observationsByChart(fact: Fact): Map<string, Observation[]> {
  const groups = new Map<string, Observation[]>();
  let group: Observation[] | undefined;
  let subtlety = false;
  let current: Observation | undefined;
  for (const line of fact.body.split('\n')) {
    if (line.startsWith('## ')) {
      const [, kind, key] = line.match(/\{#[a-z0-9-]+--(observations|subtleties)-([a-z0-9-]+)\}$/) ?? [];
      group = key ? (groups.get(key) ?? groups.set(key, []).get(key)) : undefined;
      subtlety = kind === 'subtleties';
      current = undefined;
      continue;
    }
    const heading = line.match(/^### (.*) \{#[a-z0-9-]+?--([a-z0-9-]+)\}$/);
    if (heading && group) {
      current = { id: heading[2], heading: heading[1], markdown: '', subtlety };
      group.push(current);
    } else if (current) {
      current.markdown += `${line}\n`;
    }
  }
  for (const [key, observations] of groups) {
    for (const o of observations) o.markdown = o.markdown.trim();
    groups.set(key, [...observations.filter(o => !o.subtlety), ...observations.filter(o => o.subtlety)]);
  }
  return groups;
}

/** An observation, as an element id, with the part of its chart it picks out. */
export type MarkedObservation = { id: string; mark: ObservationMark };

/** The observations on one chart that pick out a part of it. */
export function markedObservations(fact: Fact, key: string): MarkedObservation[] {
  return (observationsByChart(fact).get(key) ?? []).flatMap(({ id }) => {
    const mark = fact.observationMarks?.[id];
    return mark ? [{ id: `${fact.id}--${id}`, mark }] : [];
  });
}

/** Each observation's group key in a fact's body: the chart it is drawn beside. */
export function observationGroups(fact: Fact): Map<string, string> {
  return new Map([...observationsByChart(fact)].flatMap(([key, observations]) => observations.map(o => [o.id, key] as const)));
}

/**
 * The chart an observation group is drawn beside: a series reading, a
 * comparison or a library figure.
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
  const figure = componentFigure(fact, key);
  return figure && { fact, chart: figure.id, label: figureLabel(figure), href };
}

/**
 * A viewpoint as a sequence of steps, one per `###` section, each paired with
 * a chart. The chart is derived, not authored: it is the one beside the first
 * observation the section cites that has a chart, or the first chart it cites
 * by name, so a section reads beside the evidence its own argument leads with.
 */
export function viewpointWalkthrough(topic: Topic, viewpoint: Viewpoint): Walkthrough {
  const [lead, ...sections] = viewpoint.body.split(/^### /m);
  const groups = new Map(topic.facts.map(fact => [fact.id, observationGroups(fact)]));
  const steps = sections.map(section => {
    const [heading, ...rest] = section.split('\n');
    const markdown = rest.join('\n').trim();
    for (const { id, section: observation } of citedFactTargets(markdown)) {
      const fact = topic.facts.find(f => f.id === id);
      // A citation can also name a chart outright, `#fact-<fact>/chart-<id>`, or
      // an old anchor of prose a figure now stands in for (`replaces`).
      const key = observation && (groups.get(id)?.get(observation) ?? fact?.figures?.filter(isComponentFigure).find(f => f.replaces?.includes(observation))?.id ?? observation.match(/^chart-(.+)$/)?.[1]);
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
  /** The observations and Subtleties of this chart, in order: what to notice in it. `heading` is rendered, without a paragraph. */
  observations: { id: string; heading: string; html: string; mark?: ObservationMark; subtlety: boolean }[];
  /** What the chart shows, for a chart with no observations of its own. */
  description: string;
  /** The element ids a citation can name this chart by, so a viewpoint's step opens on it. */
  anchors: string[];
};

/**
 * Each chart's addresses: its own, the view a fact sheet shows it in, its
 * Observations and Subtleties groups and each old anchor it stands in for
 * (`replaces`, `movedAnchors`). An address the readings of one series share
 * belongs to the first of them, as `--observations` and `--subtleties`, a group
 * about no one chart, belong to the first chart.
 */
function chartAnchors(fact: Fact, slides: PreviewSlide[]): string[][] {
  const taken = new Set<string>();
  return slides.map(slide => {
    const key = slideGroup(fact, slide);
    const replaced = componentFigure(fact, slide.chart)?.replaces ?? [];
    const moved = Object.entries(fact.movedAnchors ?? {}).flatMap(([anchor, chart]) => (chart === key ? [anchor] : []));
    const anchors = [`chart-${slide.chart}`, `chart-${key}`, `chart-${slide.chart}-methodology`, `viz-${slide.chart}`, `observations-${key}`, `subtleties-${key}`, ...replaced, ...moved, 'observations', 'subtleties']
      .map(anchor => `${fact.id}--${anchor}`)
      .filter(anchor => !taken.has(anchor));
    anchors.forEach(anchor => taken.add(anchor));
    return [...new Set(anchors)];
  });
}

/**
 * Each data collection as a walkthrough of its charts, keyed by fact id: every
 * chart in turn, beside the observations made about it. On a topic page
 * observations are shown away from their collection, so they leave out source
 * footnotes and fact links, which the collection itself carries; a report's own
 * page, where the sources are, keeps them with `options`.
 */
export async function renderDataWalkthroughs(topic: Topic, facts: Fact[], options = { citationsAsText: true, footnotes: false }): Promise<Map<string, DataStep[]>> {
  const rendered = new Map<string, DataStep[]>();
  for (const fact of facts) {
    const groups = observationsByChart(fact);
    const slides = factSlides(topic.slug, fact);
    const anchors = chartAnchors(fact, slides);
    rendered.set(fact.id, await Promise.all(slides.map(async (chart, i) => {
      const series = chart.chart === 'series' ? fact.series : fact.additionalSeries?.find(s => s.id === chart.chart);
      const key = slideGroup(fact, chart);
      const figure = componentFigure(fact, chart.chart);
      const description = series?.description ?? fact.comparisons?.find(c => c.id === chart.chart)?.description ?? (figure && 'description' in figure ? figure.description : '') ?? '';
      return {
        chart,
        description,
        anchors: anchors[i],
        observations: await Promise.all((groups.get(key) ?? []).map(async o => ({
          id: `${fact.id}--${o.id}`,
          heading: (await renderMarkdown(o.heading, topic.slug, topic.facts, options)).replace(/^<p>|<\/p>\s*$/g, ''),
          html: await renderMarkdown(o.markdown, topic.slug, topic.facts, options),
          mark: fact.observationMarks?.[o.id],
          subtlety: o.subtlety,
        }))),
      };
    })));
  }
  return rendered;
}
