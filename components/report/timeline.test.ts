import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timeline, type TimelineEvent } from './timeline';
import { previewEvents } from './timeline-layout';

const render = (props: Parameters<typeof Timeline>[0]) => renderToStaticMarkup(createElement(Timeline, props));

test('approximate dates are shown as written, before the exact dates they cover; only an exact date is a <time>', () => {
  const html = render({
    categories: [{ id: 'law', label: 'Law' }],
    events: [
      { date: '1851-03', title: 'An event with an exact date', category: 'law' },
      { date: 'c. 1888', title: 'An event dated circa a year', category: 'law' },
      { date: '1850s', title: 'An event dated only to the decade', category: 'law' },
      { date: '1888', title: 'An event dated to its year', category: 'law' },
    ],
  });
  const titles = [...html.matchAll(/<span class="sv-timeline__title">([^<]+)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(titles, ['An event dated only to the decade', 'An event with an exact date', 'An event dated circa a year', 'An event dated to its year']);
  assert.match(html, /<span class="sv-timeline__date"><span>1850s<\/span>/);
  assert.match(html, /<span class="sv-timeline__date"><span>c\. 1888<\/span>/);
  assert.match(html, /<time dateTime="1851-03">Mar 1851<\/time>/);
});

test('an event with more to say is a card that opens; one without is a plain card', () => {
  const html = render({
    events: [
      { date: '2026-04-07', endDate: '2026-04-08', title: 'Ceasefire ordered, then extended', category: 'both', description: 'Two weeks.' },
      { date: '2026-06-08', title: 'Engaged a US Army Apache helicopter', category: 'iran' },
    ],
  });
  assert.equal(html.match(/<details class="sv-timeline__card"/g)?.length, 1);
  assert.equal(html.match(/<div class="sv-timeline__card">/g)?.length, 1);
  // An event that lasted shows its range on the card and as a bar on the axis.
  assert.match(html, /7 Apr 2026<\/time> – <time dateTime="2026-04-08">8 Apr 2026<\/time>/);
  assert.match(html, /class="sv-timeline__span"/);
  // Each card is a row an observation can pick out.
  assert.match(html, /data-row="Engaged a US Army Apache helicopter"/);
});

test('when every event is a short name, the names go on the axis and there are no cards', () => {
  const html = render({
    events: [
      { date: '1979-12-29', title: 'Syria', category: 'designated', description: 'Later status unverified.' },
      { date: '1984-01-19', title: 'Iran', category: 'designated' },
      { date: '2017-11-20', title: 'North Korea', category: 'designated' },
    ],
  });
  assert.doesNotMatch(html, /sv-timeline__cards/);
  assert.equal(html.match(/class="sv-timeline__name"/g)?.length, 3);
  assert.match(html, /<strong>Syria:<\/strong> Later status unverified\./);
  // The axis is cut between 1984 and 2017.
  assert.equal(html.match(/class="sv-timeline__break"/g)?.length, 1);
});

const events: TimelineEvent[] = [
  { date: '2011-10-11', title: 'Event A of the court record', category: 'c' },
  { date: '2021-02-04', title: 'Event B of the court record', category: 'c', significance: 'major' },
  { date: '2024-04-11', title: 'Event C of the court record', category: 'c' },
  { date: '2025-10-29', title: 'Event D of the court record', category: 'c' },
  { date: '2026-01-28', title: 'Event E of the court record', category: 'c' },
];

test('a preview gives cards to the events its claim picks out, else the major ones, else the latest', () => {
  assert.deepEqual(previewEvents(events, ['Event D of the court record', 'Event A of the court record']).map(e => e.title.split(' ')[1]), ['A', 'D']);
  assert.deepEqual(previewEvents(events).map(e => e.title.split(' ')[1]), ['B']);
  assert.deepEqual(previewEvents(events.map(e => ({ ...e, significance: undefined }))).map(e => e.title.split(' ')[1]), ['C', 'D', 'E']);
});

test('a preview draws every event on its axis, cards for a few, and counts the rest', () => {
  const html = render({ events, preview: {}, picked: ['Event C of the court record', 'Event D of the court record'] });
  assert.equal(html.match(/class="sv-timeline__pin"/g)?.length, 5);
  assert.equal(html.match(/<li class="sv-timeline__item"/g)?.length, 2);
  assert.match(html, /and 3 more events on the time line/);
  // Every event is read out in words, the carded ones included.
  assert.match(html, /<ol class="sv-visually-hidden"><li>11 Oct 2011: Event A of the court record \(c\)<\/li>/);
  assert.doesNotMatch(html, /sv-control__status|sv-timeline__controls|<details/);
});
