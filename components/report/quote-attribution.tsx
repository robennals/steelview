import { formatDate, slugify } from './format';
import type { PartialDate, SourceCredit } from './types';

/**
 * One sourced quote, as every quote component takes it.
 *
 * `position` is a free string — a viewpoint, a party, a side of a question —
 * so the components never assume what a topic is divided along. `speaker` is
 * whoever said or published it: a person, or an institution such as the ONS.
 */
export type Quote = {
  /** Stable anchor fragment. Derived from speaker, date and opening words when omitted. */
  id?: string;
  /** The words, verbatim. Never paraphrased: a paraphrase is the editor speaking. */
  text: string;
  speaker: string;
  /** Role or affiliation: "Shadow Home Secretary", "Official statistics". */
  role?: string;
  position?: string;
  tags?: string[];
  date?: PartialDate;
  /** Where it was said or published: "House of Commons debate", a report title. */
  context?: string;
  source?: SourceCredit;
};

/** The DOM id of a quote, so a quote can be linked to and cited by address. */
export function quoteAnchor(quote: Quote): string {
  if (quote.id) return `quote-${quote.id}`;
  const opening = quote.text.split(/\s+/).slice(0, 6).join(' ');
  return `quote-${slugify([quote.speaker, quote.date ?? '', opening].join(' '))}`;
}

/**
 * Who said it, in what capacity, where, when, and where to check it — in the
 * apparatus voice, so the reader never mistakes the attribution for the quote.
 */
export function QuoteAttribution({ quote, permalink = false }: { quote: Quote; permalink?: boolean }) {
  const details = [
    quote.context && <span key="context">{quote.context}</span>,
    quote.date && <time key="date" dateTime={quote.date}>{formatDate(quote.date)}</time>,
    quote.source && (
      <span key="source">
        Source:{' '}
        {quote.source.href ? <a href={quote.source.href}>{sourceText(quote.source)}</a> : sourceText(quote.source)}
      </span>
    ),
    permalink && <a key="link" className="sv-quote__permalink" href={`#${quoteAnchor(quote)}`}>Link to this quote</a>,
  ].filter(Boolean);

  return (
    <figcaption className="sv-quote__attribution">
      <span className="sv-quote__speaker">
        <cite>{quote.speaker}</cite>
        {quote.role && <span className="sv-quote__role">, {quote.role}</span>}
      </span>
      {details.length > 0 && (
        <span className="sv-quote__details">
          {details.map((detail, i) => (
            <span key={i}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              {detail}
            </span>
          ))}
        </span>
      )}
    </figcaption>
  );
}

function sourceText(source: SourceCredit): string {
  return source.number ? `${source.label} [${source.number}]` : source.label;
}
