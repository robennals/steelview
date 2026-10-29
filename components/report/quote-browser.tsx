'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { ChoiceGroup, FilterChips } from './controls';
import { ReportFigure } from './figure';
import { compareDates } from './format';
import { QuoteAttribution, quoteAnchor, type Quote } from './quote-attribution';
import type { SourceCredit } from './types';

export type QuoteSort = 'oldest' | 'newest';

export type QuoteBrowserProps = {
  quotes: Quote[];
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** What `position` means here: "Position", "Party", "Viewpoint". */
  positionLabel?: string;
  /** Order of the position chips. Alphabetical when omitted, so no side is listed first by editorial choice. */
  positions?: string[];
  tagLabel?: string;
  /** Chronological either way; oldest first by default, so the record reads in the order it was made. */
  defaultSort?: QuoteSort;
  /** Quotes longer than this many characters are clamped behind "Read full quote". */
  clampAt?: number;
  /** Words to start the search with, e.g. from a link that points at one speaker's quotes. */
  initialSearch?: string;
};

const SORTS = [
  { value: 'oldest' as const, label: 'Oldest first' },
  { value: 'newest' as const, label: 'Newest first' },
];

/**
 * A collection of sourced quotes a reader can narrow by position, topic and
 * words, shown in date order.
 *
 * Neutrality is structural here: every position is set in the same type, the
 * order is the calendar's rather than the editor's, and the "Showing n of m"
 * line means a filter never hides that it is filtering. The full list renders
 * on the server, so the page reads, prints and searches without JavaScript.
 */
export function QuoteBrowser({
  quotes,
  id,
  title,
  description,
  sources,
  note,
  positionLabel = 'Position',
  positions,
  tagLabel = 'Topic',
  defaultSort = 'oldest',
  clampAt = 320,
  initialSearch = '',
}: QuoteBrowserProps) {
  const searchId = useId();
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(initialSearch);
  const [sort, setSort] = useState<QuoteSort>(defaultSort);

  const positionChoices = useMemo(
    () => chipChoices(quotes.flatMap(q => (q.position ? [q.position] : [])), positions),
    [quotes, positions],
  );
  const tagChoices = useMemo(() => chipChoices(quotes.flatMap(q => q.tags ?? [])), [quotes]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = quotes.filter(
      q =>
        (selectedPositions.size === 0 || (q.position !== undefined && selectedPositions.has(q.position))) &&
        (selectedTags.size === 0 || (q.tags ?? []).some(tag => selectedTags.has(tag))) &&
        (needle === '' || q.text.toLowerCase().includes(needle) || q.speaker.toLowerCase().includes(needle)),
    );
    // Undated quotes go last in either direction: they cannot be placed, and
    // putting them first would give them prominence they have not earned.
    return matches.sort((a, b) => {
      if (!a.date || !b.date) return a.date ? -1 : b.date ? 1 : 0;
      return sort === 'oldest' ? compareDates(a.date, b.date) : compareDates(b.date, a.date);
    });
  }, [quotes, selectedPositions, selectedTags, query, sort]);

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} className="sv-quote-browser">
      <div className="sv-quote-browser__controls">
        {/* A single position is not a choice, so the filter only appears when there is something to compare. */}
        {positionChoices.length > 1 && (
          <FilterChips label={positionLabel} choices={positionChoices} selected={selectedPositions} onChange={setSelectedPositions} />
        )}
        {tagChoices.length > 1 && <FilterChips label={tagLabel} choices={tagChoices} selected={selectedTags} onChange={setSelectedTags} />}
        <div className="sv-quote-browser__row">
          <label className="sv-visually-hidden" htmlFor={searchId}>Search quotes and speakers</label>
          <input
            id={searchId}
            className="sv-control__search"
            type="search"
            placeholder="Search quotes and speakers"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <ChoiceGroup label="Order" choices={SORTS} value={sort} onChange={setSort} hideLabel />
        </div>
      </div>

      <p className="sv-control__status" aria-live="polite">
        Showing {shown.length} of {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
      </p>

      {shown.length === 0 ? (
        <p className="sv-report__empty">
          {quotes.length === 0 ? 'No quotes have been collected here yet.' : 'No quotes match these filters. Clear a filter or the search to see more.'}
        </p>
      ) : (
        <ol className="sv-quote-browser__list">
          {shown.map(quote => (
            <li key={quoteAnchor(quote)} id={quoteAnchor(quote)} className="sv-quote-browser__item">
              <figure className="sv-quote" data-variant="listed">
                {(quote.position || (quote.tags && quote.tags.length > 0)) && (
                  <p className="sv-quote__meta">
                    {quote.position && <span className="sv-quote__position">{quote.position}</span>}
                    {quote.tags?.map(tag => <span key={tag} className="sv-quote__tag">{tag}</span>)}
                  </p>
                )}
                <blockquote className="sv-quote__text" cite={quote.source?.href} data-clamp={quote.text.length > clampAt || undefined}>
                  <p>{quote.text}</p>
                </blockquote>
                {quote.text.length > clampAt && (
                  // A native <details> with no body: opening it lifts the clamp
                  // through CSS, so the full quote is one tap away with
                  // JavaScript off, and the text exists only once in the page.
                  <details className="sv-quote__more">
                    <summary>
                      <span data-when="closed">Read full quote</span>
                      <span data-when="open">Show less</span>
                    </summary>
                  </details>
                )}
                <QuoteAttribution quote={quote} permalink />
              </figure>
            </li>
          ))}
        </ol>
      )}
    </ReportFigure>
  );
}

function chipChoices(values: string[], order?: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const keys = order ? [...order.filter(v => counts.has(v)), ...[...counts.keys()].filter(v => !order.includes(v)).sort()] : [...counts.keys()].sort((a, b) => a.localeCompare(b));
  return keys.map(value => ({ value, label: value, count: counts.get(value) }));
}
