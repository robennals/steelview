'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ChoiceGroup, FilterChips } from './controls';
import { ControlBar, chipsSummary, type BarItem } from './control-bar';
import { ReportFigure } from './figure';
import { compareDates } from './format';
import { quoteAnchor, type Quote } from './quote-attribution';
import { QuoteCard } from './quote-card';
import type { SourceCredit } from './types';

export type QuoteSort = 'oldest' | 'newest' | 'highlighted';

/**
 * Quotes to put first and outline, by `quoteAnchor`: those of the card a
 * reader clicked to open the list, so they find the ones they came for. A
 * list given some starts in "Highlighted first" order.
 */
export const HighlightedQuotes = createContext<string[]>([]);

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

const SORTS: Array<{ value: QuoteSort; label: string }> = [
  { value: 'highlighted', label: 'Highlighted first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'newest', label: 'Newest first' },
];

/**
 * A collection of sourced quotes a reader can narrow by position, topic,
 * speaker and words, shown in date order.
 *
 * Neutrality is structural here: every position is set in the same type, the
 * order is the calendar's rather than the editor's, and the "Showing n of m"
 * line means a filter never hides that it is filtering. The full list renders
 * on the server, so the page reads, prints and searches without JavaScript.
 * Opened from a card's quotes (HighlightedQuotes), those come first,
 * outlined, then the rest oldest first; the date orders are a click away.
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
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(initialSearch);
  const anchors = useContext(HighlightedQuotes);
  const highlighted = useMemo(() => anchors.filter(anchor => quotes.some(q => quoteAnchor(q) === anchor)), [anchors, quotes]);
  const [sort, setSort] = useState<QuoteSort>(highlighted.length > 0 ? 'highlighted' : defaultSort);
  const sorts = highlighted.length > 0 ? SORTS : SORTS.filter(s => s.value !== 'highlighted');

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
    // Highlighted first: the highlighted quotes in the card's order, then the rest oldest first.
    const rank = (q: Quote) => {
      const at = sort === 'highlighted' ? highlighted.indexOf(quoteAnchor(q)) : -1;
      return at < 0 ? highlighted.length : at;
    };
    // Undated quotes go last in either direction: they cannot be placed, and
    // putting them first would give them prominence they have not earned.
    return matches.sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (!a.date || !b.date) return a.date ? -1 : b.date ? 1 : 0;
      return sort === 'newest' ? compareDates(b.date, a.date) : compareDates(a.date, b.date);
    });
  }, [quotes, selectedPositions, selectedTags, selectedSpeakers, query, sort, highlighted]);

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
    { key: 'order', label: 'Order', hideLabel: true, single: true, summary: (sorts.find(s => s.value === sort) ?? sorts[0]).label, panel: <ChoiceGroup label="Order" choices={sorts} value={sort} onChange={setSort} hideLabel /> },
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
            <li key={quoteAnchor(quote)} id={quoteAnchor(quote)} className="sv-quote-browser__item" data-row={quote.speaker} data-highlighted={highlighted.includes(quoteAnchor(quote)) || undefined}>
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
