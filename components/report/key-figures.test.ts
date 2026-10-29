import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KeyFigures } from './key-figures';

test('a qualifier is printed before the value, in the same cell', () => {
  const html = renderToStaticMarkup(createElement(KeyFigures, {
    figures: [{ value: 7200, qualifier: 'more than', label: 'signatures re-examined', period: '2020' }],
  }));
  assert.match(html, /<dd class="sv-key-figures__value"><span class="sv-key-figures__qualifier">more than <\/span>7,200<\/dd>/);
});

test('a figure without a qualifier is unchanged', () => {
  const html = renderToStaticMarkup(createElement(KeyFigures, {
    figures: [{ value: 98.7, format: { unit: 'percent', decimals: 1 }, label: 'judged appropriate', period: '2020' }],
  }));
  assert.match(html, /<dd class="sv-key-figures__value">98.7%<\/dd>/);
});
