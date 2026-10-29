import { useId, type CSSProperties } from 'react';
import { CHART_GEOMETRY } from '@/lib/chart/series-chart';
import { DetailsTarget } from './details-target';
import { SourceLine } from './figure';
import { compareDates, formatDate } from './format';
import { edgeOf, percentAlong, stackLevels, toYear, yearTicks, type TimeSpan } from './time-axis';
import type { PartialDate, SourceCredit } from './types';

export type StripEvent = {
  date: PartialDate;
  label: string;
  description?: string;
  source?: SourceCredit;
  href?: string;
};

/**
 * How the strip's time axis lines up with the chart above it. `series-chart`
 * matches the plot area of the topic SeriesChart at both of its sizes, so
 * 2022 on the strip sits under 2022 on the line; `none` spans the full width;
 * or give the plot's left and right insets in percent.
 */
export type StripAlign = 'series-chart' | 'none' | { left: number; right: number };

export type EventStripProps = {
  /** Start and end of the time axis — the same as the chart's, for alignment. */
  from: number | PartialDate;
  to: number | PartialDate;
  events: StripEvent[];
  align?: StripAlign;
  /** Year labels under the strip. Off when the chart's own axis sits directly above. */
  showAxis?: boolean;
  /** Visible heading for the numbered key. */
  keyTitle?: string;
  id?: string;
  /**
   * The period a focus-window chart shows. Only events inside it get a
   * marker; the rest stay in the numbered key, marked as outside the period
   * shown, so no event silently drops out of the chart.
   */
  window?: { from: PartialDate; to: PartialDate };
};

const pct = (n: number) => `${Math.round(n * 1000) / 1000}%`;

function alignVars(align: StripAlign): CSSProperties {
  if (align === 'none') return { '--sv-strip-left': '0%', '--sv-strip-right': '0%' };
  if (typeof align === 'object') return { '--sv-strip-left': pct(align.left), '--sv-strip-right': pct(align.right) };
  const inset = (variant: 'narrow' | 'wide') => {
    const g = CHART_GEOMETRY[variant];
    return { left: pct((g.left / g.width) * 100), right: pct(((g.width - g.left - g.plotWidth) / g.width) * 100) };
  };
  const narrow = inset('narrow');
  const wide = inset('wide');
  return {
    '--sv-strip-left-narrow': narrow.left,
    '--sv-strip-right-narrow': narrow.right,
    '--sv-strip-left-wide': wide.left,
    '--sv-strip-right-wide': wide.right,
  };
}

/**
 * The marker lane on its own: numbered markers on a hairline across a time
 * span. Shared with PeriodTimeline, which puts it under its rows.
 */
export function EventLane({
  span,
  events,
  keyId,
  showAxis,
  numbers = events.map((_, i) => i + 1),
}: {
  span: TimeSpan;
  events: StripEvent[];
  keyId: string;
  showAxis: boolean;
  /** Each marker's number in the key, when the lane shows only some of the key's events. */
  numbers?: number[];
}) {
  const positions = events.map(e => percentAlong(toYear(e.date), span));
  // A numbered marker is ~1.4rem wide; at a 340px plot that is ~7% of the span.
  const levels = stackLevels(positions, 7);
  const depth = Math.max(0, ...levels) + 1;
  return (
    <div className="sv-event-strip__lane" style={{ '--sv-strip-levels': depth }}>
      <div className="sv-event-strip__track">
        <span className="sv-event-strip__rule" aria-hidden="true" />
        {/* Stems first, discs after: a stacked disc's stem must pass behind
            the disc beneath it, not across its number. */}
        {events.map((e, i) => (
          <span key={`stem-${i}`} className="sv-event-strip__stem" aria-hidden="true" style={{ left: pct(positions[i]), '--sv-strip-level': levels[i] }} />
        ))}
        {events.map((e, i) => (
          <a
            key={i}
            className="sv-event-strip__marker"
            href={`#${keyId}-${numbers[i]}`}
            style={{ left: pct(positions[i]), '--sv-strip-level': levels[i] }}
            aria-label={`${numbers[i]}: ${formatDate(e.date)}, ${e.label}`}
          >
            <span aria-hidden="true">{numbers[i]}</span>
          </a>
        ))}
      </div>
      {showAxis && (
        <div className="sv-event-strip__axis" aria-hidden="true">
          {yearTicks(span).map(tick => (
            <span key={tick.year} className="sv-event-strip__tick" data-minor={tick.minor || undefined} data-edge={edgeOf(percentAlong(tick.year, span))} style={{ left: pct(percentAlong(tick.year, span)) }}>
              {tick.year}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The numbered list the markers point at.
 *
 * An item with anything beyond its date and label is a closed `<details>`:
 * five events otherwise make a fifteen-line key — the block of text the
 * markers were meant to replace. The id sits on the `<details>`, so a
 * marker's `#{keyId}-{n}` link lands on it, and DetailsTarget (or a fact
 * page's own script) opens it. `href` goes in the body, not the summary: a
 * link inside a `<summary>` is a second click target in one control.
 */
export function EventKey({ events, keyId, title, outside = [] }: {
  events: StripEvent[];
  keyId: string;
  title?: string;
  /** Events with no marker because they fall outside the period the chart shows; they keep their place in the key. */
  outside?: boolean[];
}) {
  return (
    <>
      {title && <p className="sv-event-strip__key-title">{title}</p>}
      <ol className="sv-event-strip__key">
        {events.map((e, i) => {
          const id = `${keyId}-${i + 1}`;
          const head = (
            <>
              <span className="sv-event-strip__number" aria-hidden="true">{i + 1}</span>
              <span className="sv-event-strip__item-head">
                <time dateTime={e.date}>{formatDate(e.date)}</time>
                {outside[i] && <span className="sv-event-strip__outside"> (outside the period shown)</span>}
                {' '}
                <span className="sv-event-strip__label">{e.label}</span>
              </span>
            </>
          );
          // Nothing to expand: a plain item still carries the id the marker links to.
          if (!e.description && !e.source && !e.href) {
            return <li key={i} id={id} className="sv-event-strip__item" data-bare="">{head}</li>;
          }
          return (
            <li key={i} className="sv-event-strip__item">
              <details className="sv-event-strip__details" id={id}>
                <summary className="sv-event-strip__summary">{head}</summary>
                <div className="sv-event-strip__body">
                  {e.description && <p className="sv-event-strip__desc">{e.description}</p>}
                  {e.source && <SourceLine sources={[e.source]} />}
                  {e.href && <p className="sv-event-strip__link"><a href={e.href}>See the evidence</a></p>}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/**
 * A thin strip of numbered event markers on a time axis, meant to sit
 * directly under a line chart so a trend can be read against the decisions
 * around it, with the events listed in a key below.
 *
 * It marks when things happened and nothing more: a marker beside a turn in
 * the line is an invitation to look, not a claim that one caused the other.
 */
export function EventStrip({ from, to, events, align = 'series-chart', showAxis = true, keyTitle = 'Events marked above', id, window: shown }: EventStripProps) {
  const reactId = useId();
  const keyId = `sv-event-strip-${id ?? reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const span = { from: toYear(from), to: toYear(to) };
  const ordered = [...events].sort((a, b) => toYear(a.date) - toYear(b.date));
  // The island scopes itself to the strip's root; with no id given, the key's
  // own prefix is unique and free.
  const rootId = id ?? keyId;
  const outside = ordered.map(e => shown !== undefined && !(compareDates(e.date, shown.from) >= 0 && (compareDates(e.date, shown.to) <= 0 || e.date.startsWith(shown.to))));
  const marked = ordered.flatMap((e, i) => (outside[i] ? [] : [{ event: e, number: i + 1 }]));
  return (
    <div className="sv-event-strip" id={rootId} data-align={typeof align === 'string' ? align : 'custom'} style={alignVars(align)}>
      <EventLane span={span} events={marked.map(m => m.event)} numbers={marked.map(m => m.number)} keyId={keyId} showAxis={showAxis} />
      <EventKey events={ordered} keyId={keyId} title={keyTitle} outside={outside} />
      <DetailsTarget rootId={rootId} />
    </div>
  );
}
