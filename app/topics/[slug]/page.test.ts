import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { bodyKey, buildBodies, TopicSections } from './page';
import type { Topic } from '@/lib/content/types';

/**
 * Regression test for the silent-misattribution bug: ids are filenames and
 * are unique only *within* a kind's directory, so a fact and a principle can
 * legitimately share an id (e.g. both named `democratic-consent`). If the
 * `bodies` map is keyed on the bare id, the later kind's body silently
 * overwrites the earlier kind's — the fact would render the principle's
 * prose under its own claim and status badge, with no error anywhere.
 */
test('a fact and a principle sharing an id do not overwrite each other in the body map', async () => {
  const topic = {
    facts: [{ id: 'democratic-consent', body: 'Fact body.' }],
    viewpoints: [],
    principles: [{ id: 'democratic-consent', body: 'Principle body.' }],
    cruxes: [],
  };
  const bodies = await buildBodies(topic);
  const factHtml = bodies.get(bodyKey('fact', 'democratic-consent'));
  const principleHtml = bodies.get(bodyKey('principle', 'democratic-consent'));
  assert.ok(factHtml?.includes('Fact body.'), factHtml);
  assert.ok(principleHtml?.includes('Principle body.'), principleHtml);
  assert.notEqual(factHtml, principleHtml);
});

test('items with distinct ids across all four kinds each get their own body', async () => {
  const topic = {
    facts: [{ id: 'a', body: 'fact a' }],
    viewpoints: [{ id: 'a', body: 'viewpoint a' }],
    principles: [{ id: 'a', body: 'principle a' }],
    cruxes: [{ id: 'a', body: 'crux a' }],
  };
  const bodies = await buildBodies(topic);
  assert.equal(bodies.size, 4);
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
    principles: [{ id: 'p', name: 'P', heldBy: ['one'], body: '' }],
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
 * The Facts list is headline facts only: a supporting fact is evidence for a
 * larger claim and reads inside it, not beside it. Its `#fact-<id>` anchor is
 * a permanent address a viewpoint chip may point at, so it has to survive the
 * move inwards.
 */
test('a supporting fact renders inside its parent, not as a top-level row', () => {
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

  // One top-level fact row, and the child is not one of them.
  assert.equal(html.match(/class="sv-item sv-fact"/g)?.length, 1);
  assert.match(html, /id="fact-parent"/);
  // The child keeps its anchor, and sits inside the parent's body.
  assert.match(html, /id="fact-child"/);
  assert.match(html, /class="sv-item sv-subfact"/);
  assert.ok(
    html.indexOf('id="fact-child"') > html.indexOf('id="fact-parent"'),
    'the child must render within the parent it supports'
  );
  assert.match(html, /Supporting fact</);
});
