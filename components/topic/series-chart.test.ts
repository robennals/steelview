import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTopic } from '@/lib/content/load';
import { SeriesChart } from './series-chart';

// Depends on authored us-voter-id content: the fact
// `voter-id-rules-in-the-us-and-abroad` carries the NCSL ID-law series whose
// period label is "Year of NCSL count".
test('the axis caption keeps an acronym in the period label', async () => {
  const topic = await loadTopic('us-voter-id');
  const fact = topic.facts.find(f => f.id === 'voter-id-rules-in-the-us-and-abroad');
  assert.ok(fact?.series, 'expected the ID-law series');
  const html = renderToStaticMarkup(createElement(SeriesChart, { factId: fact.id, series: fact.series }));
  assert.match(html, /<p class="sv-chart__axis-label">[^<]*, by year of NCSL count<\/p>/);
});
