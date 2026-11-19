'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { ChoiceGroup, FilterChips } from './controls';
import { ReportFigure } from './figure';
import { compareDates } from './format';
import { quoteAnchor, type Quote } from './quote-attribution';
import { QuoteCard } from './quote-card';
import type { SourceCredit } from './types';

export type QuoteSort = 'oldest' | 'newest';

export type QuoteBrowserProps = {
  quotes: Quote[];
  id?: string;
  title?: string;
  /** A short line under the title: the period, cases or source (see ReportFigure). */
  subtitle?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** What `position` means here: "Position", "Party", "Viewpoint". */
  positionLabel?: string;
  /** Order of the position chips. Alphabetical when omitted, so no side is listed first by editorial choice. */
  positions?: string[];
  tagLabel?: string;
  /** Heading of the speaker filter, shown only when some speaker is quoted more than once. */
  speakerLabel?: string;
  /** Chronological either way; oldest first by default, so the record reads in the order it was made. */
  defaultSort?: QuoteSort;
  /** Words to start the search with, e.g. from a link that points at one speaker's quotes. */
  initialSearch?: string;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
};

const SORTS = [
  { value: 'oldest' as const, label: 'Oldest first' },
  { value: 'newest' as const, label: 'Newest first' },
];

/**
 * A collection of sourced quotes a reader can narrow by position, topic,
 * speaker and words, shown in date order.
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
  subtitle,
  description,
  sources,
  note,
  positionLabel = 'Position',
  positions,
  tagLabel = 'Topic',
  speakerLabel = 'Speaker',
  defaultSort = 'oldest',
  initialSearch = '',
  footer,
  panel,
}: QuoteBrowserProps) {
  const searchId = useId();
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(initialSearch);
  const [sort, setSort] = useState<QuoteSort>(defaultSort);

  const positionChoices = useMemo(
    () => chipChoices(quotes.flatMap(q => (q.position ? [q.position] : [])), positions),
    [quotes, positions],
  );
  const tagChoices = useMemo(() => chipChoices(quotes.flatMap(q => q.tags ?? [])), [quotes]);
  const speakerChoices = useMemo(() => chipChoices(quotes.map(q => q.speaker)), [quotes]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = quotes.filter(
      q =>
        (selectedPositions.size === 0 || (q.position !== undefined && selectedPositions.has(q.position))) &&
        (selectedTags.size === 0 || (q.tags ?? []).some(tag => selectedTags.has(tag))) &&
        (selectedSpeakers.size === 0 || selectedSpeakers.has(q.speaker)) &&
        (needle === '' || [q.text, q.translation ?? '', q.speaker].some(field => field.toLowerCase().includes(needle))),
    );
    // Undated quotes go last in either direction: they cannot be placed, and
    // putting them first would give them prominence they have not earned.
    return matches.sort((a, b) => {
      if (!a.date || !b.date) return a.date ? -1 : b.date ? 1 : 0;
      return sort === 'oldest' ? compareDates(a.date, b.date) : compareDates(b.date, a.date);
    });
  }, [quotes, selectedPositions, selectedTags, selectedSpeakers, query, sort]);

  return (
    <ReportFigure id={id} title={title} subtitle={subtitle} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-quote-browser">
      <div className="sv-quote-browser__controls">
        {/* A single position is not a choice, so the filter only appears when there is something to compare. */}
        {positionChoices.length > 1 && (
          <FilterChips label={positionLabel} choices={positionChoices} selected={selectedPositions} onChange={setSelectedPositions} />
        )}
        {tagChoices.length > 1 && <FilterChips label={tagLabel} choices={tagChoices} selected={selectedTags} onChange={setSelectedTags} />}
        {/* With every speaker quoted once, a speaker chip picks one quote: the search does that already. */}
        {speakerChoices.length > 1 && speakerChoices.length < quotes.length && (
          <FilterChips label={speakerLabel} choices={speakerChoices} selected={selectedSpeakers} onChange={setSelectedSpeakers} />
        )}
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
            <li key={quoteAnchor(quote)} id={quoteAnchor(quote)} className="sv-quote-browser__item" data-row={quote.speaker}>
              <QuoteCard quote={quote} permalink />
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
