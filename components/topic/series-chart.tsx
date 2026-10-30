import type { ReactNode } from 'react';
import { EventStrip, formatDate, type StripEvent } from '@/components/report';
import { ChartViewToggle } from './chart-view-toggle';
import { GlossaryTerm } from './glossary-term';
import type { ChartPreview } from './comparison-chart';
import { FocusSwitch } from './focus-switch';
import { SeriesHighlight } from './series-highlight';
import { comparePeriods } from '@/lib/content/period';
import type { Series, SeriesLine, SeriesPoint, SeriesReading, Source } from '@/lib/content/types';
import {
  CHART_GEOMETRY,
  axisEnd,
  focusWindow,
  formatValue,
  hasOwnSpans,
  layoutContext,
  layoutReading,
  lineSpan,
  midSentence,
  pathFor,
  readingRows,
  seriesSlots,
  seriesStrokeDash,
  tickLabelWidth,
  unmeasuredSpan,
  PREVIEW_VARIANTS,
  type SeriesVariant,
  type FocusWindow,
} from '@/lib/chart/series-chart';

/**
 * A fact's time series, drawn server-side as inline SVG.
 *
 * The reason this exists is the owner's:
 *
 * > For facts about numbers, we should ideally show trends over time and a
 * > graph. It's very easy to give a misleading picture by cherry picking
 * > dates. Harder if we require always showing a time series.
 *
 * So the chart's job is not decoration and not summary — it is to put the
 * years an arguer did *not* mention on the same page as the one they did. It
 * follows that every part of it is non-optional: the whole published range
 * (enforced in validate.ts), every reading the series carries, the breaks
 * drawn as breaks, the source quoted, and the numbers themselves one
 * disclosure away so a sceptical reader can check the line rather than
 * eyeball it.
 *
 * No charting library and no client JavaScript: the pages are statically
 * generated, so the chart ships as markup that themes with the page's own
 * tokens, prints, and is there with JavaScript off.
 */

const NBSP_DASH = '–';

function Plot({
  series,
  reading,
  variant,
  descriptionId,
  window,
}: {
  series: Series;
  reading: SeriesReading;
  variant: SeriesVariant;
  descriptionId: string;
  /** Draw only this period, at readable scale, with the lines clipped at the plot edges. */
  window?: FocusWindow;
}) {
  const layout = layoutReading(series, reading, variant, window);
  const g = CHART_GEOMETRY[variant];
  const hatchId = `${descriptionId}-${variant}-hatch`;
  const clipId = `${descriptionId}-${variant}-clip`;
  const right = g.left + g.plotWidth;
  const bottom = g.top + g.plotHeight;
  return (
    <svg
      className="sv-chart__svg"
      data-variant={variant}
      data-window={window ? '' : undefined}
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      /*
       * The name and the description are an attribute and a real paragraph
       * beside the plot, not SVG <title>/<desc>: React 19 treats <title> as
       * document metadata and hoists it into <head>, which would leave the
       * chart nameless. The description element is shared by both size
       * variants, since only ever one of them is displayed.
       */
      aria-label={`${series.title} ${NBSP_DASH} ${reading.label}`}
      aria-describedby={descriptionId}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* A forecast is a shaded zone to the right edge, named in text: the
          dotted line alone would not say which values nobody has measured. */}
      {layout.forecastX !== null && (
        <g className="sv-chart__forecast">
          <rect className="sv-chart__forecast-zone" x={layout.forecastX} y={g.top} width={right - layout.forecastX} height={g.plotHeight} />
          <text className="sv-chart__zone-label" x={layout.forecastX + 4} y={g.top + g.fontSize} fontSize={g.fontSize}>Forecast</text>
        </g>
      )}

      {/* Not measured since: the same ink-4 hatching the maps use for "No
          data", so hatching means "not measured" everywhere on the site. */}
      {layout.unmeasured !== null && series.notMeasuredSince && (
        <g className="sv-chart__unmeasured">
          <defs>
            <pattern id={hatchId} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
              <rect className="sv-chart__hatch-ground" width="5" height="5" />
              <line className="sv-chart__hatch-line" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
          </defs>
          <rect x={layout.unmeasured.x0} y={g.top} width={layout.unmeasured.x1 - layout.unmeasured.x0} height={g.plotHeight} fill={`url(#${hatchId})`} />
          {/* Inside the band only when it fits; the key line under the plot always carries it. */}
          {layout.unmeasured.x1 - layout.unmeasured.x0 >= tickLabelWidth(series.notMeasuredSince.label, g.fontSize) + 8 && (
            <text className="sv-chart__zone-label" x={layout.unmeasured.x0 + 4} y={g.top + g.fontSize} fontSize={g.fontSize}>
              {series.notMeasuredSince.label}
            </text>
          )}
        </g>
      )}

      {/* Gridlines first: recessive hairlines the data is drawn over. */}
      {layout.valueTicks.map((tick) => (
        <line
          key={`grid-${tick.value}`}
          className="sv-chart__grid"
          x1={g.left}
          x2={right}
          y1={tick.y}
          y2={tick.y}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Zero, when the series crosses it. A net-migration line that goes
          negative for fifteen years is the whole point of this chart, and it
          is unreadable without a marked zero. */}
      {layout.zeroY !== null && (
        <line
          className="sv-chart__zero"
          x1={g.left}
          x2={right}
          y1={layout.zeroY}
          y2={layout.zeroY}
          vectorEffect="non-scaling-stroke"
        />
      )}

      <line
        className="sv-chart__axis"
        x1={g.left}
        x2={right}
        y1={bottom}
        y2={bottom}
        vectorEffect="non-scaling-stroke"
      />

      {layout.breaks.map(gap => <line
        key={`break-${gap.period}`}
        className="sv-chart__break"
        x1={gap.x} x2={gap.x} y1={g.top} y2={bottom}
        vectorEffect="non-scaling-stroke"
      />)}

      {/* A window's lines run in from the nearest point outside it; clip them at the plot edges. */}
      {window && (
        <defs>
          <clipPath id={clipId}>
            {/* Room on the right for an end marker sitting on the edge. */}
            <rect x={g.left} y={g.top - g.markerRadius} width={g.plotWidth + g.markerRadius} height={g.plotHeight + 2 * g.markerRadius} />
          </clipPath>
        </defs>
      )}

      {layout.lines.map((line) => (
        <g key={line.name} data-series={line.name} style={{ color: `var(--sv-series-${line.slot})` }} clipPath={window ? `url(#${clipId})` : undefined}>
          {/* A bridge is the step across a break: same colour, dashed and
              faded, so the eye reads "these two ends are not the same
              measurement" instead of one continuous trend. */}
          {line.bridges.map(([from, to], i) => (
            <line
              key={`bridge-${i}`}
              className="sv-chart__bridge"
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* Estimates and forecasts are dotted. A line whose slot is already
              dashed keeps its dash, faded, and its hollow markers carry the cue. */}
          {line.runs.map((run, i) => (
            <g key={`run-${i}`}>
              <path
                className="sv-chart__line"
                data-kind={run.kind === 'measured' ? undefined : run.kind}
                d={pathFor(run.points)}
                strokeDasharray={seriesStrokeDash(line.slot) ?? (run.kind === 'measured' ? undefined : '1 3')}
                opacity={run.kind !== 'measured' && seriesStrokeDash(line.slot) ? 0.6 : undefined}
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="sv-chart__line-hit"
                d={pathFor(run.points)}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
          {line.hollow.filter(p => p !== line.last).map(p => (
            <circle
              key={`hollow-${p.point.period}`}
              className="sv-chart__hollow"
              cx={p.x}
              cy={p.y}
              r={g.markerRadius - 1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <circle
            className="sv-chart__end"
            data-status={line.last.point.status}
            cx={line.last.x}
            cy={line.last.y}
            r={g.markerRadius}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}

      {layout.valueTicks.map((tick) =>
        tick.label === null ? null : (
          <text
            key={`vlabel-${tick.value}`}
            className="sv-chart__tick"
            x={g.left - 8}
            y={tick.y}
            fontSize={g.fontSize}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick.label}
          </text>
        )
      )}

      {layout.timeTicks.map((tick) => (
        <text
          key={`tlabel-${tick.year}`}
          className="sv-chart__tick"
          x={tick.x}
          y={bottom + g.fontSize + 8}
          fontSize={g.fontSize}
          textAnchor="middle"
        >
          {tick.label}
        </text>
      ))}
    </svg>
  );
}

function spanText(span: { from: string; to: string }): string {
  return `${formatDate(span.from)}${NBSP_DASH}${formatDate(span.to)}`;
}

/** "WTI, 1986–2026" for every distinct line in the series, in first-appearance order. */
function lineSpans(series: Series): string[] {
  const seen = new Map<string, string>();
  for (const line of series.readings.flatMap(reading => reading.lines)) {
    if (!seen.has(line.name)) seen.set(line.name, `${line.name}, ${spanText(lineSpan(series, line))}`);
  }
  return [...seen.values()];
}

/** "(from 1986)" after a line whose source publishes a different range from the series; else nothing. */
function spanSuffix(series: Series, line: SeriesLine): string {
  const span = lineSpan(series, line);
  const fromDiffers = comparePeriods(span.from, series.coverage.from) !== 0;
  const toDiffers = comparePeriods(span.to, series.coverage.to) !== 0;
  if (fromDiffers && toDiffers) return ` (${spanText(span)})`;
  if (fromDiffers) return ` (from ${formatDate(span.from)})`;
  if (toDiffers) return ` (to ${formatDate(span.to)})`;
  return '';
}

const STATUS_ABBREVIATION: Record<NonNullable<SeriesPoint['status']>, string> = {
  estimate: 'est.',
  provisional: 'prov.',
  forecast: 'forecast',
};

/** "May 1987 – Oct 2026": a range at month precision at most, for naming a long span in passing. */
function monthSpanText(span: { from: string; to: string }): string {
  return spanText({ from: span.from.slice(0, 7), to: span.to.slice(0, 7) });
}

const FREQUENCY: Record<number, string> = { 4: 'annual', 7: 'monthly', 10: 'daily' };

/**
 * The context strip above a focus window: the full range, small, with the
 * window outlined. It is decoration for a sighted reader finding their place
 * — the main plot and the table carry the data — so it is hidden from
 * assistive technology, and the line under it says the same in words.
 */
function ContextStrip({ series, reading, window }: { series: Series; reading: SeriesReading; window: FocusWindow }) {
  return (
    <div className="sv-chart__context" aria-hidden="true">
      {(['narrow', 'wide'] as const).map(variant => {
        const layout = layoutContext(series, reading, variant, window);
        const g = layout.geometry;
        const bottom = g.top + g.plotHeight;
        return (
          <svg key={variant} className="sv-chart__svg sv-chart__context-svg" data-variant={variant} viewBox={`0 0 ${g.width} ${g.height}`} preserveAspectRatio="xMidYMid meet" focusable="false">
            <rect className="sv-chart__window" x={layout.window.x0} y={g.top} width={layout.window.x1 - layout.window.x0} height={g.plotHeight} vectorEffect="non-scaling-stroke" />
            <line className="sv-chart__axis" x1={g.left} x2={g.left + g.plotWidth} y1={bottom} y2={bottom} vectorEffect="non-scaling-stroke" />
            {layout.breaks.map(x => <line key={`break-${x}`} className="sv-chart__break" x1={x} x2={x} y1={bottom - 6} y2={bottom} vectorEffect="non-scaling-stroke" />)}
            {layout.lines.map(line => (
              <path key={line.name} className="sv-chart__context-line" style={{ color: `var(--sv-series-${line.slot})` }} d={pathFor(line.points)} vectorEffect="non-scaling-stroke" />
            ))}
            {layout.timeTicks.map(tick => (
              <text key={tick.year} className="sv-chart__tick" x={tick.x} y={bottom + g.fontSize + 4} fontSize={g.fontSize} textAnchor="middle">{tick.label}</text>
            ))}
          </svg>
        );
      })}
    </div>
  );
}

function ReadingTable({ series, reading }: { series: Series; reading: SeriesReading }) {
  const rows = readingRows(series, reading);
  const unmeasured = unmeasuredSpan(series);
  const window = focusWindow(series);
  const frequency = FREQUENCY[rows[0]?.period.length ?? 0] ?? '';
  return (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>
          {series.title} {NBSP_DASH} {reading.label}
          {window && `. All ${rows.length.toLocaleString('en-GB')} ${frequency ? `${frequency} ` : ''}values, ${spanText(series.coverage)}. The graph shows ${spanText(window)}`}
          {hasOwnSpans(series) && '. — : outside this source’s published range'}
        </caption>
        <thead>
          <tr>
            <th scope="col">{series.periodLabel}</th>
            {reading.lines.map(line => <th key={line.name} scope="col">{line.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ period, cells }) => (
            <tr key={period}>
              <th scope="row">{period}</th>
              {cells.map((cell, index) => (
                <td key={reading.lines[index].name} data-outside={cell === 'outside' || undefined}>
                  {cell === null || cell === 'outside' ? '—' : formatValue(cell.value, reading.unit)}
                  {cell !== null && cell !== 'outside' && cell.status && (
                    <> (<abbr title={cell.status}>{STATUS_ABBREVIATION[cell.status]}</abbr>)</>
                  )}
                </td>
              ))}
            </tr>
          ))}
          {unmeasured && series.notMeasuredSince && (
            <tr data-unmeasured="">
              <th scope="row">{spanText({ from: unmeasured.from, to: unmeasured.until })}</th>
              <td colSpan={reading.lines.length}>Not measured: {series.notMeasuredSince.label}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Reading({
  series,
  reading,
  factId,
  sourceNumber,
  observations,
  intro,
  events,
  preview,
}: {
  series: Series;
  reading: SeriesReading;
  factId: string;
  sourceNumber: number;
  observations?: ReactNode;
  intro?: string;
  events: StripEvent[];
  /** Compact form for the home page: graph only, links pointing at the fact page. */
  preview?: ChartPreview;
}) {
  const at = (hash: string) => `${preview?.href ?? ''}#${hash}`;
  const Heading = preview ? 'h3' : 'h2';
  const slots = seriesSlots(series);
  const descriptionId = `sv-chart-${factId}-${reading.id}-desc`;
  const points = reading.lines.flatMap(line => line.points);
  const estimates = points.filter(point => point.status === 'estimate' || point.status === 'provisional').length;
  const forecasts = points.filter(point => point.status === 'forecast');
  const firstForecast = forecasts.map(point => point.period).sort(comparePeriods)[0];
  const unmeasured = unmeasuredSpan(series);
  const window = focusWindow(series);
  const statusSentence = [
    estimates > 0 ? `${estimates} value${estimates === 1 ? ' is an estimate or provisional' : 's are estimates or provisional'}` : null,
    forecasts.length > 0 ? `${forecasts.length} ${forecasts.length === 1 ? 'is a forecast' : 'are forecasts'} from ${formatDate(firstForecast)}` : null,
  ].filter(Boolean).join(' and ');
  const description = [
    series.description,
    `Read as ${midSentence(reading.label)}: ${reading.valueLabel}.`,
    window && !preview
      ? `The graph shows ${spanText(window)}; a strip above it shows the full published range ${spanText(series.coverage)}.`
      : null,
    hasOwnSpans(series)
      ? `Each line runs its own source's published range: ${reading.lines.map(line => `${line.name}, ${spanText(lineSpan(series, line))}`).join('; ')}.`
      : null,
    series.breaks.length > 0
      ? `Dashed segments cross ${series.breaks.length} definitional break${series.breaks.length === 1 ? '' : 's'} in the source${preview ? '' : ', explained in Method Changes below this graph'}.`
      : null,
    events.length > 0 && !preview
      ? `${events.length} dated event${events.length === 1 ? ' is' : 's are'} numbered on a strip under the graph and listed below it.`
      : null,
    statusSentence ? `${statusSentence.charAt(0).toUpperCase()}${statusSentence.slice(1)}.` : null,
    unmeasured && series.notMeasuredSince ? `No values after ${formatDate(unmeasured.from)}: ${series.notMeasuredSince.label}.` : null,
    preview ? 'Every value is in the table on the full chart.' : 'Use the Table switch to see every value.',
  ]
    .filter(Boolean)
    .join(' ');

  const plots = (shown?: FocusWindow) => (
    <div className="sv-chart__plot">
      {/* A preview is drawn at each shape its place can use, of which the page
          shows the one that best fills the space, and at the narrow size for a phone. */}
      {preview ? <>
        {PREVIEW_VARIANTS[preview.fit ?? 'wide'].map(variant => <Plot key={variant} series={series} reading={reading} variant={variant} descriptionId={descriptionId} />)}
        <Plot series={series} reading={reading} variant="narrow" descriptionId={descriptionId} />
      </> : <>
        <Plot series={series} reading={reading} variant="narrow" descriptionId={descriptionId} window={shown} />
        <Plot series={series} reading={reading} variant="wide" descriptionId={descriptionId} window={shown} />
      </>}
    </div>
  );

  return (
    <section className="sv-chart__reading" id={`${factId}--chart-${reading.id}`}>
      {!preview && <Heading className="sv-graph-heading">{reading.label}</Heading>}
      {intro && !preview && <p className="sv-chart__desc">{intro}</p>}
      {!preview && (
        <p className="sv-chart__axis-label">
          {reading.valueLabel}, by {midSentence(series.periodLabel)}
        </p>
      )}

      <p className="sv-visually-hidden" id={descriptionId}>
        {description}
      </p>

      {(graph => preview ? graph : <ChartViewToggle label={reading.label} graph={graph} table={<ReadingTable series={series} reading={reading} />} />)(<>
          {/* The legend is part of the graph, not its data table: it identifies
              the rendered lines without repeating a dated value beside each name. */}
          <ul className="sv-chart__legend">
            {reading.lines.map((line) => (
              <li
                key={line.name}
                className="sv-chart__key"
                data-series={line.name}
                tabIndex={0}
                style={{ color: `var(--sv-series-${slots.get(line.name) ?? 1})` }}
              >
                <svg className="sv-chart__swatch" viewBox="0 0 20 8" aria-hidden="true" focusable="false">
                  <line x1="1" y1="4" x2="19" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={seriesStrokeDash(slots.get(line.name) ?? 1)} />
                  <circle cx="10" cy="4" r="3" fill="currentColor" />
                </svg>
                <span className="sv-chart__key-name">{line.glossary ? <GlossaryTerm term={line.glossary}>{line.name}</GlossaryTerm> : line.name}{spanSuffix(series, line)}</span>
              </li>
            ))}
          </ul>
          {/* A preview always draws the full published range, with no event strip. */}
          {window && !preview ? (
            <>
              <ContextStrip series={series} reading={reading} window={window} />
              <p className="sv-chart__focus-note">
                Below: {spanText(window)}, of the full range {monthSpanText(series.coverage)}
              </p>
              <FocusSwitch
                label={`${reading.label} ${NBSP_DASH} period shown`}
                windowLabel={series.focus?.label ?? 'Window'}
                windowView={<>
                  {plots(window)}
                  {events.length > 0 && <EventStrip id={`${factId}--${reading.id}-events`} from={window.from} to={window.to} window={window} events={events} showAxis={false} />}
                </>}
                fullView={<>
                  {plots()}
                  {/* Its own ids: both views are in the markup, one of them hidden. */}
                  {events.length > 0 && <EventStrip id={`${factId}--${reading.id}-events-full`} from={series.coverage.from} to={axisEnd(series)} events={events} showAxis={false} />}
                </>}
              />
            </>
          ) : (
            <>
              {plots()}
              {!preview && events.length > 0 && <EventStrip id={`${factId}--${reading.id}-events`} from={series.coverage.from} to={axisEnd(series)} events={events} showAxis={false} />}
            </>
          )}
        </>)}

      {!preview && (estimates > 0 || forecasts.length > 0) && (
        <p className="sv-chart__annotation-key">
          {estimates > 0 && 'Dotted: estimates or provisional values. '}
          {forecasts.length > 0 && `Shaded: forecasts${series.coverage.note ? ` (${series.coverage.note})` : ''}.`}
        </p>
      )}
      {!preview && unmeasured && series.notMeasuredSince && (
        <p className="sv-chart__annotation-key">
          Hatched: {series.notMeasuredSince.label}, {formatDate(unmeasured.from)} {NBSP_DASH} {formatDate(unmeasured.until)}.{' '}
          <a data-evidence-link="true" href={at(`${factId}--${reading.id}-not-measured`)}>Why</a>
        </p>
      )}

      {!preview && series.breaks.length > 0 && <p className="sv-chart__annotation-key">Vertical dashed lines mark measurement changes. <a data-evidence-link="true" href={at(`${factId}--${reading.id}-method-${series.breaks[0].period}`)}>See method changes</a>.</p>}
      {!preview && <p className="sv-chart__credit">Source: <a href={at(`source-${factId}-${sourceNumber}`)}>{(reading.source ?? series.source).publisher} [{sourceNumber}]</a></p>}

      {observations}
    </section>
  );
}

/** A series' events as strip markers, each crediting the fact citation that dates it. */
export function stripEvents(series: Pick<Series, 'events'>, factId: string, sources: Source[]): StripEvent[] {
  return series.events.map(event => {
    const cited = event.source === undefined ? undefined : sources[event.source - 1];
    return {
      date: event.period,
      label: event.label,
      description: event.note,
      source: cited && { label: cited.publisher, href: `#source-${factId}-${event.source}`, number: event.source },
    };
  });
}

export function SeriesChart({ factId, chartId = 'series', series, sourceOffset = 0, observations = {}, sources = [], preview }: { factId: string; chartId?: string; series: Series; sourceOffset?: number; observations?: Record<string, ReactNode>; sources?: Source[]; preview?: ChartPreview }) {
  const events = stripEvents(series, factId, sources);
  return (
    <figure className="sv-chart" id={`${factId}--chart-${chartId}`} data-preview={preview ? true : undefined}>
      {preview
        ? <figcaption className="sv-chart__caption"><h3 className="sv-graph-heading">{preview.href ? <a href={preview.href}>{series.title}</a> : series.title}</h3></figcaption>
        : <figcaption className="sv-visually-hidden">{series.title}</figcaption>}

      <SeriesHighlight>
        {(preview ? [series.readings.find(r => r.id === preview.reading) ?? series.readings[0]] : series.readings).map((reading, i) => (
          <Reading intro={i === 0 ? series.description : undefined} observations={preview ? undefined : observations[reading.id]} events={events} preview={preview} key={reading.id} series={series} reading={reading} factId={factId} sourceNumber={sourceOffset + 1 + (reading.source ? series.readings.slice(0, series.readings.indexOf(reading) + 1).filter(r => r.source).length : 0)} />
        ))}
      </SeriesHighlight>

      {!preview && <details className="sv-chart__methodology" id={`${factId}--chart-${chartId}-methodology`}>
        <summary className="sv-chart__data-summary">About this data</summary>
        <p className="sv-chart__range">
          <strong>Full published range:</strong> {series.coverage.from}
          {NBSP_DASH}
          {series.coverage.to}.{' '}
          {hasOwnSpans(series)
            ? `Each line runs the whole of its own source's range: ${lineSpans(series).join('; ')}`
            : 'Every plotted line runs the whole of it'}{' '}
          {series.coverage.note ? `${NBSP_DASH} ${series.coverage.note}` : ''}
        </p>
        {series.readings.filter(reading => reading.note).map(reading => (
          <section key={reading.id} className="sv-chart__method-note">
            <h3 className="sv-chart__reading-head">{reading.label}</h3>
            <p className="sv-chart__note">{reading.note}</p>
          </section>
        ))}
      </details>}
    </figure>
  );
}
