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

// Regression coverage for the false-positive bug: a figure genuinely quoted
// verbatim was reported as unmatched purely because of what sat next to it
// inside the quote (punctuation, another number, or a line wrap), because
// the old implementation stripped all whitespace and substring-searched a
// single blob, so anything non-digit-non-dot adjacent to the figure read as
// "still part of the number".

test('a full stop immediately after a figure in its own quote does not break the match', () => {
  const corpus = quoteCorpus(['whilst for the other occupations it is +£166,000. Care workers are...']);
  assert.equal(quotedSomewhere('£166,000', corpus), true);
});

test('a comma, closing parenthesis or quote mark immediately after a figure does not break the match', () => {
  assert.equal(quotedSomewhere('£166,000', quoteCorpus(['the estimate was £166,000, according to the report'])), true);
  assert.equal(quotedSomewhere('£166,000', quoteCorpus(['the estimate (£166,000) was disputed'])), true);
  assert.equal(quotedSomewhere('£166,000', quoteCorpus(['described as "£166,000" in the filing'])), true);
});

test('a figure immediately followed by an unrelated digit in running prose still matches', () => {
  // The actual bug that shipped: "Age band ... £22,300 30-39 £28,000 ..." —
  // stripping all whitespace before searching fused "£22,300" with the "30"
  // that starts the next age band, so the genuine quote read as unmatched.
  const corpus = quoteCorpus(['Age band fiscal breakeven estimate 18-29 £22,300 30-39 £28,000 40-49 £32,300']);
  assert.equal(quotedSomewhere('£22,300', corpus), true);
  assert.equal(quotedSomewhere('£28,000', corpus), true);
  assert.equal(quotedSomewhere('£32,300', corpus), true);
});

test('a figure is not matched by a quote that only contains a longer number sharing its digits', () => {
  // The inverse of the case above: £22,300 must not be considered quoted
  // merely because the corpus contains £122,300.
  const corpus = quoteCorpus(['the record year saw £122,300 spent per claimant']);
  assert.equal(quotedSomewhere('£22,300', corpus), false);
  assert.equal(quotedSomewhere('£122,300', corpus), true);
});

test('a quote split across YAML lines still matches, including mid-quote punctuation', () => {
  const corpus = quoteCorpus([
    'contracts costed at £4.5 billion over ten years are now expected to\ncost £15.3\n  billion, driven by hotel use.',
  ]);
  assert.equal(quotedSomewhere('£4.5 billion', corpus), true);
  assert.equal(quotedSomewhere('£15.3 billion', corpus), true);
});

test('non-breaking or unusual whitespace inside a quoted figure still matches', () => {
  const corpus = quoteCorpus(['the contracts are now expected to cost £15.3 billion in total']);
  assert.equal(quotedSomewhere('£15.3 billion', corpus), true);
});

test('a unit-word figure is not treated as equivalent to a fully digit-grouped restatement', () => {
  // Deliberate choice: "£2.2 million" in prose is not considered sourced by
  // a quote that only ever writes "£2,200,000" (or vice versa). Equating
  // them would mean parsing numeric magnitude out of arbitrary text, which
  // risks matching figures that merely share a value by coincidence.
  const corpus = quoteCorpus(['the total came to £2,200,000 across the period']);
  assert.equal(quotedSomewhere('£2.2 million', corpus), false);
});

test('a unit-word figure matches a quote that restates it the same way', () => {
  const corpus = quoteCorpus(['average lifetime contribution of £2.2 million. This accounts for 39% of the total.']);
  assert.equal(quotedSomewhere('£2.2 million', corpus), true);
});
