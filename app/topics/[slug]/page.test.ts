import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { bodyKey, buildBodies, TopicSections } from './page';
import type { Topic } from '@/lib/content/types';

/**
 * Regression test for the silent-misattribution bug: ids are filenames and
 * are unique only *within* a kind's directory, so a viewpoint and a principle
 * can legitimately share an id (e.g. both named `democratic-consent`). If the
 * `bodies` map is keyed on the bare id, the later kind's body silently
 * overwrites the earlier kind's — one item would render the other's prose
 * under its own heading, with no error anywhere.
 */
test('a viewpoint and a principle sharing an id do not overwrite each other in the body map', async () => {
  const topic = {
    viewpoints: [{ id: 'democratic-consent', body: 'Viewpoint body.' }],
    principles: [{ id: 'democratic-consent', body: 'Principle body.' }],
    cruxes: [],
  };
  const bodies = await buildBodies(topic, 'example');
  const viewpointHtml = bodies.get(bodyKey('viewpoint', 'democratic-consent'));
  const principleHtml = bodies.get(bodyKey('principle', 'democratic-consent'));
  assert.ok(viewpointHtml?.includes('Viewpoint body.'), viewpointHtml);
  assert.ok(principleHtml?.includes('Principle body.'), principleHtml);
  assert.notEqual(viewpointHtml, principleHtml);
});

test('items with distinct ids across the kinds each get their own body', async () => {
  const topic = {
    viewpoints: [{ id: 'a', body: 'viewpoint a' }],
    principles: [{ id: 'a', body: 'principle a' }],
    cruxes: [{ id: 'a', body: 'crux a' }],
  };
  const bodies = await buildBodies(topic, 'example');
  assert.equal(bodies.size, 3);
});

/**
 * Fact bodies are no longer rendered here: a fact is read on its own page or
 * in the panel that intercepts it, both of which load it themselves. The map
 * must not silently keep a stale fact body around for something to render.
 */
test('the body map holds no fact bodies', async () => {
  const bodies = await buildBodies(
    { viewpoints: [{ id: 'a', body: 'viewpoint a' }], principles: [], cruxes: [] },
    'example'
  );
  assert.equal(bodies.get(bodyKey('fact', 'a')), undefined);
});

/**
 * Regression test for shipping an empty heading: a topic with no cruxes (a
 * legal shape — `cruxes/` need not exist) must not render a "Cruxes" heading
 * with nothing under it, and likewise for principles.
 */
test('a section with no items renders no heading for that section', () => {
  const topic: Topic = {
    slug: 'bare',
    title: 'Bare',
    subtitle: 'Sub',
    lastUpdated: '2026-08-18',
    intro: 'Intro.',
    facts: [{ id: 'a', claim: 'A', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [
      {
        id: 'one',
        name: 'One',
        summary: 's',
        order: 1,
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        principles: [],
        body: '',
      },
      {
        id: 'two',
        name: 'Two',
        summary: 's',
        order: 2,
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        principles: [],
        body: '',
      },
    ],
    principles: [],
    cruxes: [],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, bodies: new Map() }));
  assert.match(html, /Facts/);
  assert.match(html, /Viewpoints/);
  assert.doesNotMatch(html, /Principles/);
  assert.doesNotMatch(html, /Cruxes/);
});

test('a section with items renders its heading', () => {
  const topic: Topic = {
    slug: 'full',
    title: 'Full',
    subtitle: 'Sub',
    lastUpdated: '2026-08-18',
    intro: 'Intro.',
    facts: [{ id: 'a', claim: 'A', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [
      {
        id: 'one',
        name: 'One',
        summary: 's',
        order: 1,
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        principles: ['p'],
        body: '',
      },
      {
        id: 'two',
        name: 'Two',
        summary: 's',
        order: 2,
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        principles: [],
        body: '',
      },
    ],
    principles: [{ id: 'p', name: 'P', body: '' }],
    cruxes: [
      {
        id: 'timing',
        question: 'Q?',
        kind: 'prediction',
        divides: ['one', 'two'],
        positions: [
          { viewpoint: 'one', holds: 'Soon.' },
          { viewpoint: 'two', holds: 'Later.' },
        ],
        body: '',
      },
    ],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, bodies: new Map() }));
  assert.match(html, /Facts/);
  assert.match(html, /Viewpoints/);
  assert.match(html, /Principles/);
  assert.match(html, /Cruxes/);
});

/**
 * The Facts list is headline facts only, with the facts that are evidence for
 * each named underneath it. A supporting fact must never be a top-level row —
 * it is evidence for a larger claim and reads inside it — and every row is a
 * link to that fact's own page, which is where its context and sources live.
 */
test('a supporting fact is listed under its parent, not as a top-level row', () => {
  const factOf = (id: string, supports?: string) => ({
    id,
    claim: `Claim ${id}`,
    status: 'well-supported' as const,
    sources: [],
    body: '',
    ...(supports === undefined ? {} : { supports }),
  });
  const viewpointOf = (id: string, order: number) => ({
    id,
    name: id,
    summary: 's',
    order,
    citesFacts: [],
    acknowledges: ['parent'],
    setsAside: [],
    principles: [],
    body: '',
  });
  const topic: Topic = {
    slug: 'nested',
    title: 'Nested',
    subtitle: 'Sub',
    lastUpdated: '2026-08-18',
    intro: '',
    facts: [factOf('parent'), factOf('child', 'parent')],
    viewpoints: [viewpointOf('one', 1), viewpointOf('two', 2)],
    principles: [],
    cruxes: [],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, bodies: new Map() }));

  // Only the headline fact is a row in the list — a fact that supports
  // another is not, whatever the reader has or hasn't clicked yet.
  assert.equal(html.match(/class="sv-item sv-fact"/g)?.length, 1);
  assert.equal(html.match(/class="sv-item sv-subfact"/g), null);
  // Every fact is addressed by its own URL. The in-page `#fact-<id>` anchors
  // are gone: one thing, one address.
  assert.doesNotMatch(html, /id="fact-/);
  assert.match(html, /href="\/topics\/nested\/facts\/parent"/);
  // The child's claim, its status and the fact that it supports something are
  // all reading a reader would only get by opening the parent fact — none of
  // it belongs in the list itself, so none of it is here.
  assert.doesNotMatch(html, /href="\/topics\/nested\/facts\/child"/);
  assert.doesNotMatch(html, /Claim child/);
  assert.doesNotMatch(html, /Supporting fact/);
  // The headline row itself still reads: claim and status, nothing else.
  assert.match(html, /Claim parent/);
  assert.equal(html.match(/Well supported/g)?.length, 1);
});
