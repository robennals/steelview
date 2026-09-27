import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FactArticle } from '@/components/topic/fact-article';

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

test('data still needed is omitted unless a collection names a material gap', () => {
  const html = renderToStaticMarkup(createElement(FactArticle, { slug: 'topic', fact, bodyHtml: '<p>Context.</p>', variant: 'page' }));
  assert.doesNotMatch(html, /Data still needed/);
});

test('data still needed appears at the end of a collection before sources', () => {
  const html = renderToStaticMarkup(createElement(FactArticle, {
    slug: 'topic',
    fact: { ...fact, dataStillNeeded: [{ measure: 'Route history', why: 'The stock cannot be linked to its original route.' }] },
    bodyHtml: '<p>Context.</p>',
    variant: 'page',
  }));
  assert.match(html, /Data still needed/);
  assert.match(html, /Route history/);
  assert.ok(html.indexOf('Data still needed') < html.indexOf('Sources'));
});
