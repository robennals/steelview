import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { figureExamplesFact } from '@/lib/content/__fixtures__/figure-examples';
import { figureContext } from '@/lib/content/figure-props';
import type { ComponentFigure } from '@/lib/content/types';
import { FactFigure } from './fact-figures';

const fact = figureExamplesFact();
const context = figureContext(fact, '2026-10-29');
const page = { slug: 'figure-examples', asOf: '2026-10-29', facts: [fact] };

function render(id: string): string {
  const figure = fact.figures?.find((f): f is ComponentFigure => 'id' in f && f.id === id && f.kind !== 'comparison' && f.kind !== 'section' && f.kind !== 'series');
  if (!figure) throw new Error(`no figure ${id}`);
  return renderToStaticMarkup(createElement(FactFigure, { figure, context, page }));
}

test('up to four quotes sit side by side; more become a list a reader can filter', () => {
  assert.match(render('damage-claims'), /class="sv-chart sv-report sv-quote-comparison"/);
  const list = render('postal-secrecy');
  assert.match(list, /class="sv-chart sv-report sv-quote-browser"/);
  // Every quote is in the server-rendered list, so the page is complete without JavaScript.
  assert.equal(list.match(/class="sv-quote-browser__item"/g)?.length, 5);
});

test('a long list filters by category and, since one speaker is quoted twice, by speaker', () => {
  const list = render('postal-secrecy');
  assert.match(list, /Who is speaking/);
  assert.match(list, />Speaker</);
  assert.match(list, /Government reviews/);
});

test('a quote not in English is marked with its language and has its translation beside it, outside the quotation', () => {
  const list = render('postal-secrecy');
  assert.match(list, /<blockquote class="sv-quote__text"[^>]* lang="de"/);
  assert.match(list, /<\/blockquote><p class="sv-quote__translation"><span class="sv-quote__translation-label">Translation:<\/span> With postal voting/);
});
