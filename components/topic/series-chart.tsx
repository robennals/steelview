import type { ReactNode } from 'react';
import { ChartViewToggle } from './chart-view-toggle';
import { SeriesHighlight } from './series-highlight';
import type { Series, SeriesReading } from '@/lib/content/types';
import {
  CHART_GEOMETRY,
  formatValue,
  layoutReading,
  pathFor,
  seriesSlots,
  seriesStrokeDash,
  type ChartVariant,
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
}: {
  series: Series;
  reading: SeriesReading;
  variant: ChartVariant;
  descriptionId: string;
}) {
  const layout = layoutReading(series, reading, variant);
  const g = CHART_GEOMETRY[variant];
  const right = g.left + g.plotWidth;
  const bottom = g.top + g.plotHeight;
  return (
    <svg
      className="sv-chart__svg"
      data-variant={variant}
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

      {layout.lines.map((line) => (
        <g key={line.name} data-series={line.name} style={{ color: `var(--sv-series-${line.slot})` }}>
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
          {line.runs.map((run, i) => (
            <g key={`run-${i}`}>
              <path
                className="sv-chart__line"
                d={pathFor(run)}
                strokeDasharray={seriesStrokeDash(line.slot) ?? undefined}
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="sv-chart__line-hit"
                d={pathFor(run)}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
          <circle
            className="sv-chart__end"
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

function ReadingTable({ series, reading }: { series: Series; reading: SeriesReading }) {
  const periods = reading.lines[0].points.map(point => point.period);
  const values = reading.lines.map(line => new Map(line.points.map(point => [point.period, point.value])));
  return (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{series.title} {NBSP_DASH} {reading.label}</caption>
        <thead>
          <tr>
            <th scope="col">{series.periodLabel}</th>
            {reading.lines.map(line => <th key={line.name} scope="col">{line.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.map(period => (
            <tr key={period}>
              <th scope="row">{period}</th>
              {values.map((line, index) => {
                const value = line.get(period);
                return <td key={reading.lines[index].name}>{value === undefined ? '—' : formatValue(value, reading.unit)}</td>;
              })}
            </tr>
          ))}
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
}: {
  series: Series;
  reading: SeriesReading;
  factId: string;
  sourceNumber: number;
  observations?: ReactNode;
  intro?: string;
}) {
  const slots = seriesSlots(series);
  const descriptionId = `sv-chart-${factId}-${reading.id}-desc`;
  const description = [
    series.description,
    `Read as ${reading.label.toLowerCase()}: ${reading.valueLabel}.`,
    series.breaks.length > 0
      ? `Dashed segments cross ${series.breaks.length} definitional break${series.breaks.length === 1 ? '' : 's'} in the source, explained in Method Changes below this graph.`
      : null,
    'Use the Table switch to see every value.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="sv-chart__reading" id={`${factId}--chart-${reading.id}`}>
      <h2 className="sv-graph-heading">{reading.label}</h2>
      {intro && <p className="sv-chart__desc">{intro}</p>}
      <p className="sv-chart__axis-label">
        {reading.valueLabel}, by {series.periodLabel.toLowerCase()}
      </p>

      <p className="sv-visually-hidden" id={descriptionId}>
        {description}
      </p>

      <ChartViewToggle
        label={reading.label}
        graph={<>
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
                <span className="sv-chart__key-name">{line.name}</span>
              </li>
            ))}
          </ul>
          <div className="sv-chart__plot">
            <Plot series={series} reading={reading} variant="narrow" descriptionId={descriptionId} />
            <Plot series={series} reading={reading} variant="wide" descriptionId={descriptionId} />
          </div>
        </>}
        table={<ReadingTable series={series} reading={reading} />}
      />

      {series.breaks.length > 0 && <p className="sv-chart__annotation-key">Vertical dashed lines mark measurement changes. <a data-evidence-link="true" href={`#${factId}--${reading.id}-method-${series.breaks[0].period}`}>See method changes</a>.</p>}
      <p className="sv-chart__credit">Source: <a href={`#source-${factId}-${sourceNumber}`}>{(reading.source ?? series.source).publisher} [{sourceNumber}]</a></p>

      {observations}
    </section>
  );
}

export function SeriesChart({ factId, chartId = 'series', series, sourceOffset = 0, observations = {} }: { factId: string; chartId?: string; series: Series; sourceOffset?: number; observations?: Record<string, ReactNode> }) {
  return (
    <figure className="sv-chart" id={`${factId}--chart-${chartId}`}>
      <figcaption className="sv-visually-hidden">{series.title}</figcaption>

      <SeriesHighlight>
        {series.readings.map((reading, i) => (
          <Reading intro={i === 0 ? series.description : undefined} observations={observations[reading.id]} key={reading.id} series={series} reading={reading} factId={factId} sourceNumber={sourceOffset + 1 + (reading.source ? series.readings.slice(0, i + 1).filter(r => r.source).length : 0)} />
        ))}
      </SeriesHighlight>

      <details className="sv-chart__methodology" id={`${factId}--chart-${chartId}-methodology`}>
        <summary className="sv-chart__data-summary">About this data</summary>
        <p className="sv-chart__range">
          <strong>Full published range:</strong> {series.coverage.from}
          {NBSP_DASH}
          {series.coverage.to}. Every plotted line runs the whole of it{' '}
          {series.coverage.note ? `${NBSP_DASH} ${series.coverage.note}` : ''}
        </p>
        {series.readings.filter(reading => reading.note).map(reading => (
          <section key={reading.id} className="sv-chart__method-note">
            <h3 className="sv-chart__reading-head">{reading.label}</h3>
            <p className="sv-chart__note">{reading.note}</p>
          </section>
        ))}
      </details>
    </figure>
  );
}
