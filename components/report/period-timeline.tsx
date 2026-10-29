import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { EventKey, EventLane, type StripEvent } from './event-strip';
import { ReportFigure, SourceCredits } from './figure';
import { formatDate, slugify } from './format';
import { MapReadout } from './geo/map-readout';
import { placePeriodLabels } from './period-layout';
import { seriesColor } from './scale';
import { edgeOf, percentAlong, spanOf, timeTicks, toYear, type TimeSpan } from './time-axis';
import { COMPACT_PREVIEW_ITEMS } from './ranked-columns';
import type { FigurePreview, PartialDate, SourceCredit } from './types';

export type Period = {
  from: PartialDate;
  /** Omit for something still in force: the bar runs to the end of the axis with an open end. */
  to?: PartialDate;
  label?: string;
  /** Joins to `categories[].id` for colour. Name the category in `label` too — colour alone is not enough. */
  category?: string;
  /** A period dated by a source of its own: listed beside it in the table. */
  sources?: SourceCredit[];
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
  /**
   * The date the figure is current to (the topic's `lastUpdated`). An open
   * period reads "still in force" only when the axis ends on it; otherwise
   * it reads "no end by <axis end>", since the data says nothing after that.
   */
  asOf?: PartialDate;
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
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  /**
   * Draw the compact preview: the linked title, the category key, every row
   * and period, the event markers and one axis. The event list, the open-end
   * key and the Table view stay on the full figure.
   */
  preview?: FigurePreview;
};

/** A preview's track sits beside its row labels in a slide, so it holds fewer ticks than the page's. */
const PREVIEW_TICKS = 5;

/** The axis a period timeline draws: every period and event, unless `from` or `to` fix an end. */
export function periodSpan({ rows, events = [], from, to }: Pick<PeriodTimelineProps, 'rows' | 'events' | 'from' | 'to'>): TimeSpan {
  return spanOf([...rows.flatMap(r => r.periods.flatMap(p => [p.from, ...(p.to ? [p.to] : [])])), ...events.map(e => e.date)], { from, to });
}

/**
 * Spans over a shared time axis, Gantt-style: one row per policy, route or
 * government, each with one or more periods, plus optional point events.
 *
 * Use it when the argument is about overlap and sequence — which routes were
 * open while a number rose, which government was in office when a rule
 * changed. HTML rather than SVG, so labels stay real text at every width.
 * A label sits in its bar if it fits, else just right of it if the row is
 * free there, else not on the graph at all — the legend colour, the
 * hover-and-focus readout and the Table view name every period — so every
 * row stays one line high. A span under eighteen months gets month ticks.
 */
export function PeriodTimeline({
  rows,
  events = [],
  categories = [],
  from,
  to,
  asOf,
  rowLabel = 'Row',
  id,
  title,
  description,
  sources,
  note,
  footer,
  panel,
  headingLevel,
  preview,
}: PeriodTimelineProps) {
  const reactId = useId();
  const baseId = `sv-periods-${id ?? slugify(title ?? 'periods')}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const span = periodSpan({ rows, events, from, to });
  const slotOf = new Map(categories.map((c, i) => [c.id, i + 1]));
  const ticks = timeTicks(span, preview ? PREVIEW_TICKS : undefined);
  const orderedEvents = [...events].sort((a, b) => toYear(a.date) - toYear(b.date));
  const hasOpen = rows.some(r => r.periods.some(p => !p.to));
  const axisEnd = to === undefined ? String(span.to) : typeof to === 'number' ? String(to) : formatDate(to);
  const stillInForce = asOf !== undefined && toYear(asOf) === span.to;
  const periodText = (period: Period) =>
    `${formatDate(period.from)} – ${period.to ? formatDate(period.to) : stillInForce ? 'still in force' : `no end by ${axisEnd}`}`;

  const axis = (
    <div className="sv-periods__line sv-periods__line--axis" aria-hidden="true">
      <span className="sv-periods__label-cell" />
      <div className="sv-periods__axis">
        {ticks.map(tick => (
          <span key={tick.at} className="sv-periods__tick" data-minor={tick.minor || undefined} data-edge={edgeOf(percentAlong(tick.at, span))} style={{ left: `${percentAlong(tick.at, span)}%` }}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );

  const gridlines = ticks.map(tick => (
    <span key={tick.at} className="sv-periods__grid" style={{ left: `${percentAlong(tick.at, span)}%` }} aria-hidden="true" />
  ));

  // The rows, event lane and axis: inside the hover-and-focus readout on the full figure, alone in a preview.
  const plot = (
    <>
      {!preview && axis}
      <ol className="sv-periods__rows" aria-label={title ?? 'Periods'}>
        {rows.map((row, r) => {
          const bars = row.periods.map(period => {
            const left = percentAlong(toYear(period.from), span);
            const right = period.to ? percentAlong(toYear(period.to), span) : 100;
            return { period, left, width: Math.max(0.6, right - left), label: period.label ?? '' };
          });
          const placements = placePeriodLabels(bars.map(bar => ({ left: bar.left, right: bar.left + bar.width, label: bar.label })));
          return (
            <li key={`${row.label}-${r}`} className="sv-periods__line sv-periods__row">
              <p className="sv-periods__label-cell sv-periods__row-label">{row.label}</p>
              <div className="sv-periods__track">
                {gridlines}
                {bars.map((bar, i) => {
                  const readout = `${row.label} — ${bar.label ? `${bar.label}: ` : ''}${periodText(bar.period)}`;
                  return (
                    <span
                      key={i}
                      className="sv-periods__bar"
                      role="img"
                      // A preview has no readout and takes no focus stops; each bar still names itself.
                      tabIndex={preview ? undefined : 0}
                      aria-label={readout}
                      data-region={preview ? undefined : `${baseId}-${r}-${i}`}
                      data-readout={preview ? undefined : readout}
                      data-open={bar.period.to ? undefined : 'true'}
                      style={{ left: `${bar.left}%`, width: `${bar.width}%`, '--sv-period-color': seriesColor(slotOf.get(bar.period.category ?? '') ?? 1) }}
                    >
                      {placements[i] === 'inside' && <span className="sv-periods__bar-label" aria-hidden="true">{bar.label}</span>}
                    </span>
                  );
                })}
                {bars.map((bar, i) => placements[i] === 'right' && (
                  <span key={`side-${i}`} className="sv-periods__side-label" aria-hidden="true" style={{ left: `${bar.left + bar.width}%` }}>
                    {bar.label}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      {orderedEvents.length > 0 && (
        <div className="sv-periods__line sv-periods__line--events">
          <p className="sv-periods__label-cell sv-periods__row-label">Events</p>
          <EventLane span={span} events={orderedEvents} keyId={`${baseId}-event`} showAxis={false} linked={!preview} />
        </div>
      )}
      {axis}
    </>
  );

  const graph = (
    <div className="sv-periods" data-compact={(preview && rows.length > COMPACT_PREVIEW_ITEMS) || undefined}>
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
      {preview ? plot : <MapReadout hint="Hover over or tab to a bar to read its period and dates.">{plot}</MapReadout>}
      {hasOpen && !preview && (
        <p className="sv-periods__open-key">
          <span className="sv-periods__open-icon" aria-hidden="true" />{' '}
          {stillInForce ? 'Arrowhead: no end date — still in force' : `Arrowhead: no end date by ${axisEnd}, where the axis ends`}
        </p>
      )}
      {orderedEvents.length > 0 && !preview && <EventKey events={orderedEvents} keyId={`${baseId}-event`} />}
    </div>
  );

  if (preview) return <ReportFigure id={id} title={title} preview={preview} className="sv-period-timeline">{graph}</ReportFigure>;

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
                <td>
                  {p.label ?? '—'}
                  {p.sources && <SourceCredits sources={p.sources} />}
                </td>
                <td>{formatDate(p.from)}</td>
                <td>{p.to ? formatDate(p.to) : stillInForce ? 'Still in force' : `No end by ${axisEnd}`}</td>
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
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-period-timeline">
      <ChartViewToggle label={title ?? 'Periods'} graph={graph} table={table} />
    </ReportFigure>
  );
}
