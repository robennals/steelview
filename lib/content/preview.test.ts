import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listTopicSlugs, loadTopic } from './load';
import { citedFactTargets } from './markdown';
import { figureExamplesFact, figureExamplesTopic } from './__fixtures__/figure-examples';
import { PREVIEW_FIGURE_KINDS, factSlides, previewTarget, reportChartPath, resolvePreviews, slideGroups } from './preview';
import { isComponentFigure } from './types';
import { chartMore, chartSteps, citedSources, observationGroups, observationsByChart, renderFeaturedCharts, renderWalkthroughs, repeatedCardVisualErrors, cardParagraphErrors, slideCitations, viewpointWalkthrough } from './walkthrough';

test('resolvePreviews returns the UK slides in authored order, each linked to its chart on the topic page', async () => {
  const slides = resolvePreviews(await loadTopic('uk-immigration'));
  assert.deepEqual(slides.map(s => `${s.fact.id}/${s.chart}`), [
    'immigration-against-the-long-run/series',
    'immigration-economy-and-public-finances/lifetime-by-route',
    'immigration-housing-and-public-services/investment',
    'settlement-and-migrant-status/settlement-forecast',
    'integration-outcomes/series',
  ]);
  assert.equal(slides[0].label, slides[0].fact.series!.title);
  assert.equal(slides[0].reading, 'share-of-population');
  assert.equal(slides[0].href, '/topics/uk-immigration#immigration-against-the-long-run--chart-series');
});

test('a home-page slide leads to its chart on the topic page, at an address its full version answers to', async () => {
  const topic = await loadTopic('uk-immigration');
  const [slide] = resolvePreviews(topic);
  const path = reportChartPath(topic.slug, slide);
  // The slide names a reading, so the address is that reading's, not the series' first.
  assert.equal(path, '/topics/uk-immigration#immigration-against-the-long-run--chart-share-of-population');
  const steps = (await renderFeaturedCharts(topic)).get(slide.fact.id)!;
  assert.ok(steps.some(step => step.anchors.includes(path.split('#')[1])));
});

test('two charts from one fact get distinct labels', async () => {
  const slides = resolvePreviews(await loadTopic('uk-asylum'));
  assert.equal(new Set(slides.map(s => s.label)).size, slides.length);
});

test('a collection of laws walks through its tables, in the order its page shows them', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-law-and-the-echr')!;
  assert.deepEqual(factSlides('uk-asylum', fact).map(s => s.chart), fact.figures!.filter(isComponentFigure).map(f => f.id));
});

test('a citation of a chart by name picks that chart for its step', async () => {
  const topic = await loadTopic('uk-asylum');
  const viewpoint = topic.viewpoints.find(v => v.id === 'tighten-within-the-echr')!;
  const charts = viewpointWalkthrough(topic, { ...viewpoint, body: '### A step\n\n[The Bill](#fact-asylum-law-and-the-echr/chart-immigration-and-asylum-bill)' }).steps.map(s => s.chart?.chart);
  assert.deepEqual(charts, ['immigration-and-asylum-bill']);
});

test('a citation of an anchor a figure replaced picks that figure for its step', () => {
  const topic = figureExamplesTopic();
  const viewpoint = { ...topic.viewpoints[0], body: '### A step\n\n[The laws](#fact-figure-examples/federal-laws-list)' };
  assert.deepEqual(viewpointWalkthrough(topic, viewpoint).steps.map(s => s.chart?.chart), ['federal-laws']);
});

test('a citation of a chart a figure replaced picks that figure, not the chart it no longer is', () => {
  const topic = figureExamplesTopic();
  const table = topic.facts[0].figures!.filter(isComponentFigure).find(f => f.id === 'federal-laws')!;
  table.replaces = ['chart-old-laws'];
  const viewpoint = { ...topic.viewpoints[0], body: '### A step\n\n[The laws](#fact-figure-examples/chart-old-laws)' };
  assert.deepEqual(viewpointWalkthrough(topic, viewpoint).steps.map(s => s.chart?.chart), ['federal-laws']);
});

test('a data step answers to its chart\'s address and to each anchor its figure replaced, so a viewpoint opens on it', async () => {
  const topic = figureExamplesTopic();
  const steps = await chartSteps(topic, topic.facts[0], factSlides(topic.slug, topic.facts[0]));
  const step = steps.find(s => s.chart?.chart === 'federal-laws')!;
  assert.deepEqual(step.anchors, [
    'figure-examples--chart-federal-laws',
    'figure-examples--chart-federal-laws-methodology',
    'figure-examples--viz-federal-laws',
    'figure-examples--observations-federal-laws',
    'figure-examples--subtleties-federal-laws',
    'figure-examples--federal-laws-list',
  ]);
});

test('a series with several readings is one slide, which every reading\'s addresses open', async () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const reading = (label: string, id: string) => ({ ...fact.series!.readings[0], id, label });
  const two = { ...fact, series: { ...fact.series!, readings: [reading('One', 'one'), reading('Two', 'two')] }, movedAnchors: { 'chart-old': 'two' } };
  const steps = (await chartSteps(topic, two, factSlides(topic.slug, two))).filter(s => s.chart.chart === 'series');
  assert.equal(steps.length, 1);
  const [step] = steps;
  // Each view knows its own addresses, an old one moved to it included, so a link to one opens that view.
  const address = (...anchors: string[]) => anchors.map(anchor => `${fact.id}--${anchor}`);
  assert.deepEqual(step.views, [
    { id: 'one', label: 'One', anchors: address('chart-one', 'observations-one', 'subtleties-one') },
    { id: 'two', label: 'Two', anchors: address('chart-two', 'observations-two', 'subtleties-two', 'chart-old') },
  ]);
  for (const anchor of ['chart-series', 'viz-series', 'chart-one', 'chart-two', 'observations-two', 'subtleties-two']) {
    assert.ok(step.anchors.includes(`${fact.id}--${anchor}`), anchor);
  }
});

test('each observation on a series with several readings names the reading it is about, in reading order', async () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const reading = (label: string, id: string) => ({ ...fact.series!.readings[0], id, label });
  const body = [
    '## Observations {#report--observations-two}', '', '### About two {#report--about-two}', '', 'Two.', '',
    '## Observations {#report--observations-one}', '', '### About one {#report--about-one}', '', 'One.',
  ].join('\n');
  const two = { ...fact, id: 'report', body, figures: undefined, series: { ...fact.series!, readings: [reading('One', 'one'), reading('Two', 'two')] } };
  const [step] = await chartSteps(topic, two, factSlides(topic.slug, two));
  assert.deepEqual(step.observations.map(o => [o.id, o.view]), [['report--about-one', 'one'], ['report--about-two', 'two']]);
});

test('an observation read beside its chart leaves out its footnotes, which the chart\'s sources row carries', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-against-the-long-run')!;
  const html = (await chartSteps(topic, fact, factSlides(topic.slug, fact))).flatMap(s => s.observations).map(o => o.html).join('');
  assert.ok(html.length > 0);
  assert.doesNotMatch(html, /#source-/);
});

test('a chart\'s Subtleties step after its observations, whichever the body lists first', async () => {
  const body = [
    '## Subtleties {#report--subtleties-people}', '', '### A qualification {#report--qualification}', '', 'Why.', '',
    '## Observations {#report--observations-people}', '', '### A finding {#report--finding-one}', '', 'What.',
  ].join('\n');
  const fact = { ...figureExamplesFact(), id: 'report', body };
  assert.deepEqual(observationsByChart(fact).get('people')?.map(o => [o.id, o.subtlety]), [['finding-one', false], ['qualification', true]]);
  assert.equal(observationGroups(fact).get('qualification'), 'people');
});

test('a chart\'s More text is filed under its chart, and an anchor moved to a chart opens it', async () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const body = `${fact.body}\n\n## More {#${fact.id}--more-federal-laws}\n\nWhat is counted. [1](#source-${fact.id}-1)`;
  const moved = { ...fact, body, movedAnchors: { 'old-section': 'federal-laws' } };
  const steps = await chartSteps(topic, moved, factSlides(topic.slug, moved));
  const step = steps.find(s => s.chart?.chart === 'federal-laws')!;
  assert.match(step.more, /What is counted\./);
  assert.ok(step.anchors.includes(`${fact.id}--old-section`));
  assert.equal(chartMore({ body }).size, 1);
});

test('a chart\'s sources are what it draws and what its text cites', () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const slides = factSlides(topic.slug, fact);
  const last = slides.at(-1)!;
  const [key] = slideGroups(fact, last);
  const body = `## Subtleties {#${fact.id}--subtleties-${key}}\n\n### A catch {#${fact.id}--catch}\n\nWhy. [1](#source-${fact.id}-1)\n\n## More {#${fact.id}--more-${key}}\n\nMore. [2](#source-${fact.id}-2)`;
  const cited = slideCitations({ ...fact, body }, last);
  assert.ok(cited.includes(1) && cited.includes(2));
  assert.equal(new Set(cited).size, cited.length);
});

test('an observation\'s heading is rendered, not shown as markdown', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-law-and-the-echr')!;
  const headings = (await chartSteps(topic, fact, factSlides(topic.slug, fact))).flatMap(s => s.observations).map(o => o.heading);
  assert.ok(headings.includes('The international reading is still <em>Adimi</em>\'s'), headings.join('\n'));
});

test('every card\'s graph opens in full over its topic page, at the finding its line cites', async () => {
  for (const slug of await listTopicSlugs()) {
    const topic = await loadTopic(slug);
    const featured = await renderFeaturedCharts(topic);
    for (const [viewpoint, { steps }] of await renderWalkthroughs(topic)) {
      for (const { heading, cardVisual } of steps) {
        if (!cardVisual) continue;
        const { fact, observation } = cardVisual.panel;
        const addresses = (featured.get(fact) ?? []).flatMap(step => [...step.anchors, ...step.observations.map(o => o.id), ...(step.views ?? []).flatMap(v => v.anchors)]);
        assert.ok(addresses.includes(observation), `${slug}/${viewpoint}: "${heading}" opens ${observation}, which no featured chart answers to`);
      }
    }
  }
});

test('a card\'s claims carry footnote markers, not links, and its graph opens in full at the finding its line cites', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-housing-and-public-services')!;
  const [first, second] = [...observationGroups(fact)].filter(([, key], i, all) => all.findIndex(([, k]) => k === key) === i);
  const viewpoint = topic.viewpoints[0];
  const body = `### A step\n\n[This](#fact-${fact.id}/${first[0]}) and [that](#fact-${fact.id}/${second[0]}).\n\n[More evidence](#fact-${fact.id}/${second[0]}).`;
  const [step] = (await renderWalkthroughs({ ...topic, viewpoints: [{ ...viewpoint, body }] })).get(viewpoint.id)!.steps;
  // One number per finding across the card: the evidence's citation of the second is marked 2 again.
  assert.match(step.reasoningHtml, /^This<a [^>]*data-sources="[^"]+"[^>]*>1<\/a> and that<a [^>]*>2<\/a>\.$/);
  assert.match(step.evidenceHtml, /^<p>More evidence<a [^>]*data-sources="[^"]+"[^>]*>2<\/a>\.<\/p>$/);
  assert.doesNotMatch(step.reasoningHtml + step.evidenceHtml, /sv-cite/);
  assert.deepEqual(step.cardVisual?.panel, { fact: fact.id, observation: `${fact.id}--${first[0]}` });
});

test('resolvePreviews resolves figure ids to the figure, its title and its DOM id on the topic page', () => {
  const topic = figureExamplesTopic();
  topic.previewCharts = [{ fact: 'figure-examples', chart: 'wa-by-race' }, { fact: 'figure-examples', chart: 'postal-voting' }, { fact: 'figure-examples', chart: 'series' }];
  const slides = resolvePreviews(topic);
  assert.deepEqual(slides.map(s => s.label), [
    'Mail ballots rejected in Washington, by race, 2020',
    'Who may vote by post from inside the country, 2025',
    topic.facts[0].series!.title,
  ]);
  assert.equal(slides[0].href, '/topics/figure-examples#figure-examples--chart-wa-by-race');
});

test('resolvePreviews drops a text figure, which the validator reports', () => {
  const topic = figureExamplesTopic();
  topic.previewCharts = [{ fact: 'figure-examples', chart: 'federal-laws' }, { fact: 'figure-examples', chart: 'senate-votes' }];
  assert.deepEqual(resolvePreviews(topic).map(s => s.chart), ['senate-votes']);
});

test('previewTarget finds the series, comparisons and component figures, and nothing else', () => {
  const fact = figureExamplesFact();
  assert.equal(previewTarget(fact, 'series')?.kind, 'series');
  assert.equal(previewTarget(fact, 'senate-votes')?.kind, 'comparison');
  assert.equal(previewTarget(fact, 'court-record')?.kind, 'figure');
  assert.equal(previewTarget(fact, 'freedom-to-vote-act-provisions'), undefined);
  assert.equal(previewTarget(fact, 'nope'), undefined);
});

test('every previewable kind has an example in the figure fixture', () => {
  const kinds = new Set(figureExamplesFact().figures!.map(f => f.kind));
  for (const kind of PREVIEW_FIGURE_KINDS) assert.ok(kinds.has(kind), kind);
});

test('a slideshow viewpoint may not show one graph on two cards', async () => {
  const topic = await loadTopic('uk-asylum');
  assert.deepEqual(repeatedCardVisualErrors(topic), [], 'the published viewpoints show each graph once');
  const cite = '[The queue has moved to appeals](#fact-asylum-backlog-accommodation-and-cost/queue-moved-to-appeals).';
  const viewpoint = { ...topic.viewpoints[0], body: `Lead.\n\n### First point\n\n${cite}\n\n### Second point\n\n${cite}\n` };
  const errors = repeatedCardVisualErrors({ ...topic, viewpoints: [viewpoint] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /"Second point" shows the same evidence as "First point"/);
});

test('a card made with a graph is one paragraph; a card of text may have more', async () => {
  const topic = await loadTopic('uk-asylum');
  const graph = '[The queue has moved to appeals](#fact-asylum-backlog-accommodation-and-cost/queue-moved-to-appeals).';
  const viewpoint = { ...topic.viewpoints[0], body: `Lead.\n\n### With a graph\n\n${graph}\n\nA second paragraph.\n\n### Of text\n\nA value.\n\nAnother paragraph.\n` };
  const errors = cardParagraphErrors({ ...topic, viewpoints: [viewpoint] });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /"With a graph" is made with a graph or quotes, so its point is one paragraph/);
  assert.deepEqual(cardParagraphErrors({ ...topic, viewpoints: [{ ...viewpoint, body: `Lead.\n\n### With a graph\n\n${graph}\n` }] }), []);
});

test('a card whose line cites two findings about one timeline picks out the events of both', async () => {
  const topic = await loadTopic('us-iran-war');
  const viewpoint = topic.viewpoints.find(v => v.id === 'nuclear')!;
  const step = viewpointWalkthrough(topic, viewpoint).steps.find(s => s.heading.startsWith('Iran already attacks'))!;
  assert.equal(step.cardVisual?.chart.chart, 'court-record');
  assert.deepEqual(step.cardVisual?.picked, [
    '1992 Israeli Embassy bombing (29 dead) and 1994 AMIA bombing (85 dead), Buenos Aires',
    'Plot to kill journalist Masih Alinejad in New York',
    'Second plot against Alinejad, organised by Farhad Shakeri',
  ]);
});

test('a cited finding\'s sources are those its text footnotes, as quoted, else its chart\'s', async () => {
  const topic = await loadTopic('uk-asylum');
  const sources = citedSources(topic);
  // Every claim the viewpoints cite has a source behind it.
  for (const { id, section } of topic.viewpoints.flatMap(v => citedFactTargets(v.body))) {
    assert.ok(sources[`${id}--${section}`]?.length, `${id}/${section}`);
  }
  const fact = topic.facts.find(f => f.id === 'removals-and-what-stops-them')!;
  const [quoted] = sources['removals-and-what-stops-them--fewer-refused-recorded-leaving'];
  // The quote is the source's own, whole: its runs join back into it.
  assert.ok(fact.sources.some(source => source.quote === quoted.quote.map(part => part.text).join('') && source.url === quoted.url));
  assert.deepEqual(Object.keys(quoted).sort(), ['date', 'publisher', 'quote', 'title', 'url']);
});
