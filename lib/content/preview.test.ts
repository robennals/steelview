import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listTopicSlugs, loadTopic } from './load';
import { factSlides, resolvePreviews } from './preview';
import { headlineFacts } from './rank-facts';
import { isComponentFigure } from './types';
import { viewpointWalkthrough } from './walkthrough';

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

test('every headline data collection has something to walk through', async () => {
  for (const slug of await listTopicSlugs()) {
    const topic = await loadTopic(slug);
    for (const fact of headlineFacts(topic.facts)) {
      assert.ok(factSlides(slug, fact).length > 0, `${slug}/${fact.id} has no charts`);
    }
  }
});
