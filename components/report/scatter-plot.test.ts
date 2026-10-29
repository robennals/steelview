import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScatterPlot, type ScatterPlotProps } from './scatter-plot';

const props: ScatterPlotProps = {
  points: [
    { id: 'az', label: 'AZ', name: 'Arizona', x: 14, y: 147, group: 'mail', note: '73 hours in 2020.' },
    { id: 'nv', label: 'NV', name: 'Nevada', x: 15, y: 51, group: 'mail' },
    { id: 'pa', label: 'PA', name: 'Pennsylvania', x: 0, y: 8, group: 'polls' },
    { id: 'ga', label: 'GA', name: 'Georgia', x: 21, y: 5 },
  ],
  x: { label: 'Days before', format: { unit: 'number', decimals: 0 } },
  y: { label: 'Hours to count' },
  groups: [{ id: 'mail', label: 'Mostly mail' }, { id: 'polls', label: 'Mostly in person' }],
  highlight: ['az'],
  pointLabel: 'State',
  title: 'Count speed',
};

const html = renderToStaticMarkup(createElement(ScatterPlot, props));
const variants = ['narrow', 'wide'];
const svg = (variant: string) => {
  const match = html.match(new RegExp(`<svg[^>]*data-variant="${variant}"[^>]*>.*?</svg>`));
  assert.ok(match, `${variant} plot rendered`);
  return match[0];
};

test('both size variants are rendered', () => {
  for (const variant of variants) assert.match(svg(variant), /role="group"/);
});

test('every point has a label element and an aria-label in each variant', () => {
  for (const variant of variants) {
    const plot = svg(variant);
    for (const point of props.points) {
      assert.match(plot, new RegExp(`<text[^>]*class="sv-scatter__label"[^>]*data-region="${point.id}"[^>]*>${point.label}</text>`));
      assert.match(plot, new RegExp(`<g[^>]*data-region="${point.id}"[^>]*aria-label="${point.name} \\(`));
    }
  }
  assert.match(html, /aria-label="Arizona \(Mostly mail\)\. Days before: 14\. Hours to count: 147\. 73 hours in 2020\."/);
});

test('a point outside every group is listed as Other', () => {
  assert.match(html, /aria-label="Georgia \(Other\)/);
  assert.match(html, /<span class="sv-scatter__key-name">Other<\/span>/);
});

test('a highlighted point gets a ring and a bold label, not a new colour', () => {
  const plot = svg('wide');
  assert.match(plot, /<g[^>]*data-region="az"[^>]*data-highlight="true"[^>]*><circle class="sv-scatter__ring"/);
  assert.match(plot, /<text[^>]*data-region="az" data-highlight="true"/);
  assert.match(plot, /<g class="sv-scatter__point" style="color:var\(--sv-series-1\)" data-region="az"/);
});

test('the table has one row per point, by name, with group and note columns', () => {
  const rows = [...html.matchAll(/<tr[^>]*><th scope="row">([^<]+)<\/th>/g)].map(m => m[1]);
  assert.deepEqual(rows, ['Arizona', 'Georgia', 'Nevada', 'Pennsylvania']);
  assert.match(html, /<th scope="col" class="sv-data__th-text">Group<\/th>/);
  assert.match(html, /<th scope="col" class="sv-data__th-text">Note<\/th>/);
});

test('the summary gives the count and both ranges', () => {
  assert.match(html, /4 states\. Days before from 0 to 21; Hours to count from 5 to 147\./);
});
