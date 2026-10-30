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

test('a preview drops the group controls, the breakdown table and the note, which stay on the full chart', () => {
  const html = renderPreview({ ...chart, note: 'Shares do not sum to 100%.' });
  assert.doesNotMatch(html, /sv-comparison-controls/);
  assert.doesNotMatch(html, /Show all breakdowns/);
  assert.doesNotMatch(html, /Shares do not sum/);
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

test('a dense preview names its true highest and lowest items, whatever the authored order', () => {
  const items = Array.from({ length: 14 }, (_, i) => ({ label: `Item ${i}`, value: [73, 147, 20, 159, 3, 6, 50, 40, 30, 25, 60, 70, 80, 90][i] }));
  const html = renderPreview({ id: 'unsorted', title: 'Unsorted', description: 'd', unit: 'count', valueLabel: 'Hours', sources: [1], items });
  assert.match(html, /Highest: Item 3, 159/);
  assert.match(html, /Lowest: Item 4, 3/);
});

test('a dense preview with several highlighted items, or negative values, falls back to clamped rows', () => {
  const several = Array.from({ length: 14 }, (_, i) => ({ label: `Item ${i}`, value: i + 1, highlight: i % 2 === 0 || undefined }));
  const negative = Array.from({ length: 14 }, (_, i) => ({ label: `Item ${i}`, value: i - 5 }));
  for (const list of [several, negative]) {
    const html = renderPreview({ id: 'x', title: 'X', description: 'd', unit: 'count', valueLabel: 'v', sources: [1], items: list });
    assert.doesNotMatch(html, /sv-comparison__columns/);
    assert.match(html, /data-compact="true"/);
    assert.doesNotMatch(html, / of 14/);
  }
});
