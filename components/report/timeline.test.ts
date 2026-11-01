import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timeline } from './timeline';

test('approximate dates are shown as written, under their own heading, before the exact dates they cover', () => {
  const html = renderToStaticMarkup(createElement(Timeline, {
    categories: [{ id: 'law', label: 'Law' }],
    events: [
      { date: '1851-03', title: 'An exact event', category: 'law' },
      { date: 'c. 1888', title: 'A circa event', category: 'law' },
      { date: '1850s', title: 'A decade event', category: 'law' },
      { date: '1888', title: 'A dated event', category: 'law' },
    ],
  }));
  const headings = [...html.matchAll(/<h3 class="sv-timeline__year-head">([^<]+)<\/h3>/g)].map(m => m[1]);
  assert.deepEqual(headings, ['1850s', '1851', 'c. 1888', '1888']);
  // Only an exact date is a machine-readable <time>.
  assert.match(html, /<p class="sv-timeline__date"><span>1850s<\/span>/);
  assert.match(html, /<p class="sv-timeline__date"><span>c\. 1888<\/span>/);
  assert.match(html, /<time dateTime="1851-03">Mar 1851<\/time>/);
});
