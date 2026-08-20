import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonical, collectQuotes, figuresIn, quoteCorpus, quotedSomewhere } from './figures';

test('extracts money, percentages and comma-grouped thousands', () => {
  assert.deepEqual(
    figuresIn('It cost £15.3 billion, or £4,500 a head — 5.7% of 46,500 people.'),
    ['£15.3 billion', '£4,500', '5.7%', '46,500']
  );
});

test('does not extract years, ordinals or bare small integers', () => {
  // These are the patterns the audit deliberately ignores: matching them
  // would bury the real findings under noise nobody can cherry-pick with.
  assert.deepEqual(figuresIn('In 2024 the third of five routes took 900 people.'), []);
});

test('a figure does not swallow the sentence comma after it', () => {
  assert.deepEqual(figuresIn('worth £84,000, and no more'), ['£84,000']);
  assert.deepEqual(figuresIn('worth 46,500, and no more'), ['46,500']);
});

test('a line-wrapped quote still matches a figure written inline', () => {
  const corpus = quoteCorpus(['the contracts are now expected to cost £15.3\n      billion in total']);
  assert.equal(quotedSomewhere('£15.3 billion', corpus), true);
});

test('thousands separators and scale words are normalised away', () => {
  const corpus = quoteCorpus(['46500 arrivals were detected', 'a cost of £15.3bn']);
  assert.equal(quotedSomewhere('46,500', corpus), true);
  assert.equal(quotedSomewhere('£15.3 billion', corpus), true);
});

test('a figure that is only a fragment of a longer number does not count as quoted', () => {
  // The whole point of the audit is that "500" in prose is not sourced by a
  // quote that happens to say "1,500".
  const corpus = quoteCorpus(['the figure was 1,500 in that year']);
  assert.equal(quotedSomewhere('500', corpus), false);
  assert.equal(quotedSomewhere('1,500', corpus), true);
});

test('a decimal is not matched by its integer part', () => {
  const corpus = quoteCorpus(['the rate was 13.5% of adults']);
  assert.equal(quotedSomewhere('13%', corpus), false);
  assert.equal(quotedSomewhere('13.5%', corpus), true);
});

test('an unquoted figure is reported', () => {
  const corpus = quoteCorpus(['net migration was 728,000']);
  assert.equal(quotedSomewhere('£166,000', corpus), false);
});

test('collectQuotes finds quotes at any depth, including a future series source', () => {
  const frontmatter = {
    claim: 'A claim',
    sources: [{ quote: 'from a source' }],
    // The `series` field is a later round; the audit must pick its quoted
    // source up without being changed when it lands.
    series: { source: { quote: 'from the series source' } },
  };
  assert.deepEqual(collectQuotes(frontmatter), ['from a source', 'from the series source']);
});

test('canonical folds case, separators and scale words onto one form', () => {
  assert.equal(canonical('£15.3 Billion'), '£15.3bn');
  assert.equal(canonical('1,469,000'), '1469000');
  assert.equal(canonical('£4.5m'), '£4.5mn');
});
