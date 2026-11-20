import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { highlightQuote } from '@/lib/content/quote-highlight';
import { QuoteText } from './quote-text';

const html = (quote: string, finding = '') => renderToStaticMarkup(createElement(QuoteText, { parts: highlightQuote(quote, finding) }));

test('a quote is laid out as its source sets it: paragraphs, bullets and line breaks', () => {
  assert.equal(
    html('First paragraph.\n\nThe main routes were:\n- Iran (16%)\n- Afghanistan (14%)\n\nLast line one\nLast line two'),
    '<p><span><span>First paragraph.</span></span></p>'
    + '<p><span><span>The main routes were:</span></span></p>'
    + '<ul><li><span>Iran (16%)</span></li><li><span>Afghanistan (14%)</span></li></ul>'
    + '<p><span><span>Last line one</span></span><span><br/><span>Last line two</span></span></p>',
  );
});

test('a block of rows split by bars is a table, its first row the header', () => {
  const out = html('Date | Planned | Removed\nSeptember 2016 | 144 | 42');
  assert.match(out, /<table><thead><tr><th scope="col"><span>Date<\/span><\/th><th scope="col"><span>Planned<\/span><\/th>/);
  assert.match(out, /<tbody><tr><td><span>September 2016<\/span><\/td><td><span>144<\/span><\/td><td><span>42<\/span><\/td><\/tr><\/tbody>/);
});

test('a bullet stating the finding\'s figure is picked out on its own', () => {
  const out = html('Nationals of six countries:\n- Iran (16%)\n- Afghanistan (14%)', 'Afghans were 14% of arrivals.');
  assert.match(out, /<li><span>Iran \(16%\)<\/span><\/li><li><mark>Afghanistan \(14%\)<\/mark><\/li>/);
});
