/**
 * The figure-matching logic behind `check-figures.ts`, kept pure and separate
 * so the normalisation — which is the subtle part — has unit tests.
 */

/**
 * Money, then percentages, then plain thousands — in that order, because the
 * alternation is tried left to right at each position and money must consume
 * its own currency symbol and digits before the thousands branch can re-match
 * them.
 *
 * Money is pounds, dollars or euros (`£`, `$`, `€`), so the US topics' dollar
 * figures are checked like the UK ones. A percentage may be written with the
 * sign or in words — `1.4%`, `1.4 percent`, `1.4 per cent` — because US
 * sources and reports write "percent" and every form must be extracted.
 *
 * Each numeric run ends on a digit (`\d(?:[\d,]*\d)?`) so a sentence comma
 * after a figure is not swallowed into it: `£84,000, because` is `£84,000`.
 *
 * The thousands branch requires a comma group (`46,500`), which is what keeps
 * years, ordinals and bare small integers out of the report. They are not
 * figures anyone can cherry-pick, and matching them would bury the findings.
 */
export const FIGURE =
  /[£$€]\s?\d(?:[\d,]*\d)?(?:\.\d+)?(?:\s*(?:billion|bn|million|mn|trillion|tn|thousand|m|k)\b)?|\d(?:[\d,]*\d)?(?:\.\d+)?\s*(?:%|percent\b|per\s?cent\b)|\b\d{1,3}(?:,\d{3})+(?:\s*(?:billion|bn|million|mn|trillion|tn|thousand)\b)?/gi;

/**
 * Reduce a figure — or a whole body of quoted text — to a form where trivial
 * differences cannot cause a false miss:
 *
 * - all whitespace removed, so a quote broken across source lines still
 *   matches a figure written inline ("£15.3\n  billion" -> "£15.3bn");
 * - thousands separators removed, so `46,500` matches `46500`;
 * - scale words folded onto one spelling, so `£15.3 billion` matches `£15.3bn`;
 * - percent words folded onto the sign, so `1.4 percent` matches `1.4%`;
 * - trailing decimal zeros dropped, so `1.0%` matches `1%` and `2.50` matches
 *   `2.5` — the same number, printed to a different precision.
 *
 * Currency symbols are kept: `$5` and `£5` are different figures.
 */
export function canonical(text: string): string {
  return text
    .toLowerCase()
    .replace(/(\d)\s*(?:per\s?cent|percent|pct)\b/g, '$1%')
    .replace(/[   ]/g, ' ')
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/(\d),(\d{3})/g, '$1$2') // twice: 1,234,567 has overlapping groups
    .replace(/(\d)\.(\d+)/g, (_, whole: string, fraction: string) => {
      const kept = fraction.replace(/0+$/, '');
      return kept ? `${whole}.${kept}` : whole;
    })
    .replace(/\s+/g, '')
    .replace(/billion/g, 'bn')
    .replace(/trillion/g, 'tn')
    .replace(/million/g, 'mn')
    .replace(/thousand/g, 'k')
    .replace(/(\d)m(?!n)/g, '$1mn');
}

/**
 * A money range with one scale word, `$2–3 billion` or `$25 and $35 billion`,
 * means that scale at both ends. Writing it out on each number lets both forms
 * match a source that states the ends separately.
 */
const SCALED_RANGE =
  /([£$€])(\d(?:[\d,]*\d)?(?:\.\d+)?)(\s*(?:–|—|-|to|and)\s*)[£$€]?(\d(?:[\d,]*\d)?(?:\.\d+)?)\s*(billion|bn|million|mn|trillion|tn|thousand|m|k)\b/gi;

function spreadScale(text: string): string {
  return text.replace(SCALED_RANGE, '$1$2 $5$3$1$4 $5');
}

/** Every money / percentage / thousands figure in `text`, with a range's scale on both ends. */
export function figuresIn(text: string): string[] {
  return (spreadScale(text).match(FIGURE) ?? []).map((f) => f.trim());
}

/**
 * A looser cousin of `FIGURE`, used only to tokenise *quotes*.
 *
 * Quotes are free to write a plain thousands figure without a comma
 * (`46500`), so — unlike `FIGURE` — the comma group here is optional, not
 * required. That does mean this also matches bare years and small integers
 * (`18`, `2024`), but that is harmless: `figuresIn` never produces a bare
 * small integer as a needle (money needs a currency symbol, thousands need a
 * comma group, percentages need `%` or a percent word), so a stray token like `18` can never accidentally
 * satisfy a real figure.
 *
 * Matching a maximal digit run this way — rather than stripping all
 * whitespace first and substring-searching — is what keeps number
 * boundaries intact: in a quote like `£22,300 30-39 £28,000`, the space
 * before `30-39` stops the match, so `£22,300` is never fused with the
 * digits that happen to sit next to it in running prose.
 */
const QUOTE_NUMBER =
  /[£$€]?\d(?:[\d,]*\d)?(?:\.\d+)?(?:\s*(?:billion|bn|million|mn|trillion|tn|thousand|m|k)\b)?(?:\s*(?:%|percent\b|per\s?cent\b|pct\b))?/gi;

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

/** A table quote's bare numbers, restated in the unit its source declares. */
function withUnit(quote: string, unit: unknown): string[] {
  if (unit !== '$' && unit !== '%') return [];
  const numbers = quote.match(/\d(?:[\d,]*\d)?(?:\.\d+)?/g) ?? [];
  return [numbers.map((n) => (unit === '$' ? `$${n}` : `${n}%`)).join(' ')];
}

/**
 * Every string under a `quote` key, anywhere in a frontmatter tree, plus the
 * unit-bearing restatement of any quote whose source sets `quoteUnit`.
 */
export function collectQuotes(node: unknown, into: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) collectQuotes(item, into);
    return into;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'quote' && typeof value === 'string') {
        into.push(value, ...withUnit(value, 'quoteUnit' in node ? node.quoteUnit : undefined));
      } else collectQuotes(value, into);
    }
  }
  return into;
}

/** The set of canonical figure tokens found across every quote on a topic. */
export function quoteCorpus(quotes: readonly string[]): QuoteCorpus {
  const tokens = new Set<string>();
  for (const quote of quotes) {
    for (const match of spreadScale(quote).match(QUOTE_NUMBER) ?? []) {
      const token = canonical(match);
      if (token.length > 0) tokens.add(token);
    }
  }
  return tokens;
}
