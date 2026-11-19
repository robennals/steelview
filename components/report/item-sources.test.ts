import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CaveatList } from './caveat-list';
import { CompositionBar } from './composition-bar';
import { compose } from './composition';

const hengaw = { label: 'Hengaw', href: '#source-x-13', number: 13 };

test('a composition row keeps its own source through compose, and only when it has one', () => {
  const { rows } = compose([{ key: 'a', label: 'A' }], [{ label: 'r', values: { a: 1 }, sources: [hengaw] }, { label: 's', values: { a: 2 } }]);
  assert.deepEqual(rows[0].sources, [hengaw]);
  assert.equal('sources' in rows[1], false);
});

test('a composition row\'s source is printed after its label, in the bar and in the table', () => {
  const html = renderToStaticMarkup(createElement(CompositionBar, {
    categories: [{ key: 'civilian', label: 'Civilian' }, { key: 'other', label: 'Other' }],
    rows: [{ label: 'Hengaw, 8 Apr', values: { civilian: 1030, other: 6620 }, sources: [hengaw] }],
  }));
  assert.equal(html.match(/Hengaw, 8 Apr<span class="sv-item-credit"><span><a href="#source-x-13">Hengaw \[13\]<\/a><\/span><\/span>/g)?.length, 2);
});

test('a caveat\'s sources are printed after why', () => {
  const html = renderToStaticMarkup(createElement(CaveatList, {
    items: [{ measure: 'Household pressure', why: 'Rarely reported.', sources: [{ label: 'Brennan Center', href: '#source-x-24', number: 24 }] }],
  }));
  assert.match(html, /Rarely reported\.<span class="sv-item-credit"><span><a href="#source-x-24">Brennan Center \[24\]<\/a><\/span><\/span>/);
});

test('percentages print as published, not as recomputed shares; counts print their shares', () => {
  const parts = { categories: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }] };
  const percent = renderToStaticMarkup(createElement(CompositionBar, { ...parts, unit: 'percent', rows: [{ label: 'r', values: { a: 33.3, b: 33.3, c: { value: 33.3, qualifier: 'about' } } }] }));
  assert.match(percent, /<span class="sv-composition__segment-share">33\.3%<\/span>/);
  assert.match(percent, /<span class="sv-composition__segment-share">about 33\.3%<\/span>/);
  assert.match(percent, /<td>33\.3%<\/td>/);
  const counts = renderToStaticMarkup(createElement(CompositionBar, { ...parts, rows: [{ label: 'r', values: { a: 1, b: 1, c: 2 } }] }));
  assert.match(counts, /<span class="sv-composition__segment-share">25%<\/span>/);
});

test('rows drawn to scale open to their own split at full width; a row\'s source moves out of the clickable summary', () => {
  const categories = [{ key: 'boat', label: 'Small boat' }, { key: 'ukraine', label: 'Ukraine schemes' }, { key: 'family', label: 'Family reunion' }];
  const html = renderToStaticMarkup(createElement(CompositionBar, {
    categories,
    showCounts: true,
    rows: [
      { label: 'Albania', values: { boat: 181, ukraine: 0, family: 4 }, sources: [hengaw] },
      { label: 'Eritrea', values: { boat: 5875, family: 948 } },
    ],
  }));
  assert.equal(html.match(/<details class="sv-row-detail">/g)?.length, 2);
  assert.match(html, /Select a row for its details/);
  // Albania's bar is drawn to scale in the summary, and at full width when opened.
  const albania = html.slice(html.indexOf('data-row="Albania"'), html.indexOf('data-row="Eritrea"'));
  assert.match(albania, /<summary[^>]*>[\s\S]*class="sv-composition__bar" style="width:2\.7\d*%"[\s\S]*<\/summary>/);
  assert.match(albania, /<div class="sv-row-detail__body">[\s\S]*class="sv-composition__bar" style="width:100%"/);
  assert.match(albania, /Small boat: 97\.8% \(181\)/);
  assert.doesNotMatch(albania.slice(albania.indexOf('sv-composition__detail-parts')), /Ukraine/);
  // The source link is in the opened part, not the summary.
  const summary = albania.slice(albania.indexOf('<summary'), albania.indexOf('</summary>'));
  assert.doesNotMatch(summary, /#source-x-13/);
  assert.match(albania, /sv-composition__detail-sources">Source: <span class="sv-item-credit"><span><a href="#source-x-13">/);
});

test('rows that are all full length, as percentages always are, do not open', () => {
  const html = renderToStaticMarkup(createElement(CompositionBar, {
    categories: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    unit: 'percent',
    rows: [{ label: 'r', values: { a: 40, b: 60 } }, { label: 's', values: { a: 79, b: 19 } }],
  }));
  assert.doesNotMatch(html, /sv-row-detail/);
  assert.doesNotMatch(html, /Select a row/);
});
