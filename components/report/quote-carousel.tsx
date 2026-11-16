'use client';

import { useEffect, useMemo } from 'react';
import { useCarousel } from '@/components/home/use-carousel';
import { compareDates } from './format';
import { QuoteAttribution, QuoteTranslation, quoteAnchor, type Quote } from './quote-attribution';

export type QuoteCarouselProps = {
  /** The question every quote answers: the collection's heading. */
  title: string;
  quotes: Quote[];
  /** Speakers whose quotes the card's point rests on: it opens on the first of them, and their quotes are marked. */
  picked?: string[];
};

/**
 * A collection of quotes in a slideshow card: one quote at a time, large
 * enough to read as evidence, with who said it, when and where to check it,
 * and a dot per quote to move between them, as the home page's carousel has.
 * A swipe or the arrow keys move too.
 *
 * As in QuoteBrowser, neutrality is structural: the quotes run in date order,
 * not the editor's, and every one is set in the same type. The card's point
 * picks out its speakers' quotes and opens on the first of them, without
 * reordering the rest. Every quote is server-rendered into a scroll-snapped
 * strip, so without JavaScript each is still reachable by scrolling.
 */
export function QuoteCarousel({ title, quotes, picked = [] }: QuoteCarouselProps) {
  // Oldest first, undated last, as QuoteBrowser orders them.
  const ordered = useMemo(() => [...quotes].sort((a, b) => (a.date && b.date ? compareDates(a.date, b.date) : a.date ? -1 : b.date ? 1 : 0)), [quotes]);
  const { strip, index, announced, enhanced, go, onKeyDown, onScroll } = useCarousel(ordered.length);
  const isPicked = (quote: Quote) => picked.includes(quote.speaker);
  const start = Math.max(0, ordered.findIndex(isPicked));

  // Open on the first quote the card's point rests on.
  useEffect(() => {
    if (start > 0) go(start, true);
  }, [start, go]);

  return (
    <figure className="sv-chart sv-quote-carousel" data-preview>
      <figcaption className="sv-chart__caption">
        <h3 className="sv-graph-heading">{title}</h3>
      </figcaption>
      <div
        className="sv-quote-carousel__strip"
        ref={strip}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} Use the left and right arrow keys to move between quotes.`}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
      >
        {ordered.map((quote, i) => (
          <figure key={quoteAnchor(quote)} className="sv-quote-carousel__slide" data-picked={isPicked(quote) || undefined} role="group" aria-roledescription="slide" aria-label={`Quote ${i + 1} of ${ordered.length}: ${quote.speaker}`}>
            <blockquote className="sv-quote-carousel__text" lang={quote.lang}>
              <p>“{quote.text}”</p>
            </blockquote>
            {quote.translation && <QuoteTranslation translation={quote.translation} />}
            <figcaption><QuoteAttribution quote={quote} /></figcaption>
          </figure>
        ))}
      </div>
      {enhanced && ordered.length > 1 && (
        <>
          <p className="sv-visually-hidden" aria-live="polite">Quote {announced + 1} of {ordered.length}: {ordered[announced].speaker}</p>
          <div className="sv-quote-carousel__controls">
            <button type="button" className="sv-carousel__step" aria-label="Previous quote" disabled={index === 0} onClick={() => go(index - 1)}>‹</button>
            <div className="sv-carousel__dots">
              {ordered.map((quote, i) => (
                <button type="button" key={quoteAnchor(quote)} className="sv-carousel__dot" aria-current={i === index || undefined} data-picked={isPicked(quote) || undefined} aria-label={`Quote ${i + 1}: ${quote.speaker}`} onClick={() => go(i)} />
              ))}
            </div>
            <p className="sv-carousel__count" aria-hidden="true">{index + 1} / {ordered.length}</p>
            <button type="button" className="sv-carousel__step" aria-label="Next quote" disabled={index === ordered.length - 1} onClick={() => go(index + 1)}>›</button>
          </div>
        </>
      )}
    </figure>
  );
}
