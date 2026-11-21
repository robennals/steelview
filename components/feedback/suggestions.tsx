'use client';

import { useCallback, useId, useState, type MouseEvent } from 'react';
import type { Suggestion, SuggestionAbout, SuggestionStatus } from '@/lib/feedback/types';
import { InfoSheet } from '@/components/topic/info-sheet';
import { useFeedback } from './feedback-context';
import { count, shortDate } from './format';
import { inOpeningOrder } from './order';
import { OwnPost } from './own-post';
import { PostGate, useDraft } from './post-gate';

/** The final slide's heading, in the outline and on the slide: says plainly that what follows is from readers, not the page. */
export const SUGGESTIONS_HEADING = 'Readers’ suggestions';

/** How many suggestions the preview shows. */
const PREVIEW = 3;

const FILTERS: { status: SuggestionStatus; label: string }[] = [
  { status: 'open', label: 'Open' },
  { status: 'incorporated', label: 'Incorporated' },
  { status: 'answered', label: 'Answered' },
];

/** What a suggestion is about, naming its card by the heading it had when the suggestion was written. */
function aboutLabel(about: SuggestionAbout): string {
  return about.kind === 'whole' ? 'Whole case' : `Card ${about.card + 1}: ${about.heading}`;
}

/** Open suggestions, most backed first, then newest. */
function ranked(suggestions: Suggestion[]): Suggestion[] {
  return suggestions
    .filter(s => s.status === 'open')
    .sort((a, b) => b.backers - a.backers || b.date.localeCompare(a.date));
}

/** A viewpoint's suggestions, from the topic's feedback: null while it loads, none where feedback is off or unreachable. */
function useSuggestions(viewpointId: string): Suggestion[] | null {
  const { state } = useFeedback();
  if (state.status === 'loading') return null;
  return state.status === 'ready' ? state.feedback.suggestions[viewpointId] ?? [] : [];
}

type SuggestionsSlideProps = {
  viewpointId: string;
  /** The viewpoint's short name, for the full view's title. */
  shortName: string;
  /** The viewpoint's card headings, which a suggestion can be about. */
  headings: string[];
};

/**
 * A viewpoint's last slide: a preview of the suggestions readers have made
 * for strengthening it, which opens them all, and the box to add one, over
 * the page. The preview holds only open suggestions: an incorporated one is
 * already in the argument the reader has just read.
 */
export function SuggestionsSlide({ viewpointId, shortName, headings }: SuggestionsSlideProps) {
  const suggestions = useSuggestions(viewpointId);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setTrigger(null), []);
  const top = ranked(suggestions ?? []).slice(0, PREVIEW);
  const openCount = (suggestions ?? []).filter(s => s.status === 'open').length;

  const show = (event: MouseEvent<HTMLElement>) => {
    setTrigger(event.currentTarget.closest<HTMLElement>('.sv-feedback')?.querySelector<HTMLElement>('.sv-feedback__more') ?? null);
  };

  return (
    <div className="sv-deck__card sv-feedback">
      <h3 className="sv-deck__heading">{SUGGESTIONS_HEADING}</h3>
      {/* The whole preview opens the full view, as a card's chart does; the button below is its keyboard way in. */}
      <div className="sv-feedback__preview" onClick={show} aria-busy={suggestions === null}>
        {suggestions === null ? (
          <p className="sv-feedback__empty sv-feedback__empty--loading">Loading suggestions…</p>
        ) : top.length > 0 ? (
          <ul className="sv-feedback__list">
            {top.map(s => (
              <li key={s.id} className="sv-suggestion">
                <p className="sv-suggestion__meta">
                  <span className="sv-suggestion__about">{aboutLabel(s.about)}</span>
                  <span>Backed by {s.backers}</span>
                </p>
                <p className="sv-suggestion__text sv-suggestion__text--clamped">{s.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sv-feedback__empty">No one has suggested anything yet. Be the first to make this argument stronger.</p>
        )}
      </div>
      <div className="sv-feedback__foot">
        <button type="button" className="sv-feedback__more" onClick={show}>
          {top.length > 0 ? 'See all and add yours' : 'Add a suggestion'} <span aria-hidden="true">→</span>
        </button>
        {openCount > 0 && <span className="sv-feedback__count">{count(openCount, 'open suggestion')}</span>}
      </div>
      {trigger && <SuggestionsSheet viewpointId={viewpointId} shortName={shortName} headings={headings} trigger={trigger} onClose={close} />}
    </div>
  );
}

type SuggestionsSheetProps = SuggestionsSlideProps & {
  trigger: HTMLElement | null;
  onClose: () => void;
};

/** Every suggestion for a viewpoint, by outcome, and the box to add one. */
function SuggestionsSheet({ viewpointId, shortName, headings, trigger, onClose }: SuggestionsSheetProps) {
  const titleId = useId();
  const { slug, state, write } = useFeedback();
  const suggestions = useSuggestions(viewpointId) ?? [];
  const signedIn = state.status === 'ready' && state.feedback.reader !== null;
  const [filter, setFilter] = useState<SuggestionStatus>('open');
  const [text, setText] = useDraft(`${slug}/suggestion/${viewpointId}`);
  const [about, setAbout] = useState('whole');

  const [openingOrder] = useState(() => ranked(suggestions).map(s => s.id));
  const shown = filter === 'open'
    ? inOpeningOrder(ranked(suggestions), openingOrder)
    : suggestions.filter(s => s.status === filter);

  const post = async () => {
    const result = await write('POST', `viewpoints/${viewpointId}/suggestions`, { text, card: about === 'whole' ? null : Number(about) });
    if (result.ok) {
      setText('');
      setFilter('open');
    }
    return result;
  };

  return (
    <InfoSheet eyebrow={SUGGESTIONS_HEADING} labelledBy={titleId} trigger={trigger} onClose={onClose}>
      <div className="sv-feedback-sheet">
        <h2 id={titleId} className="sv-feedback-sheet__title">Make “{shortName}” stronger</h2>
        <p className="sv-feedback-sheet__rule">
          This isn’t a place for debate. It’s for making this argument as strong as it can be.
          Disagree with it? Strengthen an opposing viewpoint, or debate a crux.
        </p>

        <div className="sv-compose">
          <label className="sv-visually-hidden" htmlFor={`${titleId}-text`}>Your suggestion</label>
          <textarea id={`${titleId}-text`} className="sv-compose__text" rows={3} value={text} onChange={e => setText(e.target.value)}
            placeholder="What would make this argument stronger?" />
          <label className="sv-compose__about">
            About
            <select value={about} onChange={e => setAbout(e.target.value)}>
              <option value="whole">Whole case</option>
              {headings.map((heading, i) => <option key={i} value={i}>Card {i + 1}: {heading}</option>)}
            </select>
          </label>
          <PostGate label="Suggest" ready={!!text.trim()} onPost={post} />
        </div>

        <div className="sv-filters" role="group" aria-label="Show suggestions">
          {FILTERS.map(({ status, label }) => (
            <button key={status} type="button" className="sv-filters__item" aria-pressed={filter === status} onClick={() => setFilter(status)}>
              {label} · {suggestions.filter(s => s.status === status).length}
            </button>
          ))}
        </div>

        {shown.length > 0 ? (
          <ul className="sv-feedback__list">
            {shown.map(s => (
              <li key={s.id} className="sv-suggestion">
                <p className="sv-suggestion__meta">
                  <span className="sv-suggestion__about">{aboutLabel(s.about)}</span>
                  {s.status === 'open' && (signedIn && !s.mine ? (
                    <button type="button" className="sv-back" aria-pressed={s.backed} onClick={() => write(s.backed ? 'DELETE' : 'PUT', `suggestions/${s.id}/backing`)}>
                      {s.backed ? 'Backed' : 'Back this'} · {s.backers}
                    </button>
                  ) : <span>Backed by {s.backers}</span>)}
                  {s.status === 'incorporated' && <span className="sv-suggestion__outcome">Incorporated</span>}
                </p>
                {s.mine ? (
                  <OwnPost path={`suggestions/${s.id}`} text={s.text} editable={s.status === 'open'}>
                    <p className="sv-suggestion__text">{s.text}</p>
                  </OwnPost>
                ) : <p className="sv-suggestion__text">{s.text}</p>}
                {s.answer && <p className="sv-suggestion__answer"><span>Editor’s reply</span> {s.answer}</p>}
                <p className="sv-suggestion__by">{s.mine ? 'You' : s.author} · {shortDate(s.date)}{s.edited && ' · edited'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sv-feedback__empty">
            {filter === 'open' ? 'No open suggestions.' : filter === 'incorporated' ? 'No suggestions incorporated yet.' : 'No suggestions answered yet.'}
          </p>
        )}
      </div>
    </InfoSheet>
  );
}
