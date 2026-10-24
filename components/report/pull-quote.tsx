import { QuoteAttribution, quoteAnchor, type Quote } from './quote-attribution';

export type PullQuoteProps = {
  quote: Quote;
  /** `pull` sets the quote large between sections; `inline` sits in running prose like a blockquote. */
  variant?: 'pull' | 'inline';
};

/**
 * A single quote, attributed and sourced, placed inside a report.
 *
 * Even set large it carries its full attribution and source link: a quote
 * pulled out of a document and enlarged is the easiest thing on a page to
 * take out of context, so the context travels with it.
 */
export function PullQuote({ quote, variant = 'pull' }: PullQuoteProps) {
  return (
    <figure className="sv-quote sv-pull-quote" data-variant={variant} id={quoteAnchor(quote)}>
      <blockquote className="sv-quote__text" cite={quote.source?.href}>
        <p>{quote.text}</p>
      </blockquote>
      <QuoteAttribution quote={quote} />
    </figure>
  );
}
