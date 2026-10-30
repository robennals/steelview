import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTopic } from './load';
import { resolvePreviews } from './preview';

test('resolvePreviews returns the UK slides in authored order, each linked to its chart on the fact page', async () => {
  const slides = resolvePreviews(await loadTopic('uk-immigration'));
  assert.deepEqual(slides.map(s => `${s.fact.id}/${s.chart}`), [
    'immigration-against-the-long-run/series',
    'immigration-economy-and-public-finances/lifetime-by-route',
    'immigration-housing-and-public-services/investment',
    'settlement-and-migrant-status/series',
    'integration-outcomes/series',
  ]);
  assert.equal(slides[0].label, 'UK Migration and Population Over the Long Run');
  assert.equal(slides[0].reading, 'share-of-population');
  assert.equal(slides[0].href, '/topics/uk-immigration/facts/immigration-against-the-long-run#immigration-against-the-long-run--chart-series');
});

test('a fact without a title is labelled by its chart', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-economy-and-public-finances')!;
  const untitled = { ...topic, facts: topic.facts.map(f => (f === fact ? { ...f, title: undefined } : f)) };
  const slide = resolvePreviews(untitled)[1];
  assert.equal(slide.label, fact.comparisons!.find(c => c.id === 'lifetime-by-route')!.title);
});
