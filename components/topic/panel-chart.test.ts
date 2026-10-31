import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Fragment, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { figureExamplesFact } from '@/lib/content/__fixtures__/figure-examples';
import { loadTopic } from '@/lib/content/load';
import { isComponentFigure } from '@/lib/content/types';
import { PanelChart, panelCharts } from './fact-figures';

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

test('every chart of a panel ends in a sources row, each source in it whole, with no line of credits', async () => {
  const topic = await loadTopic('us-vote-by-mail');
  for (const fact of topic.facts) {
    for (const chart of panelCharts(fact, { slug: topic.slug, facts: topic.facts })) {
      const html = renderToStaticMarkup(chart);
      assert.match(html, /<details class="sv-chart__sources"><summary><span[^>]*>Sources?:<\/span>/);
      assert.match(html, /<li class="sv-source" value="\d+" data-source-id="source-[a-z0-9-]+-\d+"><a href="http[^"]+"[^>]*>[^<]+<\/a><p>[^<]+<\/p><blockquote/);
    }
  }
});

test('on a report\'s own page each source has its address once, on the first chart to cite it', async () => {
  const topic = await loadTopic('us-vote-by-mail');
  const fact = topic.facts[0];
  const html = renderToStaticMarkup(createElement(Fragment, null, panelCharts(fact, { slug: topic.slug, facts: topic.facts }, { addressed: true })));
  const ids = [...html.matchAll(/ id="(source-[a-z0-9-]+-\d+)"/g)].map(match => match[1]);
  assert.ok(ids.length > 0);
  assert.equal(new Set(ids).size, ids.length);
});

test('a chart a panel has no figure for draws nothing', () => {
  assert.equal(panel('no-such-chart'), '');
});
