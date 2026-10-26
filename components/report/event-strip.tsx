import { useId, type CSSProperties } from 'react';
import { CHART_GEOMETRY } from '@/lib/chart/series-chart';
import { SourceLine } from './figure';
import { formatDate } from './format';
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
}: {
  span: TimeSpan;
  events: StripEvent[];
  keyId: string;
  showAxis: boolean;
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
            href={`#${keyId}-${i + 1}`}
            style={{ left: pct(positions[i]), '--sv-strip-level': levels[i] }}
            aria-label={`${i + 1}: ${formatDate(e.date)}, ${e.label}`}
          >
            <span aria-hidden="true">{i + 1}</span>
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

/** The numbered list the markers point at. */
export function EventKey({ events, keyId, title }: { events: StripEvent[]; keyId: string; title?: string }) {
  return (
    <>
      {title && <p className="sv-event-strip__key-title">{title}</p>}
      <ol className="sv-event-strip__key">
        {events.map((e, i) => (
          <li key={i} id={`${keyId}-${i + 1}`} className="sv-event-strip__item">
            <span className="sv-event-strip__number" aria-hidden="true">{i + 1}</span>
            <div>
              <p className="sv-event-strip__item-head">
                <time dateTime={e.date}>{formatDate(e.date)}</time>
                {' '}
                {e.href ? <a href={e.href}>{e.label}</a> : <span className="sv-event-strip__label">{e.label}</span>}
              </p>
              {e.description && <p className="sv-event-strip__desc">{e.description}</p>}
              {e.source && <SourceLine sources={[e.source]} />}
            </div>
          </li>
        ))}
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
export function EventStrip({ from, to, events, align = 'series-chart', showAxis = true, keyTitle = 'Events marked above', id }: EventStripProps) {
  const reactId = useId();
  const keyId = `sv-event-strip-${id ?? reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const span = { from: toYear(from), to: toYear(to) };
  const ordered = [...events].sort((a, b) => toYear(a.date) - toYear(b.date));
  return (
    <div className="sv-event-strip" id={id} data-align={typeof align === 'string' ? align : 'custom'} style={alignVars(align)}>
      <EventLane span={span} events={ordered} keyId={keyId} showAxis={showAxis} />
      <EventKey events={ordered} keyId={keyId} title={keyTitle} />
    </div>
  );
}
