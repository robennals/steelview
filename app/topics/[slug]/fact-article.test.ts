import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BackToTopic, FactArticle } from '@/components/topic/fact-article';
import * as storyFixture from '@/components/report/stories/fixtures/figure-examples';
import { figureExamplesFact, figureExamplesPage } from '@/lib/content/__fixtures__/figure-examples';
import type { Fact } from '@/lib/content/types';
import { renderMarkdown } from '@/lib/content/markdown';

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

test('a sheet leaves out what is still unknown unless a collection names a material gap', () => {
  const html = renderToStaticMarkup(createElement(FactArticle, { slug: 'topic', fact, bodyHtml: '<p>Context.</p>', variant: 'modal' }));
  assert.doesNotMatch(html, /What we don.*t know yet/);
});

test('a sheet says what is still unknown at the end of a collection, before its sources', () => {
  const html = renderToStaticMarkup(createElement(FactArticle, {
    slug: 'topic',
    fact: { ...fact, dataStillNeeded: [{ measure: 'Route history', why: 'The stock cannot be linked to its original route.' }] },
    bodyHtml: '<p>Context.</p>',
    variant: 'modal',
  }));
  assert.match(html, /id="example--data-still-needed">What we don.*t know yet/);
  assert.match(html, /Route history/);
  assert.ok(html.indexOf('Route history') < html.indexOf('class="sv-references"'));
});

test('on its own page a report is its title, its claim, its panel and links to related reports', async () => {
  const { fact: parsed, bodyHtml } = await figureExamplesPage(figureExamplesFact());
  const related = { ...parsed, id: 'related-report', title: 'A related report' };
  const html = renderToStaticMarkup(createElement(FactArticle, {
    slug: 'figure-examples',
    fact: parsed,
    bodyHtml,
    supporting: [{ fact: related, bodyHtml: '<p>Its whole text.</p>' }],
    variant: 'page',
    panel: createElement('div', { id: 'the-panel' }),
    topic: { lastUpdated: '2026-10-29', facts: [parsed] },
  }));
  assert.ok(html.indexOf('<h1 class="sv-factpage__claim">') < html.indexOf('id="figure-examples--finding"'));
  assert.ok(html.indexOf('id="figure-examples--finding"') < html.indexOf('id="the-panel"'));
  assert.match(html, /id="evidence-related-report"><a href="\/topics\/figure-examples\/facts\/related-report">A related report/);
  assert.doesNotMatch(html, /<figure|data-viz=|class="sv-references"|Whole report|Its whole text/);
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
    bodyHtml: '<p>Context.</p>',
    variant: 'page',
  }));
  assert.match(html, /href="\/topics\/topic\/facts\/example"[^>]*>The parent report/);
});

/* ---------------------------------------------------------------- figures */

async function renderFixture(change: (f: Fact) => Fact = f => f) {
  const { fact: parsed, bodyHtml } = await figureExamplesPage(change(figureExamplesFact()));
  return renderToStaticMarkup(createElement(FactArticle, {
    slug: 'figure-examples',
    fact: parsed,
    bodyHtml,
    variant: 'modal',
    topic: { lastUpdated: '2026-10-29', facts: [parsed] },
  }));
}

/** The markup of the element whose id is `id`, up to its closing `</figure>`. */
function figureMarkup(html: string, id: string) {
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start >= 0, `no element with id ${id}`);
  return html.slice(start, html.indexOf('</figure>', start));
}

test('figures render in the order written, with unplaced body sections after the last', async () => {
  const html = await renderFixture();
  const order = [
    'figure-examples--chart-series',
    'figure-examples--chart-senate-votes',
    'figure-examples--chart-federal-laws',
    'figure-examples--freedom-to-vote-act-provisions',
    'figure-examples--chart-audit-recheck',
    'figure-examples--chart-court-record',
    'figure-examples--chart-war-periods',
    'figure-examples--chart-rejection-by-state',
    'figure-examples--chart-wa-by-race',
    'figure-examples--chart-deaths-by-counter',
    'figure-examples--chart-cost-estimates',
    'figure-examples--chart-damage-claims',
    'figure-examples--chart-carter-baker',
    'figure-examples--chart-one-in-five',
    'figure-examples--chart-detected-is-a-floor',
    'figure-examples--chart-voter-id-rules',
    'figure-examples--chart-postal-voting',
    'figure-examples--chart-count-speed',
    'figure-examples--chart-deaths-by-region',
    'figure-examples--chart-deaths-split',
    'figure-examples--chart-count-releases',
    'figure-examples--audit-method',
    'figure-examples--remainder',
  ].map(id => html.indexOf(`id="${id}"`));
  assert.ok(order.every(i => i >= 0), `missing ids: ${order}`);
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test('a figure\'s Observations and Subtleties sit inside its frame, after its source line', async () => {
  const html = await renderFixture();
  const table = figureMarkup(html, 'figure-examples--chart-federal-laws');
  assert.match(table, /id="figure-examples--observations-federal-laws"/);
  assert.ok(table.indexOf('sv-chart__credit') < table.indexOf('figure-examples--observations-federal-laws'));
  assert.match(figureMarkup(html, 'figure-examples--chart-wa-by-race'), /id="figure-examples--subtleties-wa-by-race"/);
  assert.equal(html.match(/figure-examples--observations-federal-laws/g)?.length, 1);
});

test('a section figure moves its body section between the figures around it', async () => {
  const html = await renderFixture();
  const section = html.indexOf('id="figure-examples--freedom-to-vote-act-provisions"');
  assert.ok(html.indexOf('id="figure-examples--chart-federal-laws"') < section);
  assert.ok(section < html.indexOf('id="figure-examples--chart-audit-recheck"'));
  assert.equal(html.match(/Provisions of the Freedom to Vote Act/g)?.length, 1);
});

test('without figures, a fact keeps the old order: series, comparisons, then the whole body', async () => {
  const html = await renderFixture(f => ({ ...f, figures: undefined }));
  const series = html.indexOf('id="figure-examples--chart-series"');
  const comparison = html.indexOf('id="figure-examples--chart-senate-votes"');
  const section = html.indexOf('id="figure-examples--freedom-to-vote-act-provisions"');
  assert.ok(series >= 0 && series < comparison && comparison < section);
  assert.doesNotMatch(html, /figure-examples--chart-federal-laws/);
  // No figure claims the federal-laws Observations, so they stay in the body.
  assert.ok(html.indexOf('id="figure-examples--observations-federal-laws"') > section);
});

test('a replaced anchor is an alias just before its figure, so an old link lands on the figure', async () => {
  const html = await renderFixture();
  assert.match(html, /<div class="sv-anchor-aliases"><span id="figure-examples--federal-laws-list" data-alias-for="figure-examples--chart-federal-laws"><\/span><\/div><figure[^>]*id="figure-examples--chart-federal-laws"/);
});

test('with JavaScript off, a figure table is in default order and a map\'s areas are in its noscript table', async () => {
  const html = await renderFixture();
  const table = figureMarkup(html, 'figure-examples--chart-federal-laws');
  assert.ok(table.indexOf('Voting Rights Act') < table.indexOf('SAVE Act (Republican)'));
  assert.match(table, /class="sv-footnote" href="#source-figure-examples-24"/);
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

test('a featured supporting fact\'s charts render where its figure entry is, once, whether or not it has figures', async () => {
  const parent = figureExamplesFact();
  const child = (id: string, figures?: Fact['figures']): Fact => ({
    id,
    claim: `${id} claim`,
    status: 'well-supported',
    supports: parent.id,
    sources: parent.sources.slice(0, 11),
    comparisons: [{ id: `${id}-bars`, title: `${id} bars`, description: 'd', unit: 'count', valueLabel: 'n', sources: [11], items: [{ label: 'a', value: 1 }, { label: 'b', value: 2 }] }],
    figures,
    body: `## Observations {#${id}--observations-${id}-bars}\n\n### A point {#${id}--point}\n\nDetail.`,
  });
  const plainChild = child('plain-child');
  const figuredChild = child('figured-child', [{ kind: 'comparison', id: 'figured-child-bars' }]);
  const fact: Fact = {
    ...parent,
    featuredCharts: [plainChild.id, figuredChild.id],
    figures: [...(parent.figures ?? []).slice(0, 2), { kind: 'featured', fact: figuredChild.id }, { kind: 'featured', fact: plainChild.id }, ...(parent.figures ?? []).slice(2)],
  };
  const supporting = await Promise.all([plainChild, figuredChild].map(async c => ({ fact: c, bodyHtml: await renderMarkdown(c.body, 'figure-examples') })));
  const { bodyHtml } = await figureExamplesPage(fact);
  const html = renderToStaticMarkup(createElement(FactArticle, { slug: 'figure-examples', fact, bodyHtml, supporting, variant: 'modal' }));
  const at = (id: string) => html.indexOf(`id="${id}"`);
  assert.ok(at('figure-examples--chart-senate-votes') < at('figured-child--chart-figured-child-bars'));
  assert.ok(at('figured-child--chart-figured-child-bars') < at('plain-child--chart-plain-child-bars'));
  assert.ok(at('plain-child--chart-plain-child-bars') < at('figure-examples--chart-federal-laws'));
  for (const id of ['figured-child--chart-figured-child-bars', 'plain-child--chart-plain-child-bars', 'plain-child--observations-plain-child-bars', 'figured-child--observations-figured-child-bars']) {
    assert.equal(html.split(`id="${id}"`).length - 1, 1, id);
  }
  // Neither the fact's header nor its supporting-fact rows carry a status
  // label (a claimCheck figure in the body still shows its own verdict).
  assert.doesNotMatch(html, /<header class="sv-factpage__head">(?:(?!<\/header>).)*sv-status/);
  assert.equal(html.match(/<summary class="sv-item__summary">(?:(?!<\/summary>).)*<\/summary>/g)?.length, 2);
  assert.doesNotMatch(html, /<summary class="sv-item__summary">(?:(?!<\/summary>).)*sv-status/);
});
