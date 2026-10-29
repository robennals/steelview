import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listTopicSlugs, loadTopic } from './load';
import { figureExamplesFact, figureExamplesTopic } from './__fixtures__/figure-examples';
import { PREVIEW_FIGURE_KINDS, factSlides, previewTarget, resolvePreviews } from './preview';
import { headlineFacts } from './rank-facts';
import { isComponentFigure } from './types';
import { renderDataWalkthroughs, viewpointWalkthrough } from './walkthrough';

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
  assert.deepEqual(step.anchors, ['figure-examples--chart-federal-laws', 'figure-examples--federal-laws-list']);
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
