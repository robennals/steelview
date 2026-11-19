import type { ReactNode } from 'react';
import { ReportFigure } from './figure';
import { quoteAnchor, type Quote } from './quote-attribution';
import { QuoteCard } from './quote-card';
import type { SourceCredit } from './types';

export type QuoteComparisonProps = {
  /** The question every quote answers, shown as the heading: "What should happen to Channel crossings?" */
  question: string;
  /** Two to four quotes, shown in the order given. More than four do not fit side by side: use QuoteBrowser. */
  quotes: Quote[];
  id?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  headingLevel?: 2 | 3;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
};

/**
 * Several positions answering one question, side by side.
 *
 * Every column is the same width, the same type and the same rule, and the
 * columns run in the order the author gives — there is no "winning" column to
 * style, and no automatic sort that could quietly put one side first. On a
 * narrow screen they stack in that same order.
 */
export function QuoteComparison({ question, quotes, id, description, sources, note, footer, panel, headingLevel }: QuoteComparisonProps) {
  return (
    <ReportFigure id={id} title={question} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-quote-comparison">
      <ul className="sv-quote-comparison__columns" data-count={quotes.length}>
        {quotes.map(quote => (
          <li key={quoteAnchor(quote)} id={quoteAnchor(quote)} className="sv-quote-comparison__column" data-row={quote.speaker}>
            <QuoteCard quote={quote} />
          </li>
        ))}
      </ul>
    </ReportFigure>
  );
}
