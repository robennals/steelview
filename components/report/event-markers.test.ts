import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkerCards, MarkerKey, MarkerLane, groupLabel, groupMarkers, numberMarkers, type MarkerEvent } from './event-markers';
import { cardPosition } from './marker-card-placement';

const events: MarkerEvent[] = [
  { date: '2016', label: 'Bare event' },
  { date: '2013-06', label: 'New survey', description: 'The survey changed.', kind: 'method' },
  { date: '2011-01', label: 'Law passed', description: 'It passed.', sources: [{ label: 'Court', href: '#source-x-1', number: 1 }] },
];
const markers = numberMarkers(events);

test('markers are numbered in date order, whichever kind they are', () => {
  assert.deepEqual(markers.map(m => [m.number, m.event.label]), [[1, 'Law passed'], [2, 'New survey'], [3, 'Bare event']]);
});

const single = (m: (typeof markers)[number], left: number) => ({ members: [m], left, lines: [left] });

test('a marker is a button opening its own card, not a link that moves the page', () => {
  const html = renderToStaticMarkup(createElement(MarkerLane, { groups: markers.map((m, i) => single(m, i * 10)), cardsId: 'x' }));
  assert.doesNotMatch(html, /<a |href=/);
  assert.deepEqual([...html.matchAll(/popovertarget="([^"]+)"/gi)].map(m => m[1]), ['x-1', 'x-2', 'x-3']);
  assert.match(html, /aria-label="2\. Measurement change, Jun 2013: New survey"/);
});

test('without interaction a marker names its events and opens nothing', () => {
  const html = renderToStaticMarkup(createElement(MarkerLane, { groups: markers.map(m => single(m, 0)), cardsId: 'x', interactive: false }));
  assert.doesNotMatch(html, /<button|popover/i);
  assert.match(html, /role="img" aria-label="1\. Jan 2011: Law passed"/);
});

test('markers close enough to collide are one marker, which never needs a second row', () => {
  // 1 and 2 touch; 3 is clear of them both.
  const groups = groupMarkers(markers, [110, 120, 160], { disc: 24, perDigit: 7, within: [0, 1000] });
  assert.deepEqual(groups.map(g => g.members.map(m => m.number)), [[1, 2], [3]]);
  assert.equal(groups[0].center, 115);
  assert.equal(groupLabel(groups[0].members), '1–2');
  // A whole cluster at one date is one marker, however many it holds.
  assert.equal(groupMarkers(markers, [50, 50, 50], { disc: 24, perDigit: 7, within: [0, 1000] }).length, 1);
  // Far apart, each is its own.
  assert.equal(groupMarkers(markers, [0, 100, 200], { disc: 24, perDigit: 7, within: [0, 1000] }).length, 3);
  // A marker moved in from the edge joins any it then reaches.
  assert.deepEqual(groupMarkers(markers, [960, 990, 1000], { disc: 24, perDigit: 7, within: [0, 1000] }).map(g => g.members.length), [3]);
  // A wide marker at an edge moves in until it fits.
  assert.equal(groupMarkers(markers, [995, 998, 1000], { disc: 24, perDigit: 7, within: [0, 1000] })[0].center, 1000 - (24 + 14) / 2);
});

test('a group\'s marker shows its range, carries both colours when mixed, and lights each member\'s line', () => {
  const html = renderToStaticMarkup(createElement(MarkerLane, { groups: [{ members: markers.slice(0, 2), left: 15, lines: [10, 20] }], cardsId: 'x' }));
  assert.match(html, /data-kind="mixed" data-marker-line="1 2"[^>]*popovertarget="x-1-2"/i);
  assert.match(html, />1–2</);
  assert.match(html, /aria-label="1–2: 2 marked close together\. 1\. Jan 2011: Law passed; 2\. Measurement change, Jun 2013: New survey"/);
  assert.equal(html.match(/class="sv-markers__stem"/g)?.length, 2);
});

test('each card is closed until chosen, and says which kind it is', () => {
  const html = renderToStaticMarkup(createElement(MarkerCards, { markers, groups: markers.map(m => [m]), cardsId: 'x' }));
  assert.equal(html.match(/popover="auto"/g)?.length, 3);
  assert.match(html, /aria-label="Measurement change: New survey"/);
  assert.match(html, /aria-label="Event: Law passed"/);
  assert.match(html, /The survey changed\./);
  assert.match(html, /Court/);
});

test('a group\'s card offers its members to choose between, one open at a time', () => {
  const group = markers.slice(0, 2);
  // Two drawings grouping the same way give one card for the group.
  const html = renderToStaticMarkup(createElement(MarkerCards, { markers, groups: [group, group, [markers[2]]], cardsId: 'x' }));
  const card = html.match(/<div id="x-1-2"[\s\S]*?<\/button><\/div>/)?.[0] ?? '';
  assert.match(card, /popover="auto"/);
  assert.match(card, /2 marked close together\. Choose one:/);
  assert.deepEqual([...card.matchAll(/<details name="x-1-2" class="sv-marker-choice" data-marker="(\d)">/g)].map(m => m[1]), ['1', '2']);
  assert.doesNotMatch(card, /<details[^>]*\sopen/);
  // Every marker keeps its own card too, which is what prints.
  assert.equal(html.match(/popover="auto"/g)?.length, 4);
});

test('the key names only the kinds on this chart', () => {
  const only = numberMarkers([events[0]]);
  const html = renderToStaticMarkup(createElement(MarkerKey, { markers: only }));
  assert.match(html, /Events/);
  assert.doesNotMatch(html, /Measurement changes/);
  assert.equal(renderToStaticMarkup(createElement(MarkerKey, { markers: [] })), '');
});

const view = { width: 1000, height: 800 };
const marker = { top: 400, bottom: 420, left: 500, width: 20 };

test('a card sits under its marker, centred on it', () => {
  assert.deepEqual(cardPosition(marker, { width: 300, height: 100 }, view), { top: 428, left: 360 });
});

test('a card with no room below goes above its marker', () => {
  assert.equal(cardPosition({ ...marker, top: 700, bottom: 720 }, { width: 300, height: 100 }, view).top, 592);
});

test('a card stays inside the window at both edges', () => {
  assert.equal(cardPosition({ ...marker, left: 0 }, { width: 300, height: 100 }, view).left, 8);
  assert.equal(cardPosition({ ...marker, left: 980 }, { width: 300, height: 100 }, view).left, 692);
  assert.equal(cardPosition({ ...marker, top: 50, bottom: 70 }, { width: 300, height: 790 }, view).top, 8);
});
