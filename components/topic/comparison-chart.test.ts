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
