import { compareDates } from './format';
import { QuoteAttribution, QuoteTranslation, quoteAnchor, type Quote } from './quote-attribution';

export type CardQuotesProps = {
  /** The question every quote in the collection answers: its heading. */
  title: string;
  /** The whole collection. */
  quotes: Quote[];
  /** Speakers whose quotes the card's point rests on: the ones it shows. */
  picked?: string[];
  /** How many quotes "See all" opens: the topic's whole list. The collection's own count when omitted. */
  total?: number;
};

/**
 * A collection of quotes in a slideshow card: only the quotes the card's point
 * rests on, one under another, with a line saying how many "See all" leads
 * to. The card is a slide already, so the quotes are not a slideshow of their
 * own; every quote on the topic, which a reader can filter, is in the expanded
 * view, which a click anywhere on the card opens (ExplorableChart).
 *
 * The quotes shown keep the collection's date order, undated last, as
 * QuoteBrowser does, and are set in the same type whoever is speaking. A card
 * whose point names no speaker shows the first.
 */
export function CardQuotes({ title, quotes, picked = [], total = quotes.length }: CardQuotesProps) {
  const ordered = [...quotes].sort((a, b) => (a.date && b.date ? compareDates(a.date, b.date) : a.date ? -1 : b.date ? 1 : 0));
  const named = ordered.filter(quote => picked.includes(quote.speaker));
  const shown = named.length > 0 ? named : ordered.slice(0, 1);
  return (
    <figure className="sv-chart sv-card-quotes" data-preview>
      <figcaption className="sv-chart__caption">
        <h3 className="sv-graph-heading">{title}</h3>
      </figcaption>
      <ol className="sv-card-quotes__list">
        {shown.map(quote => (
          <li key={quoteAnchor(quote)} className="sv-card-quotes__item">
            <blockquote className="sv-card-quotes__text" lang={quote.lang}>
              <p>“{quote.text}”</p>
            </blockquote>
            {quote.translation && <QuoteTranslation translation={quote.translation} />}
            <QuoteAttribution quote={quote} />
          </li>
        ))}
      </ol>
      {shown.length < total && (
        <p className="sv-card-quotes__more">
          {shown.length} of {total} quotes · <span className="sv-card-quotes__all">See all</span>
        </p>
      )}
    </figure>
  );
}
