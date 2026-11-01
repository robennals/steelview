import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KeyFigures } from './key-figures';

test('a qualifier is printed before the value, in the same cell', () => {
  const html = renderToStaticMarkup(createElement(KeyFigures, {
    figures: [{ value: { value: 7200, qualifier: 'more than' }, label: 'signatures re-examined', period: '2020' }],
  }));
  assert.match(html, /<dd class="sv-key-figures__value"><span class="sv-key-figures__qualifier">more than <\/span>7,200<\/dd>/);
});

test('a figure without a qualifier is unchanged', () => {
  const html = renderToStaticMarkup(createElement(KeyFigures, {
    figures: [{ value: 98.7, format: { unit: 'percent', decimals: 1 }, label: 'judged appropriate', period: '2020' }],
  }));
  assert.match(html, /<dd class="sv-key-figures__value">98.7%<\/dd>/);
});

test('a published range is written once, with its unit after the high end', () => {
  const html = renderToStaticMarkup(createElement(KeyFigures, {
    figures: [{ value: { low: 4, high: 6, asPublished: 'between 4 and 6 per cent' }, format: { unit: 'percent', decimals: 0 }, label: 'of claims', period: '2024' }],
  }));
  assert.match(html, /<dd class="sv-key-figures__value">4–6%<\/dd>/);
});

test('every citation of a figure is a mark after its period', () => {
  const html = renderToStaticMarkup(createElement(KeyFigures, {
    figures: [{ value: 1, label: 'x', period: '2020', sources: [{ label: 'A', href: '#a', number: 3 }, { label: 'B', href: '#b', number: 9 }] }],
  }));
  assert.match(html, /\[3\]<\/a><\/span><span> <a class="sv-key-figures__source" href="#b" aria-label="Source: B \[9\]">\[9\]/);
});
