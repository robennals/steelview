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
  assert.equal(slides[0].label, slides[0].fact.series!.title);
  assert.equal(slides[0].reading, 'share-of-population');
  assert.equal(slides[0].href, '/topics/uk-immigration/facts/immigration-against-the-long-run#immigration-against-the-long-run--chart-series');
});

test('two charts from one fact get distinct labels', async () => {
  const slides = resolvePreviews(await loadTopic('uk-asylum'));
  assert.equal(new Set(slides.map(s => s.label)).size, slides.length);
});
