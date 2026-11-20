import { citedFactTargets, renderMarkdown, type PanelTarget } from './markdown';
import { alongsideOf, plotReadingId, plottedReadings } from '@/lib/chart/series-chart';
import { chartCitations, factSources, footnotesIn } from './sources';
import { componentFigure, figureLabel, isComponentFigure, topicPath } from './types';
import type { Fact, ObservationMark, Source, Topic, Viewpoint } from './types';
import { factSlides, isPreviewable, previewTarget, slideGroups, type PreviewSlide } from './preview';
import { highlightQuote, type QuotePart } from './quote-highlight';

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
  /**
   * The graph or quotes a slideshow card is made with (`cardVisual`), with the
   * citation it was chosen for and the rows (`observationMarks`) that every
   * citation of it in the card's line picks out.
   */
  cardVisual?: { chart: PreviewSlide; cited: { id: string; section: string }; picked: string[] };
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
  const href = `${topicPath(slug)}#${fact.id}--${observation}`;
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
 * The chart a citation of `section` on `fact` is about: the chart beside the
 * observation it names, or a chart it names outright, `chart-<id>`, or by an
 * old anchor of prose a figure now stands in for (`replaces`). `groups` is the
 * fact's `observationGroups`.
 */
function citedChart(slug: string, fact: Fact, groups: Map<string, string>, section: string): PreviewSlide | undefined {
  const key = groups.get(section) ?? fact.figures?.filter(isComponentFigure).find(f => f.replaces?.includes(section))?.id ?? section.match(/^chart-(.+)$/)?.[1];
  return key ? chartFor(slug, fact, key, section) : undefined;
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
    const chart = fact && observation && citedChart(topic.slug, fact, groups.get(id) ?? new Map(), observation);
    return chart ? [{ chart, cited: { id, section: observation } }] : [];
  });
  const steps = sections.map(section => {
    const [heading, ...rest] = section.split('\n');
    const markdown = rest.join('\n').trim();
    const [first] = chartsCited(markdown);
    return { heading: heading.trim(), markdown, ...first, cardVisual: cardVisual(chartsCited(splitFirstParagraph(markdown)[0])) };
  });
  return { lead: lead.trim(), steps };
}

/**
 * What a slideshow card is made with: the first graph or collection of quotes
 * behind the claims its reasoning line cites, so the line's claim is what the
 * reader sees. One, because a phone has room for one; a graph with several
 * views shows them as modes, and a collection of quotes one quote at a time. A
 * line that cites neither makes a card of text. A table is never one: it reads
 * as more text, which the card already gives.
 */
function cardVisual(inReasoning: { chart: PreviewSlide; cited: { id: string; section: string } }[]) {
  const first = inReasoning.find(({ chart }) => isGraph(chart) || componentFigure(chart.fact, chart.chart)?.kind === 'quotes');
  if (!first) return undefined;
  // A line can cite two findings about one chart, as two cases on one timeline.
  const marks = first.chart.fact.observationMarks;
  const sameChart = inReasoning.filter(({ chart }) => chart.fact.id === first.chart.fact.id && chart.chart === first.chart.chart);
  return { ...first, picked: [...new Set(sameChart.flatMap(({ cited }) => marks?.[cited.section]?.rows ?? []))] };
}

/**
 * The charts the topic page shows: each one a viewpoint's card is made with,
 * keyed by its collection, in the order the collection lists them. A card
 * shows a series at one reading; its full version, opened over the page, is
 * the whole series, with every reading it can be shown as. Every other chart a
 * collection holds stays in the content, off the page.
 */
export function featuredSlides(topic: Topic): Map<string, PreviewSlide[]> {
  const featured = new Set(topic.viewpoints.flatMap(viewpoint => viewpointWalkthrough(topic, viewpoint).steps.flatMap(({ cardVisual }) => (cardVisual ? [`${cardVisual.chart.fact.id}:${cardVisual.chart.chart}`] : []))));
  const slides = new Map<string, PreviewSlide[]>();
  for (const fact of topic.facts) {
    const shown = factSlides(topic.slug, fact).filter(slide => featured.has(`${fact.id}:${slide.chart}`));
    if (shown.length > 0) slides.set(fact.id, shown);
  }
  return slides;
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

/**
 * M4 — each card of a slideshow viewpoint makes its own point with its own
 * graph or quotes. One shown on two cards puts the same evidence in front of
 * the reader twice as if it were new; two points that need it are one point.
 */
export function repeatedCardVisualErrors(topic: Topic): string[] {
  return topic.viewpoints.flatMap(viewpoint => {
    const shown = new Map<string, string>();
    return viewpointWalkthrough(topic, viewpoint).steps.flatMap(({ heading, cardVisual }) => {
      if (!cardVisual) return [];
      const { fact, chart, reading, label } = cardVisual.chart;
      const key = `${fact.id}:${chart}:${reading ?? ''}`;
      const first = shown.get(key);
      if (!first) {
        shown.set(key, heading);
        return [];
      }
      return [`viewpoint ${viewpoint.id}: "${heading}" shows the same evidence as "${first}" (${label}); make them one point, or cite another graph first`];
    });
  });
}

/**
 * M5 — a card made with a graph or quotes is its heading, one paragraph and
 * that visual: the argument is what the reader sees, with nothing behind a
 * "More". Whatever else the step needs goes into the paragraph or goes.
 */
export function cardParagraphErrors(topic: Topic): string[] {
  return topic.viewpoints.flatMap(viewpoint => viewpointWalkthrough(topic, viewpoint).steps.flatMap(({ heading, markdown, cardVisual }) => {
    if (!cardVisual || !splitFirstParagraph(markdown)[1].trim()) return [];
    return [`viewpoint ${viewpoint.id}: "${heading}" is made with a graph or quotes, so its point is one paragraph — fold what the reader needs into it and drop the rest`];
  }));
}

/** A slideshow card's graph or quotes, with where it opens in full. */
export type CardVisual = {
  chart: PreviewSlide;
  /** The rows the card's line picks out on it: a timeline's thumbnail gives them its cards, as the card does. */
  picked: string[];
  /** Where the graph opens in full: at the finding the card's line cites, which `featuredSlides` puts on the page. */
  panel: PanelTarget;
};

/**
 * A source as a reader sees it behind a claim's footnote marker: its own words,
 * with the passages the finding rests on picked out, and where they come from.
 */
export type QuotedSource = Pick<Source, 'title' | 'url' | 'publisher' | 'date'> & { quote: QuotePart[] };

/**
 * The sources behind each finding the viewpoints cite, keyed `<fact>--<section>`:
 * those the finding's own text footnotes, or failing that those of the chart it
 * is about. A citation with neither has no entry, and its claim no marker.
 */
export function citedSources(topic: Topic): Record<string, QuotedSource[]> {
  const sources: Record<string, QuotedSource[]> = {};
  for (const { id, section } of topic.viewpoints.flatMap(v => citedFactTargets(v.body))) {
    const fact = topic.facts.find(f => f.id === id);
    const key = `${id}--${section}`;
    if (!fact || !section || key in sources) continue;
    const observation = [...observationsByChart(fact).values()].flat().find(o => o.id === section);
    const chart = citedChart(topic.slug, fact, observationGroups(fact), section);
    const finding = observation ? `${observation.heading}\n${observation.markdown}` : chart?.label ?? '';
    const footnoted = footnotesIn(finding, fact.id);
    const numbers = footnoted.length > 0 ? footnoted : chart ? slideCitations(fact, chart) : [];
    const all = factSources(fact);
    // The finding's words, without its links' targets, to find the passages it rests on.
    const said = finding.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    const quoted = [...new Set(numbers)].flatMap(n => (all[n - 1] ? [all[n - 1]] : [])).map(({ quote, title, url, publisher, date }) => ({ quote: highlightQuote(quote, said), title, url, publisher, date }));
    if (quoted.length > 0) sources[key] = quoted;
  }
  return sources;
}

/**
 * A slideshow card with its prose rendered, ready for a synchronous component.
 * A claim's citation renders as its text and a footnote marker, which opens the
 * quotes from its sources (`citedSources`): the card's words and its graph make
 * the point, and nothing of our own sits behind them.
 */
export type RenderedStep = {
  heading: string;
  /** The graph or quotes the card is made with (`cardVisual`). */
  cardVisual?: CardVisual;
  /** The section's first paragraph, the step of reasoning that completes its heading, rendered without its paragraph. */
  reasoningHtml: string;
  /** The rest of the section, the evidence, rendered. */
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
  const sources = citedSources(topic);
  for (const viewpoint of topic.viewpoints) {
    const { lead, steps } = viewpointWalkthrough(topic, viewpoint);
    rendered.set(viewpoint.id, {
      lead,
      steps: await Promise.all(steps.map(async ({ heading, markdown, cardVisual }) => {
        // A card numbers its markers from 1, a finding cited twice keeping its number.
        const numbers = new Map<string, number>();
        const citationMarker = (id: string, section?: string) => {
          const key = `${id}--${section}`;
          if (!(key in sources)) return undefined;
          if (!numbers.has(key)) numbers.set(key, numbers.size + 1);
          return { key, label: String(numbers.get(key)) };
        };
        const render = (md: string) => renderMarkdown(md, topic.slug, { citationMarker });
        const [reasoning, evidence] = splitFirstParagraph(markdown);
        return {
          heading,
          cardVisual: cardVisual && { chart: cardVisual.chart, picked: cardVisual.picked, panel: { fact: cardVisual.cited.id, observation: `${cardVisual.cited.id}--${cardVisual.cited.section}` } },
          // Inline, for a card's subtitle line.
          reasoningHtml: (await render(reasoning)).replace(/^<p>|<\/p>\s*$/g, ''),
          evidenceHtml: await render(evidence),
        };
      })),
    });
  }
  return rendered;
}

/** One featured chart with its observations rendered, ready to open over the page. */
export type DataStep = {
  /** The chart's title, which becomes its sheet's. */
  label: string;
  chart: PreviewSlide;
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
  /** The element ids a citation can name this chart by, so it opens on it. */
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
 * Each featured chart (`featuredSlides`), keyed by its collection, with the
 * observations made about it (`chartSteps`).
 */
export async function renderFeaturedCharts(topic: Topic): Promise<Map<string, DataStep[]>> {
  const rendered = new Map<string, DataStep[]>();
  for (const [id, slides] of featuredSlides(topic)) {
    const fact = topic.facts.find(f => f.id === id);
    if (fact) rendered.set(id, await chartSteps(topic, fact, slides));
  }
  return rendered;
}

/**
 * Charts of one collection, each with the observations made about it. They are
 * read away from their collection, so they leave out source footnotes and fact
 * links: the chart's own row of sources carries what they cite.
 */
export async function chartSteps(topic: Topic, fact: Fact, slides: PreviewSlide[]): Promise<DataStep[]> {
  const options = { footnotes: false };
  const groups = observationsByChart(fact);
  const more = chartMore(fact);
  const anchors = chartAnchors(fact, slides);
  return Promise.all(slides.map(async (chart, i) => {
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
      more: await renderMarkdown(keys.map(key => more.get(key) ?? '').filter(Boolean).join('\n\n'), topic.slug, options),
      anchors: anchors[i],
      observations: await Promise.all(viewObservations.map(async o => {
        const heading = (await renderMarkdown(o.heading, topic.slug, options)).replace(/^<p>|<\/p>\s*$/g, '');
        return {
          id: `${fact.id}--${o.id}`,
          heading,
          label: heading.replace(/<[^>]+>/g, ''),
          html: await renderMarkdown(o.markdown, topic.slug, options),
          mark: fact.observationMarks?.[o.id],
          subtlety: o.subtlety,
          view: o.view,
          href: `${topicPath(topic.slug)}#${fact.id}--${o.id}`,
        };
      })),
    };
  }));
}
