import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Fragment, createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BackToTopic, FactArticle } from '@/components/topic/fact-article';
import { panelCharts } from '@/components/topic/fact-figures';
import * as storyFixture from '@/components/report/stories/fixtures/figure-examples';
import { figureExamplesFact, figureExamplesPage } from '@/lib/content/__fixtures__/figure-examples';
import type { Fact } from '@/lib/content/types';

const fact = {
  id: 'example',
  claim: 'A sourced example.',
  status: 'well-supported' as const,
  sources: [{
    stance: 'supports' as const,
    quote: 'A sourced example.',
    title: 'Example source',
    url: 'https://example.org/source',
    publisher: 'Example publisher',
    date: '2026',
  }],
  body: 'Context.',
};

test('on its own page a report is its title, its claim, its panel and links to related reports', async () => {
  const { fact: parsed } = await figureExamplesPage(figureExamplesFact());
  const related = { ...parsed, id: 'related-report', title: 'A related report' };
  const html = renderToStaticMarkup(createElement(FactArticle, {
    slug: 'figure-examples',
    fact: parsed,
    supporting: [related],
    panel: createElement('div', { id: 'the-panel' }),
  }));
  assert.ok(html.indexOf('<h1 class="sv-factpage__claim">') < html.indexOf('id="figure-examples--finding"'));
  assert.ok(html.indexOf('id="figure-examples--finding"') < html.indexOf('id="the-panel"'));
  assert.match(html, /id="evidence-related-report"><a href="\/topics\/figure-examples\/facts\/related-report">A related report/);
  assert.doesNotMatch(html, /<figure/);
});

test('the way back from a report reaches its row, and from a supporting report its parent\'s', () => {
  const back = (f: Fact) => renderToStaticMarkup(createElement(BackToTopic, { slug: 'topic', topicTitle: 'A topic', fact: f }));
  assert.match(back(fact), /href="\/topics\/topic#fact-example"/);
  assert.match(back({ ...fact, id: 'detail', supports: 'example' }), /href="\/topics\/topic#fact-example"/);
  assert.match(back(fact), /A topic/);
});

test('a supporting report names the report it belongs to and links to it', () => {
  const html = renderToStaticMarkup(createElement(FactArticle, {
    slug: 'topic',
    fact: { ...fact, id: 'detail', supports: 'example' },
    parent: { ...fact, title: 'The parent report' },
  }));
  assert.match(html, /href="\/topics\/topic\/facts\/example"[^>]*>The parent report/);
});

/* ---------------------------------------------------------------- figures */

/** The fixture's charts, as its panel draws them. */
async function renderFixture() {
  const { fact: parsed } = await figureExamplesPage(figureExamplesFact());
  const page = { slug: 'figure-examples', asOf: '2026-10-29', facts: [parsed] };
  return renderToStaticMarkup(createElement(Fragment, null, panelCharts(parsed, page, { addressed: true })));
}

/** The markup of the element whose id is `id`, up to its closing `</figure>`. */
function figureMarkup(html: string, id: string) {
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start >= 0, `no element with id ${id}`);
  return html.slice(start, html.indexOf('</figure>', start));
}

test('with JavaScript off, a figure table is in default order and a map\'s areas are in its noscript table', async () => {
  const html = await renderFixture();
  const table = figureMarkup(html, 'figure-examples--chart-federal-laws');
  assert.ok(table.indexOf('Voting Rights Act') < table.indexOf('SAVE Act (Republican)'));
  const map = figureMarkup(html, 'figure-examples--chart-rejection-by-state');
  const noscript = map.slice(map.indexOf('<noscript>'));
  for (const state of ['Arkansas', 'Delaware', 'Oklahoma', 'Vermont', 'Maine', 'Indiana']) assert.match(noscript, new RegExp(state));
});

test('a categorical tile map, a geo map and a scatter plot render from a fact file', async () => {
  const html = await renderFixture();
  const tiles = figureMarkup(html, 'figure-examples--chart-voter-id-rules');
  assert.match(tiles, /aria-label="Arkansas: Strict photo ID"/);
  assert.match(tiles, /scope="row"/);
  const geo = figureMarkup(html, 'figure-examples--chart-postal-voting');
  assert.match(geo, /<path[^>]*data-region="US"[^>]*data-highlight="true"/);
  assert.match(geo, /aria-label="Australia: Some voters"/);
  const scatter = figureMarkup(html, 'figure-examples--chart-count-speed');
  assert.match(scatter, /data-region="az"[^>]*data-highlight="true"[^>]*aria-label="Arizona \(Mostly mail\)/);
});

test('the Storybook copy of the figure fixture matches the fixture file', async () => {
  const { fact: parsed, bodyHtml } = await figureExamplesPage();
  const plain = (value: unknown) => JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(storyFixture.figureExamplesFact), plain(parsed), 'regenerate components/report/stories/fixtures/figure-examples.ts');
  assert.equal(storyFixture.figureExamplesBodyHtml, bodyHtml);
});

