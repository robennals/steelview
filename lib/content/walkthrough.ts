import { citedFactTargets, renderMarkdown, type PanelTarget } from './markdown';
import { headlineFacts } from './rank-facts';
import { alongsideOf, plotReadingId, plottedReadings } from '@/lib/chart/series-chart';
import { chartCitations, footnotesIn } from './sources';
import { componentFigure, factPath, figureLabel, isComponentFigure } from './types';
import type { Fact, ObservationMark, Topic, Viewpoint } from './types';
import { factSlides, isPreviewable, previewTarget, slideGroups, type PreviewSlide } from './preview';

/** One step of a viewpoint's walkthrough: one `###` section, beside the chart it leans on. */
export type WalkthroughStep = {
  /** The section's heading: one claim in the argument. */
  heading: string;
  /** The section's markdown, without its heading. */
  markdown: string;
  /** The chart behind the section's first cited observation that sits beside a chart. */
  chart?: PreviewSlide;
  /** The citation that chart was chosen for: `#fact-<id>/<section>`. */
  cited?: { id: string; section: string };
  /** The graph a slideshow card is made with (`cardGraph`), with the citation it was chosen for. */
  cardGraph?: { chart: PreviewSlide; cited: { id: string; section: string } };
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

/**
 * A fact's further text on each chart, read in the chart's More: what a chart
 * needs saying that is not a finding, under `## More {#<fact>--more-<key>}`.
 * An `###` heading in it takes an id as anywhere else in the body.
 */
export function chartMore(fact: Pick<Fact, 'body'>): Map<string, string> {
  const more = new Map<string, string>();
  for (const section of fact.body.split(/^(?=## )/m)) {
    const [heading, ...rest] = section.split('\n');
    const key = heading.match(/^## .*\{#[a-z0-9-]+--more-([a-z0-9-]+)\}$/)?.[1];
    if (key) more.set(key, rest.join('\n').trim());
  }
  return more;
}

/**
 * The numbered sources a chart's row lists: what the chart draws, then what its
 * observations, Subtleties and More text cite, in that order and each once.
 * What is cited sits on a chart, so this is what makes a source shown at all.
 */
export function slideCitations(fact: Fact, slide: Pick<PreviewSlide, 'chart' | 'reading'>): number[] {
  const keys = slideGroups(fact, slide);
  const groups = observationsByChart(fact);
  const more = chartMore(fact);
  const prose = keys.flatMap(key => [...(groups.get(key) ?? []).map(o => `${o.heading}\n${o.markdown}`), more.get(key) ?? '']);
  // A series key is a reading, which has sources of its own; any other chart ignores it.
  const drawn = keys.flatMap(key => chartCitations(fact, slide.chart, key));
  return [...new Set([...drawn, ...prose.flatMap(text => footnotesIn(text, fact.id))])];
}

/**
 * Each chart's sources (`slideCitations`), in step order. The claim sits above
 * every chart, so the first chart's row also lists what the claim cites.
 */
export function factCitations(fact: Fact, slides: PreviewSlide[]): number[][] {
  return slides.map((slide, i) => [...new Set([...slideCitations(fact, slide), ...(i === 0 ? fact.claimSources ?? [1] : [])])]);
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
  /** The charts behind a passage's citations, in order, each with the citation it was chosen for. */
  const chartsCited = (markdown: string) => citedFactTargets(markdown).flatMap(({ id, section: observation }) => {
    const fact = topic.facts.find(f => f.id === id);
    // A citation can also name a chart outright, `#fact-<fact>/chart-<id>`, or
    // an old anchor of prose a figure now stands in for (`replaces`).
    const key = observation && (groups.get(id)?.get(observation) ?? fact?.figures?.filter(isComponentFigure).find(f => f.replaces?.includes(observation))?.id ?? observation.match(/^chart-(.+)$/)?.[1]);
    const chart = fact && key && chartFor(topic.slug, fact, key, observation);
    return chart ? [{ chart, cited: { id, section: observation } }] : [];
  });
  const steps = sections.map(section => {
    const [heading, ...rest] = section.split('\n');
    const markdown = rest.join('\n').trim();
    const [first] = chartsCited(markdown);
    return { heading: heading.trim(), markdown, ...first, cardGraph: cardGraph(chartsCited(splitFirstParagraph(markdown)[0])) };
  });
  return { lead: lead.trim(), steps };
}

/**
 * The graph a slideshow card is made with: the first graph behind the claims
 * its reasoning line cites, so the line's claim is what the reader sees. One,
 * because a phone has room for one; a graph with several views shows them as
 * modes. A line that cites no graph makes a card of text. A table or a quote
 * is never one: it reads as more text, which the card already gives.
 */
function cardGraph(inReasoning: { chart: PreviewSlide; cited: { id: string; section: string } }[]) {
  return inReasoning.find(({ chart }) => isGraph(chart));
}

/**
 * Finds where a citation opens in its collection's data panel: an observation of
 * one of the panel's charts, or an address of the chart itself. Anything else
 * has no such place.
 */
function panelTargets(topic: Topic): (id: string, section: string) => PanelTarget | undefined {
  const addresses = new Set(headlineFacts(topic.facts).flatMap(fact => {
    const slides = factSlides(topic.slug, fact);
    const groups = observationsByChart(fact);
    return [...slides.flatMap(slide => slideGroups(fact, slide).flatMap(key => groups.get(key) ?? []).map(o => `${fact.id}--${o.id}`)), ...chartAnchors(fact, slides).flat()];
  }));
  return (id, section) => {
    const observation = `${id}--${section}`;
    return addresses.has(observation) ? { fact: id, observation } : undefined;
  };
}

/**
 * Whether a step's chart is a graph rather than a table, quote or other figure
 * set as type: a slideshow card is made with a graph, while the others read as
 * more text, which the step's prose already gives.
 */
function isGraph({ fact, chart }: PreviewSlide): boolean {
  const target = previewTarget(fact, chart);
  return !!target && isPreviewable(target);
}

/** A section's first paragraph, and the rest. */
function splitFirstParagraph(markdown: string): [string, string] {
  const [first, ...rest] = markdown.split(/\n\s*\n/);
  return [first, rest.join('\n\n')];
}

/** A step with its prose rendered, ready for a synchronous component. */
/** A slideshow card's graph, with where it opens its data. */
export type CardGraph = {
  chart: PreviewSlide;
  /** Where the graph opens its collection's data panel, when the topic page has one. */
  panel?: PanelTarget;
  /** "Explore this data", rendered as a citation so it opens the collection's report, for a graph with no panel. */
  exploreHtml: string;
};

export type RenderedStep = Omit<WalkthroughStep, 'markdown' | 'cited' | 'cardGraph'> & {
  html: string;
  /** "Explore this data", rendered as a citation so it opens the collection's report, for a chart with no panel. */
  exploreHtml?: string;
  /** Where "Explore this data" opens the chart's data panel. */
  panel?: PanelTarget;
  /** The graph a slideshow card is made with (`cardGraph`). */
  cardGraph?: CardGraph;
  /** For a slideshow card: the section's first paragraph, the step of reasoning that completes its heading, rendered without its paragraph. */
  reasoningHtml: string;
  /** For a slideshow card: the rest of the section, the evidence, rendered. */
  evidenceHtml: string;
};

export type RenderedWalkthrough = { lead: string; steps: RenderedStep[] };

/**
 * Every viewpoint's walkthrough with its prose rendered, keyed by viewpoint id.
 * Rendering happens here, once, so the components that draw it stay
 * synchronous, as the topic page's other sections are.
 */
export async function renderWalkthroughs(topic: Topic): Promise<Map<string, RenderedWalkthrough>> {
  const rendered = new Map<string, RenderedWalkthrough>();
  const panelFor = panelTargets(topic);
  for (const viewpoint of topic.viewpoints) {
    const { lead, steps } = viewpointWalkthrough(topic, viewpoint);
    rendered.set(viewpoint.id, {
      lead,
      steps: await Promise.all(steps.map(async ({ heading, markdown, chart, cited, cardGraph }) => {
        const render = (md: string) => renderMarkdown(md, topic.slug, topic.facts, { panelCitation: panelFor });
        const explore = ({ id, section }: { id: string; section: string }) => renderMarkdown(`[Explore this data](#fact-${id}/${section})`, topic.slug, topic.facts);
        const [reasoning, evidence] = splitFirstParagraph(markdown);
        return {
          heading,
          chart,
          panel: cited && panelFor(cited.id, cited.section),
          html: await render(markdown),
          exploreHtml: cited && await explore(cited),
          cardGraph: cardGraph && { chart: cardGraph.chart, panel: panelFor(cardGraph.cited.id, cardGraph.cited.section), exploreHtml: await explore(cardGraph.cited) },
          // Inline, for a card's subtitle line.
          reasoningHtml: (await render(reasoning)).replace(/^<p>|<\/p>\s*$/g, ''),
          evidenceHtml: await render(evidence),
        };
      })),
    });
  }
  return rendered;
}

/** One finding a viewpoint cites, ready to read in a pop-up beside the claim that cites it. */
export type CitedClaim = {
  /** The finding, as its observation's heading, rendered without a paragraph. */
  heading: string;
  /** Its explanation. */
  html: string;
  /** The data collection it comes from. */
  collection: string;
  /** Where its collection's data panel opens at it, when the topic page has one. */
  panel?: PanelTarget;
  /** Its place in its collection's own page. */
  href: string;
};

/**
 * Every observation the viewpoints cite, keyed by its element id
 * (`<fact>--<observation>`), for a slideshow to open in a pop-up rather than
 * sending the reader into the whole data collection. Like a data panel on a
 * topic page, it leaves out footnotes and fact links, which the collection
 * itself carries.
 */
export async function renderCitedClaims(topic: Topic): Promise<Record<string, CitedClaim>> {
  const options = { citationsAsText: true, footnotes: false };
  const panelFor = panelTargets(topic);
  const claims: Record<string, CitedClaim> = {};
  for (const { id, section } of topic.viewpoints.flatMap(v => citedFactTargets(v.body))) {
    // A citation of a whole collection names no one finding to show.
    if (!section) continue;
    const key = `${id}--${section}`;
    const fact = topic.facts.find(f => f.id === id);
    const observation = fact && [...observationsByChart(fact).values()].flat().find(o => o.id === section);
    if (key in claims || !fact || !observation) continue;
    claims[key] = {
      heading: (await renderMarkdown(observation.heading, topic.slug, topic.facts, options)).replace(/^<p>|<\/p>\s*$/g, ''),
      html: await renderMarkdown(observation.markdown, topic.slug, topic.facts, options),
      collection: fact.title ?? fact.claim,
      panel: panelFor(id, section),
      href: `${factPath(topic.slug, id)}#${key}`,
    };
  }
  return claims;
}

/** The title of a report's last slide. */
export const UNKNOWNS_LABEL = "What we don't know yet";

/** One step of a data collection: a chart with its observations rendered, ready to step through, or its last step, what the report cannot yet say. */
export type DataStep = {
  /** The step's name, under its thumbnail and in its count. */
  label: string;
  /** The chart. Only the last step has none. */
  chart?: PreviewSlide;
  /** On the last step, the measurements that would change the report. */
  unknowns?: NonNullable<Fact['dataStillNeeded']>;
  /**
   * The observations and Subtleties of this chart, in order: what to notice in it. `heading` is rendered, without a paragraph.
   * `view` is the reading each is about, on a chart with `views`.
   */
  observations: { id: string; heading: string; html: string; mark?: ObservationMark; subtlety: boolean; href: string; label: string; view?: string }[];
  /**
   * A series' readings, for its "Show as" switch, when it has more than one: each
   * observation shows the reading it is about, and a link to one of a reading's
   * `anchors` opens at its first observation.
   */
  views?: { id: string; label: string; anchors: string[] }[];
  /** What the chart shows. */
  description: string;
  /** The chart's further text (`chartMore`), rendered, for its More. */
  more: string;
  /** The element ids a citation can name this chart by, so a viewpoint's step opens on it. */
  anchors: string[];
};

/**
 * Each chart's addresses: its own, the view it was once shown alone in, its
 * Observations and Subtleties groups and each old anchor it stands in for
 * (`replaces`, `movedAnchors`), for each reading a series slide shows. As
 * `--observations` and `--subtleties`, groups about no one chart, belong to the
 * first chart, an address two slides share belongs to the first of them.
 */
function chartAnchors(fact: Fact, slides: PreviewSlide[]): string[][] {
  const taken = new Set<string>();
  return slides.map(slide => {
    const keys = slideGroups(fact, slide);
    const replaced = componentFigure(fact, slide.chart)?.replaces ?? [];
    const moved = Object.entries(fact.movedAnchors ?? {}).flatMap(([anchor, chart]) => (keys.includes(chart) ? [anchor] : []));
    const grouped = keys.flatMap(key => [`chart-${key}`, `observations-${key}`, `subtleties-${key}`]);
    const anchors = [`chart-${slide.chart}`, `chart-${slide.chart}-methodology`, `viz-${slide.chart}`, ...grouped, ...replaced, ...moved, 'observations', 'subtleties']
      .map(anchor => `${fact.id}--${anchor}`)
      .filter(anchor => !taken.has(anchor));
    anchors.forEach(anchor => taken.add(anchor));
    return [...new Set(anchors)];
  });
}

/** The addresses that name one reading of a series: its own, its groups' and any old anchor moved to it. */
function readingAnchors(fact: Fact, reading: string): string[] {
  const moved = Object.entries(fact.movedAnchors ?? {}).flatMap(([anchor, key]) => (key === reading ? [anchor] : []));
  return [`chart-${reading}`, `observations-${reading}`, `subtleties-${reading}`, ...moved].map(anchor => `${fact.id}--${anchor}`);
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
    const more = chartMore(fact);
    const slides = factSlides(topic.slug, fact);
    const anchors = chartAnchors(fact, slides);
    const charts = await Promise.all(slides.map(async (chart, i) => {
      const series = chart.chart === 'series' ? fact.series : fact.additionalSeries?.find(s => s.id === chart.chart);
      const keys = slideGroups(fact, chart);
      const figure = componentFigure(fact, chart.chart);
      const description = series?.description ?? fact.comparisons?.find(c => c.id === chart.chart)?.description ?? (figure && 'description' in figure ? figure.description : '') ?? '';
      // A view is a reading with a plot of its own, with any reading drawn alongside it.
      const plotted = series ? plottedReadings(series) : [];
      const views = series && plotted.length > 1
        ? plotted.map(r => ({ id: r.id, label: r.label, anchors: [r, alongsideOf(series, r)].flatMap(drawn => (drawn ? readingAnchors(fact, drawn.id) : [])) }))
        : undefined;
      // Each reading's observations, then its Subtleties, reading by reading, so
      // stepping through them moves through the views in order.
      const viewObservations = keys.flatMap(key => (groups.get(key) ?? []).map(o => ({ ...o, view: views && series ? plotReadingId(series, key) : undefined })));
      return {
        label: chart.label,
        chart,
        description,
        views,
        more: await renderMarkdown(keys.map(key => more.get(key) ?? '').filter(Boolean).join('\n\n'), topic.slug, topic.facts, options),
        anchors: anchors[i],
        observations: await Promise.all(viewObservations.map(async o => {
          const heading = (await renderMarkdown(o.heading, topic.slug, topic.facts, options)).replace(/^<p>|<\/p>\s*$/g, '');
          return ({
          id: `${fact.id}--${o.id}`,
          heading,
          label: heading.replace(/<[^>]+>/g, ''),
          html: await renderMarkdown(o.markdown, topic.slug, topic.facts, options),
          mark: fact.observationMarks?.[o.id],
          subtlety: o.subtlety,
          view: o.view,
          href: `${factPath(topic.slug, fact.id)}#${fact.id}--${o.id}`,
          });
        })),
      };
    }));
    const unknowns: DataStep[] = fact.dataStillNeeded?.length
      ? [{ label: UNKNOWNS_LABEL, unknowns: fact.dataStillNeeded, observations: [], description: '', more: '', anchors: [`${fact.id}--data-still-needed`] }]
      : [];
    rendered.set(fact.id, [...charts, ...unknowns]);
  }
  return rendered;
}
