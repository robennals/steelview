import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { EventKey, EventLane, type StripEvent } from './event-strip';
import { ReportFigure } from './figure';
import { formatDate, slugify } from './format';
import { seriesColor } from './scale';
import { edgeOf, percentAlong, toYear, yearTicks, type TimeSpan } from './time-axis';
import type { PartialDate, SourceCredit } from './types';

export type Period = {
  from: PartialDate;
  /** Omit for something still in force: the bar runs to the end of the axis with an open end. */
  to?: PartialDate;
  label?: string;
  /** Joins to `categories[].id` for colour. Name the category in `label` too — colour alone is not enough. */
  category?: string;
};

export type PeriodRow = { label: string; periods: Period[] };

export type PeriodCategory = { id: string; label: string };

export type PeriodTimelineProps = {
  rows: PeriodRow[];
  /** Point events, drawn as numbered markers in a lane under the rows and listed below. */
  events?: StripEvent[];
  categories?: PeriodCategory[];
  /** Axis start. Defaults to the start of the earliest year in the data. */
  from?: number | PartialDate;
  /** Axis end, and where open-ended periods stop. Defaults to the start of the year after the latest date. */
  to?: number | PartialDate;
  /** Column heading for the rows in the table, e.g. "Route" or "Government". */
  rowLabel?: string;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  headingLevel?: 2 | 3;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
};

/**
 * Below this share of the axis a label is not put inside its bar. Sized for
 * the narrow rendering (a ~300px track, ~6px per character at 11px) so a
 * label that fits on a phone also fits on a desktop.
 */
function fitsInside(label: string, widthPercent: number) {
  return (widthPercent / 100) * 300 >= label.length * 6.2 + 12;
}

function periodText(period: Period) {
  return `${formatDate(period.from)} – ${period.to ? formatDate(period.to) : 'ongoing'}`;
}

/**
 * Spans over a shared time axis, Gantt-style: one row per policy, route or
 * government, each with one or more periods, plus optional point events.
 *
 * Use it when the argument is about overlap and sequence — which routes were
 * open while a number rose, which government was in office when a rule
 * changed. HTML rather than SVG, so labels stay real text at every width:
 * short labels sit in their bars, long ones drop beneath, and the Table view
 * lists every span with its dates.
 */
export function PeriodTimeline({
  rows,
  events = [],
  categories = [],
  from,
  to,
  rowLabel = 'Row',
  id,
  title,
  description,
  sources,
  note,
  footer,
  headingLevel,
}: PeriodTimelineProps) {
  const reactId = useId();
  const baseId = `sv-periods-${id ?? slugify(title ?? 'periods')}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const allDates = [...rows.flatMap(r => r.periods.flatMap(p => [p.from, ...(p.to ? [p.to] : [])])), ...events.map(e => e.date)];
  const years = allDates.map(toYear);
  const span: TimeSpan = {
    from: from !== undefined ? toYear(from) : Math.floor(Math.min(...years)),
    to: to !== undefined ? toYear(to) : Math.floor(Math.max(...years)) + 1,
  };
  const slotOf = new Map(categories.map((c, i) => [c.id, i + 1]));
  const ticks = yearTicks(span);
  const orderedEvents = [...events].sort((a, b) => toYear(a.date) - toYear(b.date));
  const hasOpen = rows.some(r => r.periods.some(p => !p.to));

  const axis = (
    <div className="sv-periods__line sv-periods__line--axis" aria-hidden="true">
      <span className="sv-periods__label-cell" />
      <div className="sv-periods__axis">
        {ticks.map(tick => (
          <span key={tick.year} className="sv-periods__tick" data-minor={tick.minor || undefined} data-edge={edgeOf(percentAlong(tick.year, span))} style={{ left: `${percentAlong(tick.year, span)}%` }}>
            {tick.year}
          </span>
        ))}
      </div>
    </div>
  );

  const gridlines = ticks.map(tick => (
    <span key={tick.year} className="sv-periods__grid" style={{ left: `${percentAlong(tick.year, span)}%` }} aria-hidden="true" />
  ));

  const graph = (
    <div className="sv-periods">
      {categories.length > 0 && (
        <ul className="sv-chart__legend sv-periods__legend">
          {categories.map(c => (
            <li key={c.id} className="sv-periods__legend-key">
              <i className="sv-periods__swatch" style={{ '--sv-period-color': seriesColor(slotOf.get(c.id) ?? 1) }} aria-hidden="true" />
              {c.label}
            </li>
          ))}
        </ul>
      )}
      {axis}
      <ol className="sv-periods__rows" aria-label={title ?? 'Periods'}>
        {rows.map((row, r) => {
          const placed = row.periods.map(period => {
            const left = percentAlong(toYear(period.from), span);
            const right = period.to ? percentAlong(toYear(period.to), span) : 100;
            const width = Math.max(0.6, right - left);
            const label = period.label ?? '';
            return { period, left, width, label, inside: label === '' || fitsInside(label, width) };
          });
          const outside = placed.filter(p => !p.inside);
          return (
            <li key={`${row.label}-${r}`} className="sv-periods__line sv-periods__row">
              <p className="sv-periods__label-cell sv-periods__row-label">{row.label}</p>
              <div className="sv-periods__cell">
                <div className="sv-periods__track">
                  {gridlines}
                  {placed.map((p, i) => (
                    <span
                      key={i}
                      className="sv-periods__bar"
                      data-open={p.period.to ? undefined : 'true'}
                      style={{ left: `${p.left}%`, width: `${p.width}%`, '--sv-period-color': seriesColor(slotOf.get(p.period.category ?? '') ?? 1) }}
                    >
                      {p.inside && p.label && <span className="sv-periods__bar-label" aria-hidden="true">{p.label}</span>}
                    </span>
                  ))}
                </div>
                {outside.map((p, i) => (
                  <span
                    key={i}
                    className="sv-periods__outside-label"
                    aria-hidden="true"
                    // One line per outside label, so two short periods in a row never overprint.
                    style={p.left > 55 ? { paddingRight: `${Math.max(0, 100 - p.left - p.width)}%`, textAlign: 'right' } : { paddingLeft: `${p.left}%` }}
                  >
                    {p.label}
                  </span>
                ))}
                <span className="sv-visually-hidden">
                  {row.periods.map(p => `${p.label ? `${p.label}: ` : ''}${periodText(p)}`).join('; ')}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {orderedEvents.length > 0 && (
        <div className="sv-periods__line sv-periods__line--events">
          <p className="sv-periods__label-cell sv-periods__row-label">Events</p>
          <EventLane span={span} events={orderedEvents} keyId={`${baseId}-event`} showAxis={false} />
        </div>
      )}
      {axis}
      {hasOpen && <p className="sv-periods__open-key"><span className="sv-periods__open-icon" aria-hidden="true" /> Arrowhead: no end date — still in force</p>}
      {orderedEvents.length > 0 && <EventKey events={orderedEvents} keyId={`${baseId}-event`} />}
    </div>
  );

  const table = (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table sv-periods__table">
        <caption>{title ?? 'Periods'}</caption>
        <thead>
          <tr>
            <th scope="col">{rowLabel}</th>
            <th scope="col">Period</th>
            <th scope="col">From</th>
            <th scope="col">To</th>
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((row, r) =>
            row.periods.map((p, i) => (
              <tr key={`${r}-${i}`}>
                <th scope="row">{row.label}</th>
                <td>{p.label ?? '—'}</td>
                <td>{formatDate(p.from)}</td>
                <td>{p.to ? formatDate(p.to) : 'Ongoing'}</td>
              </tr>
            )),
          )}
          {orderedEvents.map((e, i) => (
            <tr key={`event-${i}`}>
              <th scope="row">Event {i + 1}</th>
              <td>{e.label}</td>
              <td>{formatDate(e.date)}</td>
              <td>—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} headingLevel={headingLevel} className="sv-period-timeline">
      <ChartViewToggle label={title ?? 'Periods'} graph={graph} table={table} />
    </ReportFigure>
  );
}
