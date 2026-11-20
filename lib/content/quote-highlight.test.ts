import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highlightQuote } from './quote-highlight';

const picked = (parts: ReturnType<typeof highlightQuote>) => parts.filter(part => part.key).map(part => part.text.trim());

test('the sentences stating a figure the finding states are picked out, however the figure is written', () => {
  const quote = 'Background on the series. Net migration was 944,000 in the year to March 2023. It then fell to 171 thousand. The rate was 38 per cent.';
  const parts = highlightQuote(quote, 'Net migration peaked at 944,000, and the grant rate fell to 38%.');
  assert.deepEqual(picked(parts), ['Net migration was 944,000 in the year to March 2023.', 'The rate was 38 per cent.']);
  // The runs join back into the quote, word for word.
  assert.equal(parts.map(part => part.text).join(''), quote);
});

test('without a shared figure, the one sentence sharing most distinctive words is picked out', () => {
  const quote = 'The report covers several topics. Most returns from the United Kingdom were voluntary departures without enforcement. Other sections cover detention.';
  assert.deepEqual(picked(highlightQuote(quote, 'Most returns are voluntary departures, not enforced removals from the United Kingdom.')), ['Most returns from the United Kingdom were voluntary departures without enforcement.']);
});

test('a quote that matches too little, or is one sentence, is picked out nowhere', () => {
  assert.deepEqual(picked(highlightQuote('Weather was mild. Crops grew well.', 'Asylum claims rose sharply.')), []);
  assert.deepEqual(highlightQuote('Net migration was 944,000.', 'Net migration was 944,000.'), [{ text: 'Net migration was 944,000.', key: false }]);
});

test('a quoted sentence ends at its closing quotation mark', () => {
  const quote = '“The figure was 12%.” Then other things happened. And more.';
  assert.deepEqual(picked(highlightQuote(quote, 'It was 12%.')), ['“The figure was 12%.”']);
});
