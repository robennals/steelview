import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTopic } from '@/lib/content/load';
import { ChartThumb } from './chart-thumb';
import { SlideChart } from './slide-chart';

test('a series thumbnail draws its first reading as decorative lines, with no text', async () => {
  const topic = await loadTopic('uk-immigration');
  const fact = topic.facts.find(f => f.id === 'immigration-against-the-long-run')!;
  const html = renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'series' }));
  assert.match(html, /^<svg[^>]*aria-hidden="true"/);
  assert.equal(html.match(/<path /g)?.length !== undefined, true);
  assert.doesNotMatch(html, /<text/);
});

test('a comparison thumbnail draws one column per item, marking the highlighted one', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-claims-and-decisions')!;
  const chart = fact.comparisons!.find(c => c.id === 'per-head-2025')!;
  const html = renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'per-head-2025' }));
  assert.match(html, /aria-hidden="true"/);
  assert.equal(html.match(/class="sv-thumb__column"/g)?.length, chart.items.length);
  assert.equal(html.match(/data-highlight="true"/g)?.length, 1);
});

test('a library figure thumbnail draws plain rows, and an unknown chart draws nothing', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-law-and-the-echr')!;
  assert.equal(renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'article-31' })).match(/class="sv-thumb__column"/g)?.length, 4);
  assert.equal(renderToStaticMarkup(createElement(ChartThumb, { fact, chart: 'no-such-chart' })), '');
});

test('a walkthrough slide draws a library figure only when given its page', async () => {
  const topic = await loadTopic('uk-asylum');
  const fact = topic.facts.find(f => f.id === 'asylum-law-and-the-echr')!;
  const slide = { fact, chart: 'article-31', label: 'Article 31', href: '/x' };
  const page = { slug: 'uk-asylum', asOf: topic.lastUpdated, facts: topic.facts };
  assert.match(renderToStaticMarkup(createElement(SlideChart, { slide, page })), /sv-slide__figure[\s\S]*sv-cards__list/);
  assert.equal(renderToStaticMarkup(createElement(SlideChart, { slide })), '');
});
