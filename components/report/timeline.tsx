'use client';

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChoiceGroup, FilterChips, type Choice } from './controls';
import { ControlBar, chipsSummary, type BarItem } from './control-bar';
import { ReportFigure, SourceLine } from './figure';
import { isApproximateDate } from '@/lib/content/period';
import { formatDate } from './format';
import { MarkerIcon, shapeForSlot } from './marker-shape';
import { seriesColor } from './scale';
import { tickEdge } from './time-axis';
import { baselinePieces, eventAxis, namesOnAxis, previewEvents, sortEvents, type EventAxis } from './timeline-layout';
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
  /** A short line under the title: the period, cases or source (see ReportFigure). */
  subtitle?: string;
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
   * categories, the time axis with every event, and cards for the few events
   * the preview is about (`previewEvents`). Filters, descriptions and sources
   * stay on the full figure.
   */
  preview?: FigurePreview;
  /** In a preview, the events (by title) the claim it illustrates is about: they get its cards. */
  picked?: string[];
};

/** A date as written; only an exact one is a machine-readable `<time>`. */
function EventDate({ date }: { date: PartialDate }) {
  return isApproximateDate(date) ? <span>{date}</span> : <time dateTime={date}>{formatDate(date)}</time>;
}

function EventDates({ event }: { event: TimelineEvent }) {
  return (
    <>
      <EventDate date={event.date} />
      {event.endDate && <>{' – '}<EventDate date={event.endDate} /></>}
    </>
  );
}

function spokenDate(date: PartialDate) {
  return isApproximateDate(date) ? date : formatDate(date);
}

/**
 * Dated events in order: a time axis showing when, and a card per event
 * saying what, which opens to its detail and source.
 *
 * Use it for the sequence of decisions behind a trend — routes opened and
 * closed, acts passed, schemes announced and dropped — so a reader can see
 * what came before what. The axis cuts out long empty stretches (marked with
 * a break) so a burst of recent events is not squeezed into a sliver, and
 * stacks markers that would overlap. When every event is a short name, the
 * names go on the axis and there are no cards. Category is shown by shape and
 * colour together and named in words on every event; filters always say how
 * many events they are hiding. An observation picks out its events' cards,
 * opened, and rings their markers; the rest stay readable.
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
  subtitle,
  description,
  sources,
  note,
  footer,
  panel,
  headingLevel = 2,
  preview,
  picked,
}: TimelineProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialCategories));
  const [majorOnly, setMajorOnly] = useState(initialMajorOnly);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [marked, setMarked] = useState<Set<number>>(() => new Set());
  const cardsRef = useRef<HTMLOListElement>(null);
  const openedByMark = useRef(new Set<number>());

  const resolvedCategories = categories ?? [...new Set(events.map(e => e.category))].map(c => ({ id: c, label: c }));
  const slotOf = new Map(resolvedCategories.map((c, i) => [c.id, i + 1]));
  const labelOf = new Map(resolvedCategories.map(c => [c.id, c.label]));
  const showChips = filterable ?? resolvedCategories.length > 1;
  const hasMajor = events.some(e => e.significance === 'major');
  const hasMinor = events.some(e => e.significance !== 'major');
  const showMajorToggle = majorToggle ?? (hasMajor && hasMinor);

  const sorted = sortEvents(events);
  const axis = eventAxis(sorted);
  const named = namesOnAxis(sorted);
  const shows = (e: TimelineEvent) => (selected.size === 0 || selected.has(e.category)) && (!majorOnly || e.significance === 'major');
  const visible = sorted.map((e, i) => ({ e, i })).filter(({ e }) => shows(e));

  // An observation marks its events' cards (observation-bar.tsx sets
  // `data-mark-picked` on their rows). A picked card opens, and closes again
  // when the observation moves on unless the reader opened it.
  useEffect(() => {
    const list = cardsRef.current;
    if (!list) return;
    const follow = () => {
      const now = new Set([...list.querySelectorAll<HTMLElement>('[data-index][data-mark-picked]')].map(el => Number(el.dataset.index)));
      setMarked(now);
      setOpen(was => {
        const next = new Set(was);
        for (const i of now) if (!next.has(i)) { next.add(i); openedByMark.current.add(i); }
        for (const i of openedByMark.current) if (!now.has(i)) { next.delete(i); openedByMark.current.delete(i); }
        return next;
      });
    };
    // The observation may have marked the cards before this runs.
    follow();
    const watch = new MutationObserver(follow);
    watch.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-mark-picked'] });
    return () => watch.disconnect();
  }, []);

  const setCardOpen = (i: number, isOpen: boolean) => {
    if (open.has(i) === isOpen) return;
    openedByMark.current.delete(i);
    setOpen(was => {
      const next = new Set(was);
      if (isOpen) next.add(i); else next.delete(i);
      return next;
    });
  };

  const legend = resolvedCategories.length > 1 && (
    <ul className="sv-chart__legend sv-timeline__legend">
      {resolvedCategories.map(c => (
        <li key={c.id} className="sv-chart__key" style={{ color: seriesColor(slotOf.get(c.id) ?? 1) }}>
          <MarkerIcon shape={shapeForSlot(slotOf.get(c.id) ?? 1)} className="sv-timeline__legend-icon" />
          <span className="sv-chart__key-name">{c.label}</span>
        </li>
      ))}
    </ul>
  );
  const marker = (e: TimelineEvent, className: string) => {
    const slot = slotOf.get(e.category) ?? 1;
    return <MarkerIcon shape={shapeForSlot(slot)} filled={e.significance === 'major' || !hasMajor || !hasMinor} className={className} />;
  };
  const colorOf = (e: TimelineEvent) => seriesColor(slotOf.get(e.category) ?? 1);

  if (preview) {
    const carded = previewEvents(sorted, picked);
    const cardedAt = new Set(carded.map(e => sorted.indexOf(e)));
    const rest = sorted.length - carded.length;
    return (
      <ReportFigure id={id} title={title} subtitle={subtitle} preview={preview} className="sv-timeline">
        {legend}
        <Axis axis={axis} events={sorted} shown={sorted.map((_, i) => i)} named={named} on={named ? new Set() : cardedAt} colorOf={colorOf} marker={marker} />
        {!named && (
          <>
            {/* The list below reads every event aloud; these cards repeat a few of them. */}
            <ol className="sv-timeline__cards" data-preview="" aria-hidden="true">
              {carded.map(e => (
                <li key={`${e.date}-${e.title}`} className="sv-timeline__item" style={{ '--sv-timeline-color': colorOf(e)}}>
                  <div className="sv-timeline__card">
                    <CardHead event={e} marker={marker(e, 'sv-timeline__card-marker')} category={labelOf.get(e.category) ?? e.category} />
                  </div>
                </li>
              ))}
            </ol>
            {rest > 0 && <p className="sv-timeline__rest" aria-hidden="true">and {rest} more {rest === 1 ? 'event' : 'events'} on the time line</p>}
          </>
        )}
        <EventList events={sorted} labelOf={labelOf} />
      </ReportFigure>
    );
  }

  const counts = new Map<string, number>();
  for (const e of sorted) if (!majorOnly || e.significance === 'major') counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  const ringed = new Set([...open, ...marked]);
  const categoryChoices = resolvedCategories.map(c => ({
    value: c.id,
    label: (
      <span className="sv-timeline__chip-label" style={{ color: seriesColor(slotOf.get(c.id) ?? 1) }}>
        <MarkerIcon shape={shapeForSlot(slotOf.get(c.id) ?? 1)} className="sv-timeline__chip-icon" />
        <span className="sv-timeline__chip-text">{c.label}</span>
      </span>
    ),
    count: counts.get(c.id) ?? 0,
  }));
  const majorChoices: Choice<'all' | 'major'>[] = [{ value: 'all', label: 'All events' }, { value: 'major', label: 'Major only' }];
  const controlItems: BarItem[] = [
    ...(showChips
      ? [{
          key: 'category',
          label: 'Category',
          summary: chipsSummary(selected, v => resolvedCategories.find(c => c.id === v)?.label ?? v),
          active: selected.size > 0,
          panel: <FilterChips label="Category" hideLabel selected={selected} onChange={setSelected} choices={categoryChoices} />,
        }]
      : []),
    ...(showMajorToggle
      ? [{
          key: 'major',
          label: 'Show',
          summary: majorOnly ? 'Major only' : 'All events',
          active: majorOnly,
          hideLabel: true,
          single: true,
          panel: <ChoiceGroup label="Show" hideLabel value={majorOnly ? 'major' : 'all'} onChange={value => setMajorOnly(value === 'major')} choices={majorChoices} />,
        }]
      : []),
  ];

  return (
    <ReportFigure id={id} title={title} subtitle={subtitle} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-timeline">
      {(showChips || showMajorToggle) && <ControlBar label="Filter events" items={controlItems} />}
      {!showChips && legend}
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
        <>
          <Axis
            axis={axis}
            events={sorted}
            shown={visible.map(v => v.i)}
            named={named}
            on={ringed}
            colorOf={colorOf}
            marker={marker}
            onPick={i => {
              setCardOpen(i, !open.has(i));
              cardsRef.current?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }}
          />
          {named ? (
            <>
              <ul className="sv-timeline__notes">
                {visible.filter(({ e }) => e.description).map(({ e }) => (
                  <li key={`${e.date}-${e.title}`}><strong>{e.title}:</strong> {e.description}</li>
                ))}
              </ul>
              <EventList events={visible.map(v => v.e)} labelOf={labelOf} />
            </>
          ) : (
            <ol className="sv-timeline__cards" ref={cardsRef}>
              {visible.map(({ e, i }) => {
                const category = labelOf.get(e.category) ?? e.category;
                const head = <CardHead event={e} marker={marker(e, 'sv-timeline__card-marker')} category={category} major={e.significance === 'major' && hasMinor} />;
                const detail = e.description || (e.sources && e.sources.length > 0) || e.href;
                return (
                  <li
                    key={`${e.date}-${i}-${e.title}`}
                    className="sv-timeline__item"
                    data-index={i}
                    data-row={e.title}
                    data-significance={e.significance === 'major' ? 'major' : 'minor'}
                    style={{ '--sv-timeline-color': colorOf(e)}}
                  >
                    {detail ? (
                      <details className="sv-timeline__card" open={open.has(i)} onToggle={event => setCardOpen(i, event.currentTarget.open)}>
                        <summary>{head}</summary>
                        <div className="sv-timeline__more">
                          <p className="sv-timeline__desc">
                            <span className="sv-timeline__category">{category}</span>
                            {e.description && <> · {e.description}</>}
                          </p>
                          {e.href && <p className="sv-timeline__link"><a href={e.href}>Read more</a></p>}
                          {e.sources && e.sources.length > 0 && <SourceLine sources={e.sources} />}
                        </div>
                      </details>
                    ) : (
                      <div className="sv-timeline__card">{head}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </ReportFigure>
  );
}

/** A card's one line: marker, title, and date, with the category in words for a screen reader. */
function CardHead({ event, marker, category, major }: { event: TimelineEvent; marker: ReactNode; category: string; major?: boolean }) {
  return (
    <span className="sv-timeline__card-head">
      {marker}
      <span className="sv-timeline__title">{event.title}</span>
      <span className="sv-timeline__date"><EventDates event={event} /></span>
      <span className="sv-visually-hidden"> · {category}{major && ' · major event'}</span>
    </span>
  );
}

/** Half the gap left in the baseline at a break, in percent of the axis. */
const BREAK_GAP = 1.2;

/**
 * The time axis: every event a marker, stacked where markers would overlap,
 * one that lasted drawn as a bar, and a break wherever a long empty stretch
 * is cut out. With cards, it is a picture of their dates (the cards say the
 * same in words) and clicking a marker opens its card; with names on the axis,
 * the names are the content.
 */
function Axis({ axis, events, shown, named, on, colorOf, marker, onPick }: {
  axis: EventAxis;
  events: TimelineEvent[];
  shown: number[];
  named: boolean;
  /** Markers ringed: the cards open or shown. */
  on: Set<number>;
  colorOf: (e: TimelineEvent) => string;
  marker: (e: TimelineEvent, className: string) => ReactNode;
  onPick?: (i: number) => void;
}) {
  const levels = Math.max(0, ...shown.map(i => axis.levels[i])) + 1;
  return (
    <div className="sv-timeline__axis" aria-hidden="true" data-named={named || undefined} style={{ '--sv-axis-levels': levels}}>
      <div className="sv-timeline__track">
        {/* The baseline, in pieces with a gap and a break mark wherever a stretch is cut out. */}
        {baselinePieces(axis.scale.breaks, BREAK_GAP).map(({ from, to }) => (
          <span key={from} className="sv-timeline__baseline" style={{ left: `${from}%`, width: `${to - from}%` }} />
        ))}
        {axis.scale.breaks.map(x => <span key={x} className="sv-timeline__break" style={{ left: `${x}%` }} />)}
        {shown.map(i => {
          const e = events[i];
          const { x, end } = axis.places[i];
          const style = { left: `${x}%`, '--sv-level': axis.levels[i], color: colorOf(e) } satisfies CSSProperties;
          return (
            <Fragment key={`${e.date}-${i}`}>
              {end !== undefined && end - x > 0.5 && <span className="sv-timeline__span" style={{ ...style, width: `${end - x}%` }} />}
              <span
                className="sv-timeline__pin"
                data-row={named ? e.title : undefined}
                data-on={on.has(i) || undefined}
                data-clickable={onPick && !named ? true : undefined}
                onClick={onPick && !named ? () => onPick(i) : undefined}
                style={style}
              >
                {marker(e, 'sv-timeline__pin-icon')}
                {named && <span className="sv-timeline__name">{e.title}</span>}
              </span>
            </Fragment>
          );
        })}
      </div>
      <div className="sv-timeline__ticks">
        {axis.ticks.map(tick => (
          <span key={`${tick.x}-${tick.label}`} className="sv-timeline__tick" data-edge={tickEdge(tick.x)} style={{ left: `${tick.x}%` }}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Every event in words, for a screen reader, where the axis alone shows them. */
function EventList({ events, labelOf }: { events: TimelineEvent[]; labelOf: Map<string, string> }) {
  return (
    <ol className="sv-visually-hidden">
      {events.map((e, i) => (
        <li key={`${e.date}-${i}`}>
          {spokenDate(e.date)}{e.endDate && ` to ${spokenDate(e.endDate)}`}: {e.title} ({labelOf.get(e.category) ?? e.category})
        </li>
      ))}
    </ol>
  );
}
