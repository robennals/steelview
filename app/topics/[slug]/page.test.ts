import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopicSections } from './page';
import type { Topic } from '@/lib/content/types';

/**
 * Regression test for shipping an empty heading: a topic with no cruxes (a
 * legal shape — `cruxes/` need not exist) must not render a "Cruxes" heading
 * with nothing under it.
 */
test('a section with no items renders no heading for that section', () => {
  const topic: Topic = {
    slug: 'bare',
    title: 'Bare',
    subtitle: 'Sub',
    lastUpdated: '2026-08-18',
    firstPublished: '2026-08-18',
    intro: 'Intro.',
    facts: [{ id: 'a', claim: 'A', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [
      {
        id: 'one',
        name: 'One',
        summary: 's',
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        body: '',
      },
      {
        id: 'two',
        name: 'Two',
        summary: 's',
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        body: '',
      },
    ],
    cruxes: [],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, walkthroughs: new Map(), featured: new Map() }));
  assert.match(html, /Viewpoints/);
  assert.doesNotMatch(html, /Cruxes/);
});

test('a section with items renders its heading', () => {
  const topic: Topic = {
    slug: 'full',
    title: 'Full',
    subtitle: 'Sub',
    lastUpdated: '2026-08-18',
    firstPublished: '2026-08-18',
    intro: 'Intro.',
    facts: [{ id: 'a', claim: 'A', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [
      {
        id: 'one',
        name: 'One',
        summary: 's',
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        body: '',
      },
      {
        id: 'two',
        name: 'Two',
        summary: 's',
        citesFacts: [],
        acknowledges: ['a'],
        setsAside: [],
        body: '',
      },
    ],
    cruxes: [
      {
        id: 'timing',
        title: 'Q?',
        tension: 'T.',
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
  const html = renderToStaticMarkup(TopicSections({ topic, walkthroughs: new Map(), featured: new Map() }));
  assert.doesNotMatch(html, />Data<\/h2>/);
  assert.match(html, /Viewpoints/);
  assert.match(html, /Cruxes/);
});

test('the page has no tabs: the cruxes follow the viewpoints', () => {
  const viewpoint = {
    id: 'one', name: 'One view', summary: 's',
    citesFacts: [], acknowledges: ['a'], setsAside: [], body: '',
  };
  const topic: Topic = {
    slug: 'crux', title: 'Crux', subtitle: 'Sub', lastUpdated: '2026-08-18', firstPublished: '2026-08-18', intro: '',
    facts: [{ id: 'a', claim: 'A claim', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [viewpoint, { ...viewpoint, id: 'two', name: 'Two view' }],
    cruxes: [{ id: 'timing', title: 'When?', tension: 'Soon or late.', kind: 'prediction', divides: ['one', 'two'], positions: [{ viewpoint: 'one', holds: 'Soon.' }, { viewpoint: 'two', holds: 'Later.' }], body: '' }],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, walkthroughs: new Map(), featured: new Map() }));
  assert.doesNotMatch(html, /data-tab="/);
  assert.ok(html.indexOf('>Viewpoints</h2>') < html.indexOf('>Cruxes</h2>'), html);
});

test('a crux is a row: its tension closed, and what each side holds under its name', () => {
  const viewpoint = {
    citesFacts: [], acknowledges: ['a'], setsAside: [], body: '', summary: 'A summary.',
  };
  const topic: Topic = {
    slug: 't', title: 'T', subtitle: 'S', lastUpdated: '2026-08-18', firstPublished: '2026-08-18',
    intro: '', tags: [], facts: [],
    viewpoints: [
      { ...viewpoint, id: 'one', name: 'One view' },
      { ...viewpoint, id: 'two', name: 'Two view' },
    ],
    cruxes: [
      {
        id: 'timing',
        title: 'Speed and care',
        tension: 'Both matter, and hurrying costs care.',
        kind: 'tradeoff',
        divides: ['one', 'two'],
        positions: [
          { viewpoint: 'one', holds: 'Soon.' },
          { viewpoint: 'two', holds: 'Later.' },
        ],
        body: '',
      },
    ],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, walkthroughs: new Map(), featured: new Map() }));
  assert.match(html, /<article id="crux-timing" class="sv-row sv-row--crux"/);
  assert.match(html, /sv-tag">Tension between principles</);
  assert.match(html, /sv-row__title">Speed and care</);
  assert.match(html, /sv-row__subtitle">Both matter, and hurrying costs care\.</);
  assert.match(html, /<dt>One view<\/dt>/);
  assert.match(html, /<dt>Two view<\/dt>/);
  assert.match(html, /<dd>Soon\.<\/dd>/);
});

test('a viewpoint\'s row is titled with its name, its summary under it', () => {
  const viewpoint = {
    id: 'one', name: 'One', summary: 'A one-line summary.',
    citesFacts: [], acknowledges: ['a'], setsAside: [], body: '',
  };
  const topic: Topic = {
    slug: 'ordered', title: 'Ordered', subtitle: 'Sub', lastUpdated: '2026-08-18', firstPublished: '2026-08-18', intro: '',
    facts: [{ id: 'a', claim: 'A', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [viewpoint, { ...viewpoint, id: 'two', name: 'Two' }],
    cruxes: [],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, walkthroughs: new Map(), featured: new Map() }));
  assert.match(html, />Viewpoints<\/h2>/);
  assert.match(html, /sv-row__title">One<\/h2><p class="sv-row__subtitle">A one-line summary\.<\/p>/);
});

/**
 * A data collection is not on the page: no row, no heading, none of its text.
 * Only the charts a viewpoint's card is made with are, and those only open in
 * full over the page.
 */
test('a data collection has no row on the topic page', () => {
  const viewpoint = {
    id: 'one', name: 'One', summary: 's',
    citesFacts: [], acknowledges: ['a'], setsAside: [], body: '',
  };
  const topic: Topic = {
    slug: 'bare', title: 'Bare', subtitle: 'Sub', lastUpdated: '2026-08-18', firstPublished: '2026-08-18', intro: '',
    facts: [{ id: 'a', claim: 'Claim a', status: 'well-supported', sources: [], body: '' }],
    viewpoints: [viewpoint, { ...viewpoint, id: 'two', name: 'Two' }],
    cruxes: [],
  };
  const html = renderToStaticMarkup(TopicSections({ topic, walkthroughs: new Map(), featured: new Map() }));
  assert.doesNotMatch(html, /sv-row--data/);
  assert.doesNotMatch(html, /id="fact-/);
  assert.doesNotMatch(html, /Claim a/);
});
