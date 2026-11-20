import { QuoteDetails, QuoteSpeaker, QuoteTranslation, type Quote } from './quote-attribution';
import { formatDate } from './format';
import { PassageText } from './source-passage';

export type QuoteCardProps = {
  quote: Quote;
  /** Offer "Link to this quote" in the opened card: for a list whose quotes are addressed one by one. */
  permalink?: boolean;
};

/**
 * One quote as a white card, as a timeline's events are: closed, the quoted
 * words (clamped to a few lines), who said them and when; opened, the
 * sentences of the source they were copied from in their place, the quoted
 * words marked, and below, where it was said and the source to check it.
 * A quote its source adds nothing to opens to the whole quote.
 *
 * A native <details>: it opens without JavaScript, and both the quote and its
 * passage are in the page for find-in-page and screen readers.
 */
export function QuoteCard({ quote, permalink = false }: QuoteCardProps) {
  const passages = quote.passages ?? [];
  const tags = quote.tags ?? [];
  return (
    <details className="sv-quote sv-quote-card" data-context={passages.length > 0 || undefined}>
      <summary className="sv-quote-card__head">
        {(quote.position || tags.length > 0) && (
          <span className="sv-quote__meta">
            {quote.position && <span className="sv-quote__position">{quote.position}</span>}
            {tags.map(tag => <span key={tag} className="sv-quote__tag">{tag}</span>)}
          </span>
        )}
        <blockquote className="sv-quote__text" cite={quote.sources?.[0]?.href} lang={quote.lang}>
          <p>{quote.text}</p>
        </blockquote>
        {passages.map((passage, i) => (
          <blockquote key={i} className="sv-quote-card__context" cite={passage.source.href} lang={quote.lang}>
            <p><PassageText passage={passage} /></p>
          </blockquote>
        ))}
        {quote.translation && <QuoteTranslation translation={quote.translation} />}
        <span className="sv-quote-card__who">
          <QuoteSpeaker quote={quote} />
          {quote.date && <time className="sv-quote-card__date" dateTime={quote.date}>{formatDate(quote.date)}</time>}
        </span>
      </summary>
      <div className="sv-quote-card__more">
        <QuoteDetails quote={quote} permalink={permalink} date={false} />
      </div>
    </details>
  );
}
