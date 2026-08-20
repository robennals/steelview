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
 * Is `figure` present in the canonicalised quote corpus as a figure in its own
 * right, rather than as a fragment of a longer number? `500` must not count as
 * matched because the corpus happens to contain `1,500`.
 */
export function quotedSomewhere(figure: string, corpus: string): boolean {
  const needle = canonical(figure);
  if (needle.length === 0) return true;
  for (let at = corpus.indexOf(needle); at !== -1; at = corpus.indexOf(needle, at + 1)) {
    const before = at === 0 ? '' : corpus[at - 1];
    const after = corpus[at + needle.length] ?? '';
    if (!/[\d.]/.test(before) && !/[\d.]/.test(after)) return true;
  }
  return false;
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

/** The canonical searchable form of every quote on a topic. */
export function quoteCorpus(quotes: readonly string[]): string {
  return canonical(quotes.join(' | '));
}
