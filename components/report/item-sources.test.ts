import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CaveatList } from './caveat-list';
import { CompositionBar } from './composition-bar';
import { compose } from './composition';

const hengaw = { label: 'Hengaw', href: '#source-x-13', number: 13 };

test('a composition row keeps its own source through compose, and only when it has one', () => {
  const { rows } = compose([{ key: 'a', label: 'A' }], [{ label: 'r', values: { a: 1 }, source: hengaw }, { label: 's', values: { a: 2 } }]);
  assert.deepEqual(rows[0].source, hengaw);
  assert.equal('source' in rows[1], false);
});

test('a composition row\'s source is printed after its label, in the bar and in the table', () => {
  const html = renderToStaticMarkup(createElement(CompositionBar, {
    categories: [{ key: 'civilian', label: 'Civilian' }, { key: 'other', label: 'Other' }],
    rows: [{ label: 'Hengaw, 8 Apr', values: { civilian: 1030, other: 6620 }, source: hengaw }],
  }));
  assert.equal(html.match(/Hengaw, 8 Apr<span class="sv-item-credit"><span><a href="#source-x-13">Hengaw \[13\]<\/a><\/span><\/span>/g)?.length, 2);
});

test('a caveat\'s sources are printed after why', () => {
  const html = renderToStaticMarkup(createElement(CaveatList, {
    items: [{ measure: 'Household pressure', why: 'Rarely reported.', sources: [{ label: 'Brennan Center', href: '#source-x-24', number: 24 }] }],
  }));
  assert.match(html, /Rarely reported\.<span class="sv-item-credit"><span><a href="#source-x-24">Brennan Center \[24\]<\/a><\/span><\/span>/);
});
