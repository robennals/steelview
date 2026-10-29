import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Fact } from '@/lib/content/types';
import { ComparisonChart } from './comparison-chart';

type Comparison = NonNullable<Fact['comparisons']>[number];

const source = {
  stance: 'supports' as const,
  quote: 'q',
  title: 't',
  url: 'https://example.org/cases',
  publisher: 'Example publisher',
  date: '2024',
};

const fact: Fact = { id: 'cases', claim: 'Claim.', status: 'well-supported', sources: [source], body: 'Body.' };

const chart: Comparison = {
  id: 'methods',
  title: 'Cases by method',
  description: 'Each method, split by whether an ID check would reach it.',
  unit: 'count',
  valueLabel: 'Cases',
  sources: [1],
  groupLabel: 'whether an ID check would reach it',
  groups: ['Would reach it', 'Would not'],
  items: [
    { label: 'Impersonation', value: 10, values: [10, 0] },
    { label: 'Absentee fraud', value: 30, values: [0, 30] },
  ],
};

const render = (c: Comparison) => renderToStaticMarkup(createElement(ComparisonChart, { fact, chart: c, sources: [source] }));

test('the breakdown table heads its item column with itemLabel, never "Country"', () => {
  const html = render({ ...chart, itemLabel: 'Method' });
  assert.match(html, /<th scope="col">Method<\/th>/);
  assert.doesNotMatch(html, /Country/);
});

test('without itemLabel the item column reads "Category"', () => {
  assert.match(render(chart), /<th scope="col">Category<\/th>/);
});

test('the breakdown table caption names the grouping', () => {
  assert.match(render(chart), /<caption>Cases by method, by whether an ID check would reach it<\/caption>/);
});

const preview = { href: '/topics/example/facts/cases' };
const renderPreview = (c: Comparison) => renderToStaticMarkup(createElement(ComparisonChart, { fact, chart: c, sources: [source], preview }));

test('a preview drops the group controls and the breakdown table but keeps the note', () => {
  const html = renderPreview({ ...chart, note: 'Shares do not sum to 100%.' });
  assert.doesNotMatch(html, /sv-comparison-controls/);
  assert.doesNotMatch(html, /Show all breakdowns/);
  assert.match(html, /Shares do not sum to 100%\./);
});

test('a preview links its source credit to the fact page', () => {
  assert.match(renderPreview(chart), /href="\/topics\/example\/facts\/cases#source-cases-1"/);
});

test('a dense preview keeps every item and states the highlighted one\'s rank', () => {
  const items = Array.from({ length: 32 }, (_, i) => ({ label: i === 16 ? 'United Kingdom' : `Country ${i}`, value: 40 - i, highlight: i === 16 || undefined }));
  const html = renderPreview({ id: 'per-person', title: 'Per person', description: 'd', unit: 'count', valueLabel: 'Per 10,000', sources: [1], items });
  assert.equal(html.match(/class="sv-comparison__column"/g)?.length, 32);
  assert.match(html, /United Kingdom: 24 — 17th of 32/);
});
