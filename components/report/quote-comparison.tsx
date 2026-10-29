import type { ReactNode } from 'react';
import { ReportFigure } from './figure';
import { QuoteAttribution, quoteAnchor, type Quote } from './quote-attribution';
import type { SourceCredit } from './types';

export type QuoteComparisonProps = {
  /** The question every quote answers, shown as the heading: "What should happen to Channel crossings?" */
  question: string;
  /** Two to four quotes, shown in the order given. */
  quotes: Quote[];
  id?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  headingLevel?: 2 | 3;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
};

/**
 * Several positions answering one question, side by side.
 *
 * Every column is the same width, the same type and the same rule, and the
 * columns run in the order the author gives — there is no "winning" column to
 * style, and no automatic sort that could quietly put one side first. On a
 * narrow screen they stack in that same order.
 */
export function QuoteComparison({ question, quotes, id, description, sources, note, footer, headingLevel }: QuoteComparisonProps) {
  return (
    <ReportFigure id={id} title={question} description={description} sources={sources} note={note} footer={footer} headingLevel={headingLevel} className="sv-quote-comparison">
      <ul className="sv-quote-comparison__columns" data-count={quotes.length}>
        {quotes.map(quote => (
          <li key={quoteAnchor(quote)} id={quoteAnchor(quote)} className="sv-quote-comparison__column">
            <figure className="sv-quote" data-variant="compared">
              {quote.position && <p className="sv-quote__meta"><span className="sv-quote__position">{quote.position}</span></p>}
              <blockquote className="sv-quote__text" cite={quote.source?.href}>
                <p>{quote.text}</p>
              </blockquote>
              <QuoteAttribution quote={quote} />
            </figure>
          </li>
        ))}
      </ul>
    </ReportFigure>
  );
}
