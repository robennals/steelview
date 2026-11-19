'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChoiceGroup, FilterChips } from './controls';
import { ControlBar, chipsSummary, type BarItem } from './control-bar';
import { ReportFigure } from './figure';
import { compareDates } from './format';
import { QuoteAttribution, QuoteTranslation, quoteAnchor, type Quote } from './quote-attribution';
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
  /** Quotes longer than this many characters are clamped behind "Read full quote". */
  clampAt?: number;
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
  clampAt = 320,
  initialSearch = '',
  footer,
  panel,
}: QuoteBrowserProps) {
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

  const chips = (key: string, label: string, choices: ReturnType<typeof chipChoices>, selected: Set<string>, onChange: (next: Set<string>) => void): BarItem => ({
    key,
    label,
    summary: chipsSummary(selected),
    active: selected.size > 0,
    panel: <FilterChips label={label} hideLabel choices={choices} selected={selected} onChange={onChange} />,
  });
  const controlItems: BarItem[] = [
    // A single position is not a choice, so the filter only appears when there is something to compare.
    ...(positionChoices.length > 1 ? [chips('position', positionLabel, positionChoices, selectedPositions, setSelectedPositions)] : []),
    ...(tagChoices.length > 1 ? [chips('tag', tagLabel, tagChoices, selectedTags, setSelectedTags)] : []),
    // With every speaker quoted once, a speaker chip picks one quote: the search does that already.
    ...(speakerChoices.length > 1 && speakerChoices.length < quotes.length ? [chips('speaker', speakerLabel, speakerChoices, selectedSpeakers, setSelectedSpeakers)] : []),
    { key: 'order', label: 'Order', hideLabel: true, single: true, summary: sort === 'oldest' ? 'Oldest first' : 'Newest first', panel: <ChoiceGroup label="Order" choices={SORTS} value={sort} onChange={setSort} hideLabel /> },
  ];

  return (
    <ReportFigure id={id} title={title} subtitle={subtitle} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-quote-browser">
      <ControlBar label="Filter and sort quotes" items={controlItems} search={{ value: query, onChange: setQuery, placeholder: 'Search quotes and speakers' }} />

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
              <figure className="sv-quote" data-variant="listed">
                {(quote.position || (quote.tags && quote.tags.length > 0)) && (
                  <p className="sv-quote__meta">
                    {quote.position && <span className="sv-quote__position">{quote.position}</span>}
                    {quote.tags?.map(tag => <span key={tag} className="sv-quote__tag">{tag}</span>)}
                  </p>
                )}
                <blockquote className="sv-quote__text" cite={quote.sources?.[0]?.href} lang={quote.lang} data-clamp={quote.text.length > clampAt || undefined}>
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
                {quote.translation && <QuoteTranslation translation={quote.translation} />}
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
