import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listTopicSlugs, loadTopic } from './load';
import { figureExamplesFact, figureExamplesTopic } from './__fixtures__/figure-examples';
import { PREVIEW_FIGURE_KINDS, factSlides, previewTarget, resolvePreviews, slideGroup } from './preview';
import { headlineFacts } from './rank-facts';
import { isComponentFigure, type Fact } from './types';
import { chartMore, factCitations, observationGroups, observationsByChart, renderDataWalkthroughs, viewpointWalkthrough } from './walkthrough';

test('resolvePreviews returns the UK slides in authored order, each linked to its chart on the fact page', async () => {
  const slides = resolvePreviews(await loadTopic('uk-immigration'));
  assert.deepEqual(slides.map(s => `${s.fact.id}/${s.chart}`), [
    'immigration-against-the-long-run/series',
    'immigration-economy-and-public-finances/lifetime-by-route',
    'immigration-housing-and-public-services/investment',
    'settlement-and-migrant-status/series',
    'integration-outcomes/series',
  ]);
  assert.equal(slides[0].label, slides[0].fact.series!.title);
  assert.equal(slides[0].reading, 'share-of-population');
  assert.equal(slides[0].href, '/topics/uk-immigration/facts/immigration-against-the-long-run#immigration-against-the-long-run--chart-series');
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
  const steps = (await renderDataWalkthroughs(topic, topic.facts)).get(topic.facts[0].id)!;
  const step = steps.find(s => s.chart.chart === 'federal-laws')!;
  assert.deepEqual(step.anchors, [
    'figure-examples--chart-federal-laws',
    'figure-examples--chart-federal-laws-methodology',
    'figure-examples--viz-federal-laws',
    'figure-examples--observations-federal-laws',
    'figure-examples--subtleties-federal-laws',
    'figure-examples--federal-laws-list',
  ]);
});

test('the readings of one series leave a shared address to the first of them', async () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const reading = (label: string, id: string) => ({ ...fact.series!.readings[0], id, label });
  const two = { ...fact, series: { ...fact.series!, readings: [reading('One', 'one'), reading('Two', 'two')] } };
  const [first, second] = (await renderDataWalkthroughs(topic, [two])).get(fact.id)!.filter(s => s.chart.chart === 'series');
  assert.ok(first.anchors.includes(`${fact.id}--chart-series`));
  assert.ok(first.anchors.includes(`${fact.id}--viz-series`));
  assert.deepEqual(second.anchors, [`${fact.id}--chart-two`, `${fact.id}--observations-two`, `${fact.id}--subtleties-two`]);
});

test('an observation keeps its footnotes on the report\'s own page, and only there', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.filter(f => f.id === 'immigration-against-the-long-run');
  const render = async (options?: { citationsAsText: boolean; footnotes: boolean }) =>
    (await renderDataWalkthroughs(topic, fact, options)).get(fact[0].id)!.flatMap(s => s.observations).map(o => o.html).join('');
  assert.doesNotMatch(await render(), /#source-/);
  assert.match(await render({ citationsAsText: false, footnotes: true }), /#source-/);
});

test('a chart\'s Subtleties step after its observations, whichever the body lists first', async () => {
  const body = [
    '## Subtleties {#report--subtleties-people}', '', '### A qualification {#report--qualification}', '', 'Why.', '',
    '## Observations {#report--observations-people}', '', '### A finding {#report--finding-one}', '', 'What.',
  ].join('\n');
  const fact = { id: 'report', body } as Fact;
  assert.deepEqual(observationsByChart(fact).get('people')?.map(o => [o.id, o.subtlety]), [['finding-one', false], ['qualification', true]]);
  assert.equal(observationGroups(fact).get('qualification'), 'people');
});

test('a chart\'s More text is filed under its chart, and an anchor moved to a chart opens it', async () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const body = `${fact.body}\n\n## More {#${fact.id}--more-federal-laws}\n\nWhat is counted. [1](#source-${fact.id}-1)`;
  const steps = (await renderDataWalkthroughs(topic, [{ ...fact, body, movedAnchors: { 'old-section': 'federal-laws' } }], { citationsAsText: false, footnotes: true })).get(fact.id)!;
  const step = steps.find(s => s.chart.chart === 'federal-laws')!;
  assert.match(step.more, /What is counted\./);
  assert.ok(step.anchors.includes(`${fact.id}--old-section`));
  assert.equal(chartMore({ body }).size, 1);
});

test('a chart\'s sources are what it draws and what its text cites, and the first chart takes the claim\'s', () => {
  const topic = figureExamplesTopic();
  const fact = topic.facts[0];
  const slides = factSlides(topic.slug, fact);
  const last = slides.at(-1)!;
  const key = slideGroup(fact, last);
  const body = `## Subtleties {#${fact.id}--subtleties-${key}}\n\n### A catch {#${fact.id}--catch}\n\nWhy. [1](#source-${fact.id}-1)\n\n## More {#${fact.id}--more-${key}}\n\nMore. [2](#source-${fact.id}-2)`;
  const cited = factCitations({ ...fact, body, claimSources: [2] }, slides);
  assert.ok(cited.at(-1)!.includes(1) && cited.at(-1)!.includes(2));
  assert.ok(cited[0].includes(2));
  assert.equal(new Set(cited.at(-1)).size, cited.at(-1)!.length);
});

test('an observation\'s heading is rendered, not shown as markdown', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.filter(f => f.id === 'asylum-law-and-the-echr');
  const headings = (await renderDataWalkthroughs(topic, fact)).get(fact[0].id)!.flatMap(s => s.observations).map(o => o.heading);
  assert.ok(headings.includes('The international reading is still <em>Adimi</em>\'s'), headings.join('\n'));
});

test('every headline data collection has something to walk through', async () => {
  for (const slug of await listTopicSlugs()) {
    const topic = await loadTopic(slug);
    for (const fact of headlineFacts(topic.facts)) {
      assert.ok(factSlides(slug, fact).length > 0, `${slug}/${fact.id} has no charts`);
    }
  }
});

test('resolvePreviews resolves figure ids to the figure, its title and its DOM id on the fact page', () => {
  const topic = figureExamplesTopic();
  topic.previewCharts = [{ fact: 'figure-examples', chart: 'wa-by-race' }, { fact: 'figure-examples', chart: 'postal-voting' }, { fact: 'figure-examples', chart: 'series' }];
  const slides = resolvePreviews(topic);
  assert.deepEqual(slides.map(s => s.label), [
    'Mail ballots rejected in Washington, by race, 2020',
    'Who may vote by post from inside the country, 2025',
    topic.facts[0].series!.title,
  ]);
  assert.equal(slides[0].href, '/topics/figure-examples/facts/figure-examples#figure-examples--chart-wa-by-race');
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
