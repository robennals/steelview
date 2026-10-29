import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventStrip, type StripEvent } from './event-strip';

const events: StripEvent[] = [
  { date: '2011-01', label: 'Law passed', description: 'The legislature passed it.' },
  { date: '2013-06', label: 'Court ruling', source: { label: 'Court', href: '#source-x-1', number: 1 } },
  { date: '2016', label: 'Bare event' },
];

const render = (props: Partial<Parameters<typeof EventStrip>[0]> = {}) =>
  renderToStaticMarkup(createElement(EventStrip, { from: 2010, to: 2020, events, id: 'strip', ...props }));

test('items with detail are closed <details> carrying the ids; a bare item stays a plain <li>', () => {
  const html = render();
  assert.match(html, /<details class="sv-event-strip__details" id="sv-event-strip-strip-1">/);
  assert.match(html, /<details class="sv-event-strip__details" id="sv-event-strip-strip-2">/);
  assert.doesNotMatch(html, /<details[^>]*\sopen/);
  assert.match(html, /<li id="sv-event-strip-strip-3" class="sv-event-strip__item" data-bare="">/);
  assert.equal((html.match(/<details/g) ?? []).length, 2);
});

test('each summary carries the formatted date and the label', () => {
  const html = render();
  const summaries = [...html.matchAll(/<summary class="sv-event-strip__summary">([\s\S]*?)<\/summary>/g)].map(m => m[1]);
  assert.equal(summaries.length, 2);
  assert.match(summaries[0], /<time dateTime="2011-01">Jan 2011<\/time>/);
  assert.match(summaries[0], /Law passed/);
  assert.match(summaries[1], /Court ruling/);
});

test('an href is a link in the body, never inside the summary', () => {
  const html = render({ events: [{ date: '2012', label: 'Linked', href: '#elsewhere' }] });
  const summary = html.match(/<summary[\s\S]*?<\/summary>/)?.[0] ?? '';
  assert.doesNotMatch(summary, /<a /);
  assert.match(html, /<div class="sv-event-strip__body">[\s\S]*<a href="#elsewhere">See the evidence<\/a>/);
});

test('with a window, events outside it get no marker but keep their numbered key item', () => {
  const html = render({ from: '2012-06', to: '2016-12', window: { from: '2012-06', to: '2016-12' } });
  const markers = [...html.matchAll(/class="sv-event-strip__marker" href="#([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(markers, ['sv-event-strip-strip-2', 'sv-event-strip-strip-3']);
  assert.match(html, /id="sv-event-strip-strip-1"/);
  assert.match(html, /Jan 2011<\/time><span class="sv-event-strip__outside"> \(outside the period shown\)<\/span>/);
  assert.equal((html.match(/outside the period shown/g) ?? []).length, 1);
});
