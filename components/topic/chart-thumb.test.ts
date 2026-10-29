import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTopic } from '@/lib/content/load';
import { ChartThumb } from './chart-thumb';

test('a series thumbnail draws its first reading as decorative lines, with no text', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-against-the-long-run')!;
  const html = renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'series' }));
  assert.match(html, /^<svg[^>]*aria-hidden="true"/);
  assert.equal(html.match(/<path /g)?.length !== undefined, true);
  assert.doesNotMatch(html, /<text/);
});

test('a comparison thumbnail draws one column per item, marking the highlighted one', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'asylum-claims-in-historical-and-european-context')!;
  const chart = fact.comparisons!.find(c => c.id === 'asylum-per-person')!;
  const html = renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'asylum-per-person' }));
  assert.match(html, /aria-hidden="true"/);
  assert.equal(html.match(/class="sv-thumb__column"/g)?.length, chart.items.length);
  assert.equal(html.match(/data-highlight="true"/g)?.length, 1);
});
