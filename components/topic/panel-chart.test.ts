import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { figureExamplesFact } from '@/lib/content/__fixtures__/figure-examples';
import { isComponentFigure } from '@/lib/content/types';
import { PanelChart } from './fact-figures';

const fact = figureExamplesFact();
const page = { slug: 'figure-examples', asOf: '2026-10-29', facts: [fact] };

const panel = (chart: string) => renderToStaticMarkup(createElement(PanelChart, { slide: { fact, chart, label: chart, href: '/x' }, page }));

for (const figure of fact.figures!.filter(isComponentFigure)) {
  test(`a ${figure.kind} (${figure.id}) in a data panel folds its notes into one line and links its sources directly`, () => {
    const html = panel(figure.id);
    assert.match(html, /<figure[^>]* data-panel-chart/);
    assert.doesNotMatch(html, /sv-chart__methodology/);
    assert.doesNotMatch(html, /sv-chart__desc/);
    // The fact's numbered source list is not on the topic page.
    assert.doesNotMatch(html, /href="#source-/);
    if ('description' in figure && figure.description) assert.match(html, /<details class="sv-chart__about">/);
  });
}

test('a panel figure\'s source line names each source and links to it, as a chart\'s does', () => {
  const html = panel('wa-by-race');
  assert.match(html, /Sources?: <span><a href="https:\/\/[^"]+">[^<[]+<\/a>/);
});

test('a chart a panel has no figure for draws nothing', () => {
  assert.equal(panel('no-such-chart'), '');
});
