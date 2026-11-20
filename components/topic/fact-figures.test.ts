import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { figureExamplesFact } from '@/lib/content/__fixtures__/figure-examples';
import { figureContext } from '@/lib/content/figure-props';
import type { ComponentFigure } from '@/lib/content/types';
import { FactFigure } from './fact-figures';
import { SlideChart } from './slide-chart';

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
  // Each filter is a dropdown on the control bar, named for what it sets and its setting.
  assert.match(list, /aria-label="Who is speaking: All"/);
  assert.match(list, /aria-label="Speaker: All"/);
  assert.match(list, /Government reviews/);
});

test('on a slideshow card a collection of quotes shows only the quotes its point rests on, with how many there are in all', () => {
  const html = renderToStaticMarkup(createElement(SlideChart, { slide: { fact, chart: 'postal-secrecy', label: 'Postal secrecy', href: '/x' }, fit: 'card', page, picked: ['Priscilla Southwell'] }));
  assert.match(html, /class="sv-chart sv-card-quotes"/);
  assert.doesNotMatch(html, /sv-quote-browser|sv-carousel/, 'neither the filterable list nor a slideshow of its own');
  const shown = [...html.matchAll(/<li class="sv-card-quotes__item"/g)];
  assert.equal(shown.length, 2, 'both of her quotes, one under the other');
  assert.doesNotMatch(html, /Richard Mawrey QC/, 'and no one else\'s');
  assert.match(html, /2 of 5 quotes · <span class="sv-card-quotes__all">See all<\/span>/);
  const named = renderToStaticMarkup(createElement(SlideChart, { slide: { fact, chart: 'postal-secrecy', label: 'Postal secrecy', href: '/x' }, fit: 'card', page }));
  assert.equal([...named.matchAll(/<li class="sv-card-quotes__item"/g)].length, 1, 'a card naming no speaker shows the first quote');
});

test('a quote not in English is marked with its language and has its translation beside it, outside the quotation', () => {
  const list = render('postal-secrecy');
  assert.match(list, /<blockquote class="sv-quote__text"[^>]* lang="de"/);
  assert.match(list, /<\/blockquote><p class="sv-quote__translation"><span class="sv-quote__translation-label">Translation:<\/span> With postal voting/);
});

test('a slice explorer shows one roll call at a time and lists every row of its data for a reader without JavaScript', () => {
  const html = render('war-powers-votes');
  assert.match(html, /Roll call: House, 15 Sep 2026/);
  assert.doesNotMatch(html, /Roll call: all/);
  assert.match(html, /<summary class="sv-chart__data-summary">All 10 rows of the data<\/summary>/);
  // The roll call is a single choice, never offered as a split.
  const splitGroup = /aria-label="Split by">.*?<\/div><\/div>/.exec(html)?.[0] ?? '';
  assert.match(splitGroup, />Position</);
  assert.doesNotMatch(splitGroup, />Roll call</);
});

test('small multiples draw a panel per item on one scale, the highlighted one marked, a panel\'s own source under its name', () => {
  const html = render('chokepoint-traffic');
  assert.equal(html.match(/class="sv-multiples__panel"/g)?.length, 5);
  assert.match(html, /<li class="sv-multiples__panel" data-row="Strait of Hormuz" data-highlight="true"><h3 class="sv-multiples__name">Strait of Hormuz<\/h3>/);
  assert.match(html, /Kerch Strait<span class="sv-item-credit"><span><a href="#source-figure-examples-40">Fixture Ship Tracker \[40\]<\/a>/);
  assert.match(html, /all panels share one scale/);
});
