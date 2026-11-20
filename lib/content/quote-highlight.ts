import { canonical, figuresIn } from './quoted-figures';

/** A run of a source's quote, picked out when it is a passage the finding rests on. */
export type QuotePart = { text: string; key: boolean };

/**
 * A quote's sentences, each with the space after it, so they join back into
 * the quote exactly. A sentence ends at a line break — a quote's paragraphs,
 * bullets and table rows are each on their own line (`QuoteText`) — or at `.`,
 * `!` or `?`, with any closing quotation mark or bracket, before a space and a
 * capital, digit or opening mark.
 */
function sentences(quote: string): string[] {
  return quote.split(/(?<=\n)(?=[^\n])|(?<=[.!?…]["”’)\]]?[ \t]+)(?=["“‘(\[]?[A-Z0-9£$€])/);
}

/** Words too common to say what a sentence is about. */
const COMMON = new Set('about above after again against also among because been before being below between both could does doing down during each from further have having here into itself just more most other over same should some such than that their them then there these they this those through under until very were what when where which while with would your will year years per cent percent'.split(' '));

/** The distinctive words of some text: four letters or longer, not common, lower-cased. */
function words(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? []).filter(word => !COMMON.has(word)));
}

/** Fewest distinctive words a sentence must share with the finding to be picked out by its words alone. */
const MIN_SHARED_WORDS = 3;

/**
 * A source's quote, split so the passages the finding rests on can be picked
 * out: every sentence stating a figure the finding states, or failing that the
 * one sentence sharing the most distinctive words with it, if it shares at
 * least `MIN_SHARED_WORDS`. A quote of one sentence, or with nothing that
 * matches, is one run, picked out nowhere: better no highlight than a wrong one.
 * `finding` is the finding's text: its heading and explanation.
 */
export function highlightQuote(quote: string, finding: string): QuotePart[] {
  const parts = sentences(quote);
  if (parts.length < 2) return [{ text: quote, key: false }];
  const figures = new Set(figuresIn(finding).map(canonical));
  const byFigure = parts.map(part => figuresIn(part).some(figure => figures.has(canonical(figure))));
  if (byFigure.some(Boolean)) return merge(parts.map((text, i) => ({ text, key: byFigure[i] })));
  const about = words(finding);
  const shared = parts.map(part => [...words(part)].filter(word => about.has(word)).length);
  const best = Math.max(...shared);
  const pick = best >= MIN_SHARED_WORDS ? shared.indexOf(best) : -1;
  return merge(parts.map((text, i) => ({ text, key: i === pick })));
}

/**
 * Neighbouring runs that are both picked out, or both not, as one, with the
 * space after a picked-out run left unpicked, so a highlight ends at its words.
 */
function merge(parts: QuotePart[]): QuotePart[] {
  const trimmed = parts.flatMap(({ text, key }) => {
    const space = key ? (text.match(/\s+$/)?.[0] ?? '') : '';
    return space ? [{ text: text.slice(0, -space.length), key }, { text: space, key: false }] : [{ text, key }];
  });
  return trimmed.reduce<QuotePart[]>((runs, part) => {
    const last = runs.at(-1);
    if (last && last.key === part.key) last.text += part.text;
    else runs.push({ ...part });
    return runs;
  }, []);
}
