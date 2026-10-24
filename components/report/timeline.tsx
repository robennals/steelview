'use client';

import { useState } from 'react';
import { ChoiceGroup, FilterChips } from './controls';
import { ReportFigure, SourceLine } from './figure';
import { compareDates, formatDate } from './format';
import { MarkerIcon, shapeForSlot } from './marker-shape';
import { seriesColor } from './scale';
import type { PartialDate, SourceCredit } from './types';

export type TimelineEvent = {
  date: PartialDate;
  /** For something that lasted: a consultation, a scheme, a route that was open. */
  endDate?: PartialDate;
  title: string;
  description?: string;
  /** Joins to `categories[].id`. */
  category: string;
  significance?: 'major' | 'minor';
  source?: SourceCredit;
  /** Where to read more, e.g. the fact this event is evidence in. */
  href?: string;
};

export type TimelineCategory = { id: string; label: string };

export type TimelineProps = {
  events: TimelineEvent[];
  /** Category order fixes each category's colour and shape. Defaults to order of first appearance. */
  categories?: TimelineCategory[];
  /** Show the category chips. Defaults to true when there is more than one category. */
  filterable?: boolean;
  /** Show the "Major only" switch. Defaults to true when some events are marked major. */
  majorToggle?: boolean;
  /** Start with these categories selected (for a story or a deep link). */
  initialCategories?: string[];
  initialMajorOnly?: boolean;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  headingLevel?: 2 | 3;
};

function yearOf(date: PartialDate) {
  return date.slice(0, 4);
}

/**
 * Dated events in order, grouped under year headings, each with what happened,
 * its category and its source.
 *
 * Use it for the sequence of decisions behind a trend — routes opened and
 * closed, acts passed, schemes announced and dropped — so a reader can see
 * what came before what. Category is shown by shape and colour together and
 * named in words on every event; filters always say how many events they are
 * hiding. The full list renders on the server; filtering is progressive.
 */
export function Timeline({
  events,
  categories,
  filterable,
  majorToggle,
  initialCategories = [],
  initialMajorOnly = false,
  id,
  title,
  description,
  sources,
  note,
  headingLevel = 2,
}: TimelineProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialCategories));
  const [majorOnly, setMajorOnly] = useState(initialMajorOnly);

  const resolvedCategories = categories ?? [...new Set(events.map(e => e.category))].map(c => ({ id: c, label: c }));
  const slotOf = new Map(resolvedCategories.map((c, i) => [c.id, i + 1]));
  const labelOf = new Map(resolvedCategories.map(c => [c.id, c.label]));
  const showChips = filterable ?? resolvedCategories.length > 1;
  const hasMajor = events.some(e => e.significance === 'major');
  const hasMinor = events.some(e => e.significance !== 'major');
  const showMajorToggle = majorToggle ?? (hasMajor && hasMinor);

  const sorted = [...events].sort((a, b) => compareDates(a.date, b.date));
  const visible = sorted.filter(
    e => (selected.size === 0 || selected.has(e.category)) && (!majorOnly || e.significance === 'major'),
  );
  const years = [...new Set(visible.map(e => yearOf(e.date)))];
  const YearHeading = headingLevel === 2 ? 'h3' : 'h4';

  const counts = new Map<string, number>();
  for (const e of sorted) if (!majorOnly || e.significance === 'major') counts.set(e.category, (counts.get(e.category) ?? 0) + 1);

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} headingLevel={headingLevel} className="sv-timeline">
      {(showChips || showMajorToggle) && (
        <div className="sv-timeline__controls">
          {showChips && (
            <FilterChips
              label="Category"
              selected={selected}
              onChange={setSelected}
              choices={resolvedCategories.map(c => ({
                value: c.id,
                label: (
                  <span className="sv-timeline__chip-label" style={{ color: seriesColor(slotOf.get(c.id) ?? 1) }}>
                    <MarkerIcon shape={shapeForSlot(slotOf.get(c.id) ?? 1)} className="sv-timeline__chip-icon" />
                    <span className="sv-timeline__chip-text">{c.label}</span>
                  </span>
                ),
                count: counts.get(c.id) ?? 0,
              }))}
            />
          )}
          {showMajorToggle && (
            <ChoiceGroup
              label="Show"
              value={majorOnly ? 'major' : 'all'}
              onChange={value => setMajorOnly(value === 'major')}
              choices={[{ value: 'all', label: 'All events' }, { value: 'major', label: 'Major only' }]}
            />
          )}
        </div>
      )}
      {hasMajor && hasMinor && !majorOnly && (
        <p className="sv-timeline__key">
          <MarkerIcon shape="circle" className="sv-timeline__key-icon" /> Filled marker: major event
          <span aria-hidden="true"> · </span>
          <MarkerIcon shape="circle" filled={false} className="sv-timeline__key-icon" /> Hollow: minor
        </p>
      )}
      <p className="sv-control__status" aria-live="polite">
        Showing {visible.length} of {events.length} events
      </p>

      {visible.length === 0 ? (
        <p className="sv-report__empty">No events match these filters.</p>
      ) : (
        <div className="sv-timeline__body">
          {years.map(year => (
            <section key={year} className="sv-timeline__year">
              <YearHeading className="sv-timeline__year-head">{year}</YearHeading>
              <ol className="sv-timeline__events">
                {visible.filter(e => yearOf(e.date) === year).map((e, i) => {
                  const slot = slotOf.get(e.category) ?? 1;
                  const major = e.significance === 'major';
                  return (
                    <li
                      key={`${e.date}-${i}-${e.title}`}
                      className="sv-timeline__event"
                      data-significance={major ? 'major' : 'minor'}
                      style={{ '--sv-timeline-color': seriesColor(slot) }}
                    >
                      <MarkerIcon shape={shapeForSlot(slot)} filled={major || !hasMajor} className="sv-timeline__marker" />
                      <p className="sv-timeline__date">
                        <time dateTime={e.date}>{formatDate(e.date)}</time>
                        {e.endDate && (
                          <>
                            {' – '}
                            <time dateTime={e.endDate}>{formatDate(e.endDate)}</time>
                          </>
                        )}
                        <span className="sv-timeline__category"> · {labelOf.get(e.category) ?? e.category}</span>
                        {major && hasMinor && <span className="sv-visually-hidden"> · major event</span>}
                      </p>
                      <p className="sv-timeline__title">{e.href ? <a href={e.href}>{e.title}</a> : e.title}</p>
                      {e.description && <p className="sv-timeline__desc">{e.description}</p>}
                      {e.source && <SourceLine sources={[e.source]} />}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </ReportFigure>
  );
}
