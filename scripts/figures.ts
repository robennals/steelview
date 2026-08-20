/**
 * The figure-matching logic behind `check-figures.ts`, kept pure and separate
 * so the normalisation — which is the subtle part — has unit tests.
 */

/**
 * Money, then percentages, then plain thousands — in that order, because the
 * alternation is tried left to right at each position and money must consume
 * its own `£` and digits before the thousands branch can re-match them.
 *
 * Each numeric run ends on a digit (`\d(?:[\d,]*\d)?`) so a sentence comma
 * after a figure is not swallowed into it: `£84,000, because` is `£84,000`.
 *
 * The thousands branch requires a comma group (`46,500`), which is what keeps
 * years, ordinals and bare small integers out of the report. They are not
 * figures anyone can cherry-pick, and matching them would bury the findings.
 */
export const FIGURE =
  /£\s?\d(?:[\d,]*\d)?(?:\.\d+)?(?:\s*(?:billion|bn|million|mn|trillion|tn|thousand|m|k)\b)?|\d(?:[\d,]*\d)?(?:\.\d+)?\s*%|\b\d{1,3}(?:,\d{3})+(?:\s*(?:billion|bn|million|mn|trillion|tn|thousand)\b)?/gi;

/**
 * Reduce a figure — or a whole body of quoted text — to a form where trivial
 * differences cannot cause a false miss:
 *
 * - all whitespace removed, so a quote broken across source lines still
 *   matches a figure written inline ("£15.3\n  billion" -> "£15.3bn");
 * - thousands separators removed, so `46,500` matches `46500`;
 * - scale words folded onto one spelling, so `£15.3 billion` matches `£15.3bn`.
 */
export function canonical(text: string): string {
  return text
    .toLowerCase()
    .replace(/[   ]/g, ' ')
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/(\d),(\d{3})/g, '$1$2') // twice: 1,234,567 has overlapping groups
    .replace(/\s+/g, '')
    .replace(/billion/g, 'bn')
    .replace(/trillion/g, 'tn')
    .replace(/million/g, 'mn')
    .replace(/thousand/g, 'k')
    .replace(/(\d)m(?!n)/g, '$1mn');
}

/** Every money / percentage / thousands figure in `text`, as written. */
export function figuresIn(text: string): string[] {
  return (text.match(FIGURE) ?? []).map((f) => f.trim());
}

/**
 * A looser cousin of `FIGURE`, used only to tokenise *quotes*.
 *
 * Quotes are free to write a plain thousands figure without a comma
 * (`46500`), so — unlike `FIGURE` — the comma group here is optional, not
 * required. That does mean this also matches bare years and small integers
 * (`18`, `2024`), but that is harmless: `figuresIn` never produces a bare
 * small integer as a needle (money needs `£`, thousands need a comma group,
 * percentages need `%`), so a stray token like `18` can never accidentally
 * satisfy a real figure.
 *
 * Matching a maximal digit run this way — rather than stripping all
 * whitespace first and substring-searching — is what keeps number
 * boundaries intact: in a quote like `£22,300 30-39 £28,000`, the space
 * before `30-39` stops the match, so `£22,300` is never fused with the
 * digits that happen to sit next to it in running prose.
 */
const QUOTE_NUMBER =
  /£?\d(?:[\d,]*\d)?(?:\.\d+)?(?:\s*(?:billion|bn|million|mn|trillion|tn|thousand|m|k)\b)?\s*%?/gi;

/**
 * The set of figures — each in `canonical` form — found in a topic's quotes.
 * Comparing a body figure against this set (exact membership, not substring
 * search) is what makes the match immune to whatever punctuation, sentence
 * digits, or line-wrapping happen to sit next to the figure inside its quote.
 */
export type QuoteCorpus = ReadonlySet<string>;

/**
 * Is `figure` present in the quote corpus as a figure in its own right,
 * rather than as a fragment of a longer number? `500` must not count as
 * matched because the corpus happens to contain `1,500`; `£22,300` must not
 * count as matched because the corpus happens to contain `£122,300` — both
 * are excluded by construction, because the corpus only ever holds whole
 * tokens, never substrings of them.
 *
 * This does not attempt to equate a unit-word figure with an equivalent
 * digit-grouped one (`£2.2 million` vs `£2,200,000`): doing that would mean
 * parsing arbitrary numeric magnitudes, which risks matching figures that
 * only coincidentally share a value, for a case that has not come up in
 * practice. A quote restating the same figure should restate it recognisably.
 */
export function quotedSomewhere(figure: string, corpus: QuoteCorpus): boolean {
  const needle = canonical(figure);
  if (needle.length === 0) return true;
  return corpus.has(needle);
}

/** Every string under a `quote` key, anywhere in a frontmatter tree. */
export function collectQuotes(node: unknown, into: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) collectQuotes(item, into);
    return into;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'quote' && typeof value === 'string') into.push(value);
      else collectQuotes(value, into);
    }
  }
  return into;
}

/** The set of canonical figure tokens found across every quote on a topic. */
export function quoteCorpus(quotes: readonly string[]): QuoteCorpus {
  const tokens = new Set<string>();
  for (const quote of quotes) {
    for (const match of quote.match(QUOTE_NUMBER) ?? []) {
      const token = canonical(match);
      if (token.length > 0) tokens.add(token);
    }
  }
  return tokens;
}
