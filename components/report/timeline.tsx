'use client';

import { useState, type ReactNode } from 'react';
import { ChoiceGroup, FilterChips } from './controls';
import { ReportFigure, SourceLine } from './figure';
import { datePlacement, isApproximateDate } from '@/lib/content/period';
import { compareDates, formatDate } from './format';
import { MarkerIcon, shapeForSlot } from './marker-shape';
import { COMPACT_PREVIEW_ITEMS, DENSE_PREVIEW_ITEMS } from './ranked-columns';
import { seriesColor } from './scale';
import { edgeOf, percentAlong, spanOf, stackLevels, timeTicks, toYear } from './time-axis';
import type { FigurePreview, PartialDate, SourceCredit } from './types';

export type TimelineEvent = {
  /**
   * A partial date, or one the source gives only roughly: a decade ("1850s")
   * or a circa year ("c. 1888"), shown as written and placed at the decade's
   * start or the year.
   */
  date: PartialDate;
  /** For something that lasted: a consultation, a scheme, a route that was open. */
  endDate?: PartialDate;
  title: string;
  description?: string;
  /** Joins to `categories[].id`. */
  category: string;
  significance?: 'major' | 'minor';
  /** Every citation the event rests on, listed under it. */
  sources?: SourceCredit[];
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
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  /**
   * Draw the compact preview: the linked title, a key when there are several
   * categories, and every event — one line each (date and title), or past
   * twelve events one marker each on a time axis. Filters, descriptions and
   * sources stay on the full figure.
   */
  preview?: FigurePreview;
};

/**
 * The heading an event is listed under: its year, or an approximate date as
 * written — a "c. 1888" event is not filed under a confident "1888".
 */
function headingOf(date: PartialDate) {
  return isApproximateDate(date) ? date : date.slice(0, 4);
}

/**
 * Date order, by where each date is placed; at the same place an
 * approximate date comes first, so "1850s" heads the 1850s.
 */
function compareEventDates(a: PartialDate, b: PartialDate) {
  return compareDates(datePlacement(a), datePlacement(b)) || Number(isApproximateDate(b)) - Number(isApproximateDate(a));
}

/** A date as written; only an exact one is a machine-readable `<time>`. */
function EventDate({ date }: { date: PartialDate }) {
  return isApproximateDate(date) ? <span>{date}</span> : <time dateTime={date}>{formatDate(date)}</time>;
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
  footer,
  panel,
  headingLevel = 2,
  preview,
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

  const sorted = [...events].sort((a, b) => compareEventDates(a.date, b.date));
  const visible = sorted.filter(
    e => (selected.size === 0 || selected.has(e.category)) && (!majorOnly || e.significance === 'major'),
  );
  const years = [...new Set(visible.map(e => headingOf(e.date)))];
  const YearHeading = headingLevel === 2 ? 'h3' : 'h4';

  if (preview) {
    return (
      <ReportFigure id={id} title={title} preview={preview} className="sv-timeline">
        {resolvedCategories.length > 1 && (
          <ul className="sv-chart__legend sv-timeline__legend">
            {resolvedCategories.map(c => (
              <li key={c.id} className="sv-chart__key" style={{ color: seriesColor(slotOf.get(c.id) ?? 1) }}>
                <MarkerIcon shape={shapeForSlot(slotOf.get(c.id) ?? 1)} className="sv-timeline__legend-icon" />
                <span className="sv-chart__key-name">{c.label}</span>
              </li>
            ))}
          </ul>
        )}
        {sorted.length > DENSE_PREVIEW_ITEMS
          ? <TimelineLane events={sorted} slotOf={slotOf} labelOf={labelOf} />
          : (
            <ol className="sv-timeline__lines" data-compact={sorted.length > COMPACT_PREVIEW_ITEMS || undefined}>
              {sorted.map((e, i) => {
                const slot = slotOf.get(e.category) ?? 1;
                return (
                  <li key={`${e.date}-${i}-${e.title}`} className="sv-timeline__line" style={{ '--sv-timeline-color': seriesColor(slot) }}>
                    <MarkerIcon shape={shapeForSlot(slot)} className="sv-timeline__line-icon" />
                    <EventDate date={e.date} />
                    <span className="sv-timeline__line-title">{e.title}</span>
                    <span className="sv-visually-hidden"> · {labelOf.get(e.category) ?? e.category}</span>
                  </li>
                );
              })}
            </ol>
          )}
      </ReportFigure>
    );
  }

  const counts = new Map<string, number>();
  for (const e of sorted) if (!majorOnly || e.significance === 'major') counts.set(e.category, (counts.get(e.category) ?? 0) + 1);

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-timeline">
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
                {visible.filter(e => headingOf(e.date) === year).map((e, i) => {
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
                        <EventDate date={e.date} />
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
                      {e.sources && e.sources.length > 0 && <SourceLine sources={e.sources} />}
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

/**
 * A long timeline in a compact preview: every event a category marker on one
 * time axis, from the first event's year to the year after the last (month
 * ticks when that is a single year), stacked
 * where markers would overlap. Each marker's date, title and category are in
 * visually hidden text, in order.
 */
function TimelineLane({ events, slotOf, labelOf }: { events: TimelineEvent[]; slotOf: Map<string, number>; labelOf: Map<string, string> }) {
  // An approximate date ("1850s", "c. 1888") sits where the full timeline places it.
  const span = spanOf(events.map(e => datePlacement(e.date)));
  const positions = events.map(e => percentAlong(toYear(datePlacement(e.date)), span));
  // A marker is ~0.8rem; at a ~500px lane that is ~2.5% of the span.
  const levels = stackLevels(positions, 2.5, 4);
  return (
    <div className="sv-timeline__lane" style={{ '--sv-strip-levels': Math.max(0, ...levels) + 1 }}>
      <ol className="sv-timeline__lane-track">
        {events.map((e, i) => {
          const slot = slotOf.get(e.category) ?? 1;
          return (
            <li key={`${e.date}-${i}`} className="sv-timeline__lane-mark" style={{ left: `${positions[i]}%`, '--sv-strip-level': levels[i], color: seriesColor(slot) }}>
              <MarkerIcon shape={shapeForSlot(slot)} className="sv-timeline__lane-icon" />
              <span className="sv-visually-hidden">{isApproximateDate(e.date) ? e.date : formatDate(e.date)}: {e.title} ({labelOf.get(e.category) ?? e.category})</span>
            </li>
          );
        })}
      </ol>
      <div className="sv-timeline__lane-axis" aria-hidden="true">
        {timeTicks(span).map(tick => (
          <span key={tick.at} className="sv-periods__tick" data-minor={tick.minor || undefined} data-edge={edgeOf(percentAlong(tick.at, span))} style={{ left: `${percentAlong(tick.at, span)}%` }}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}
