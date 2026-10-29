import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { layoutScatter, type ScatterLayout } from '@/lib/chart/scatter';
import type { ChartVariant } from '@/lib/chart/series-chart';
import { ReportFigure } from './figure';
import { countOf, formatValue, slugify } from './format';
import { MapReadout } from './geo/map-readout';
import { MarkerIcon, MarkerShape, shapeForSlot } from './marker-shape';
import type { SourceCredit, ValueFormat } from './types';

export type ScatterPoint = {
  id: string;
  /** Printed beside the point, one to four characters: "AZ". */
  label: string;
  /** Full name for the readout and the table: "Arizona". */
  name: string;
  x: number;
  y: number;
  /** A `groups` id. Groups differ by shape as well as colour. */
  group?: string;
  note?: string;
};

export type ScatterAxis = {
  label: string;
  format?: ValueFormat;
  /** Fix the axis ends exactly, e.g. to share a scale with another chart. */
  domain?: [number, number];
  /** Defaults to true. */
  includeZero?: boolean;
};

export type ScatterGroup = { id: string; label: string };

export type ScatterPlotProps = {
  points: ScatterPoint[];
  x: ScatterAxis;
  y: ScatterAxis;
  /** In legend order; each takes the next series colour and marker shape. */
  groups?: ScatterGroup[];
  /** Point ids to outline and label in bold; never recoloured. */
  highlight?: string[];
  /** Table heading for the points: "State". */
  pointLabel: string;
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** Rendered after the source line: the figure's Observations. */
  footer?: ReactNode;
  headingLevel?: 2 | 3;
};

/** Points whose group is missing or unknown, when the plot has groups. */
const OTHER_GROUP: ScatterGroup = { id: '', label: 'Other' };

function range(values: number[], format?: ValueFormat): string {
  return `${formatValue(Math.min(...values), format)} to ${formatValue(Math.max(...values), format)}`;
}

function Plot({
  layout,
  variant,
  points,
  slotOf,
  highlight,
  readouts,
  label,
  descriptionId,
}: {
  layout: ScatterLayout;
  variant: ChartVariant;
  points: ScatterPoint[];
  slotOf: (point: ScatterPoint) => number;
  highlight: Set<string>;
  readouts: Map<string, string>;
  label: string;
  descriptionId: string;
}) {
  const g = layout.geometry;
  const right = g.left + g.plotWidth;
  const bottom = g.top + g.plotHeight;
  const byId = new Map(points.map(point => [point.id, point]));
  return (
    <svg
      className="sv-chart__svg sv-scatter__svg"
      data-variant={variant}
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="group"
      aria-label={label}
      aria-describedby={descriptionId}
      preserveAspectRatio="xMidYMid meet"
    >
      {layout.yTicks.map(tick => (
        <line key={`gy-${tick.value}`} className="sv-chart__grid" x1={g.left} x2={right} y1={tick.y} y2={tick.y} vectorEffect="non-scaling-stroke" />
      ))}
      {layout.xTicks.map(tick => (
        <line key={`gx-${tick.value}`} className="sv-chart__grid" x1={tick.x} x2={tick.x} y1={g.top} y2={bottom} vectorEffect="non-scaling-stroke" />
      ))}
      {layout.yZero !== null && <line className="sv-chart__zero" x1={g.left} x2={right} y1={layout.yZero} y2={layout.yZero} vectorEffect="non-scaling-stroke" />}
      {layout.xZero !== null && <line className="sv-chart__zero" x1={layout.xZero} x2={layout.xZero} y1={g.top} y2={bottom} vectorEffect="non-scaling-stroke" />}
      <line className="sv-chart__axis" x1={g.left} x2={right} y1={bottom} y2={bottom} vectorEffect="non-scaling-stroke" />
      <line className="sv-chart__axis" x1={g.left} x2={g.left} y1={g.top} y2={bottom} vectorEffect="non-scaling-stroke" />

      {layout.yTicks.map(tick =>
        tick.label === null ? null : (
          <text key={`ly-${tick.value}`} className="sv-chart__tick" x={g.left - 8} y={tick.y} fontSize={g.fontSize} textAnchor="end" dominantBaseline="middle">
            {tick.label}
          </text>
        ),
      )}
      {layout.xTicks.map(tick =>
        tick.label === null ? null : (
          <text key={`lx-${tick.value}`} className="sv-chart__tick" x={tick.x} y={bottom + g.fontSize + 8} fontSize={g.fontSize} textAnchor="middle">
            {tick.label}
          </text>
        ),
      )}

      <g className="sv-scatter__points">
        {layout.points.map(placed => {
          const point = byId.get(placed.id);
          if (!point) return null;
          const slot = slotOf(point);
          const text = readouts.get(point.id);
          return (
            <g
              key={point.id}
              className="sv-scatter__point"
              style={{ color: `var(--sv-series-${slot})` }}
              data-region={point.id}
              data-readout={text}
              data-highlight={highlight.has(point.id) ? 'true' : undefined}
              tabIndex={0}
              role="img"
              aria-label={text}
            >
              {highlight.has(point.id) && <circle className="sv-scatter__ring" cx={placed.cx} cy={placed.cy} r={g.pointRadius + 3} />}
              <MarkerShape className="sv-scatter__mark" shape={shapeForSlot(slot)} cx={placed.cx} cy={placed.cy} r={g.pointRadius} />
            </g>
          );
        })}
      </g>

      {/* Labels after every point, so no point is drawn over a label. Named by
          the point's aria-label, so hidden from assistive technology here. */}
      <g className="sv-scatter__labels" aria-hidden="true">
        {layout.points.map(placed => (
          <text
            key={placed.id}
            className="sv-scatter__label"
            data-region={placed.id}
            data-highlight={highlight.has(placed.id) ? 'true' : undefined}
            data-crowded={placed.label.crowded ? 'true' : undefined}
            x={placed.label.x}
            y={placed.label.y}
            fontSize={g.labelSize}
            textAnchor={placed.label.anchor}
            dominantBaseline="central"
          >
            {byId.get(placed.id)?.label}
          </text>
        ))}
      </g>
    </svg>
  );
}

/**
 * Two measures per area plotted against each other, every point labelled, so
 * the reader sees a relationship — or its absence — instead of hunting for it
 * in a table. Groups differ by marker shape as well as colour; highlighted
 * points get an ink ring and a bold label, never a different colour.
 *
 * There is deliberately no trend line or correlation figure: a fitted line
 * invites a causal reading the chart cannot support. A sourced correlation
 * belongs in the figure's Observations.
 */
export function ScatterPlot({
  points,
  x,
  y,
  groups,
  highlight = [],
  pointLabel,
  id,
  title,
  description,
  sources,
  note,
  footer,
  headingLevel,
}: ScatterPlotProps) {
  const reactId = useId();
  const label = title ?? `${y.label} against ${x.label}`;
  const descriptionId = `sv-scatter-${id ?? slugify(label)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-desc`;
  const highlighted = new Set(highlight);

  // Group slots follow the `groups` order; points outside every group share
  // one more slot, listed last as "Other".
  const groupList = groups ?? [];
  const groupIndex = new Map(groupList.map((group, i) => [group.id, i + 1]));
  const groupOf = (point: ScatterPoint) => (point.group === undefined ? undefined : groupList.find(group => group.id === point.group));
  const hasOther = groupList.length > 0 && points.some(point => !groupOf(point));
  const slotOf = (point: ScatterPoint) => (groupList.length === 0 ? 1 : groupIndex.get(point.group ?? '') ?? groupList.length + 1);
  const legendGroups = hasOther ? [...groupList, OTHER_GROUP] : groupList;

  const fx = (value: number) => formatValue(value, x.format);
  const fy = (value: number) => formatValue(value, y.format);
  const readouts = new Map(
    points.map(point => {
      const group = groupList.length > 0 ? ` (${(groupOf(point) ?? OTHER_GROUP).label})` : '';
      // "Arizona (Mostly mail). Days before …: 14. Hours to count …: 147. {note}"
      const noteText = point.note ? ` ${point.note}` : '';
      return [point.id, `${point.name}${group}. ${x.label}: ${fx(point.x)}. ${y.label}: ${fy(point.y)}.${noteText}`];
    }),
  );

  const axes = { x: { ...x, format: fx }, y: { ...y, format: fy } };
  const input = points.map(point => ({ id: point.id, label: point.label, x: point.x, y: point.y, highlight: highlighted.has(point.id) }));
  const layouts = { narrow: layoutScatter(input, axes, 'narrow'), wide: layoutScatter(input, axes, 'wide') };

  const summary = [
    points.length > 0
      ? `${countOf(points.length, pointLabel)}. ${x.label} from ${range(points.map(point => point.x), x.format)}; ${y.label} from ${range(points.map(point => point.y), y.format)}.`
      : null,
    legendGroups.length > 0 ? `Grouped as ${legendGroups.map(group => group.label).join(', ')}, told apart by marker shape.` : null,
    typeof description === 'string' ? description : null,
    'Use the Table switch to see every value.',
  ].filter(Boolean).join(' ');

  const rows = [...points].sort((a, b) => a.name.localeCompare(b.name));
  const hasNotes = points.some(point => point.note);

  const graph = (
    <>
      {legendGroups.length > 0 && (
        <ul className="sv-scatter__key">
          {legendGroups.map((group, i) => (
            <li key={group.id || 'other'} style={{ color: `var(--sv-series-${i + 1})` }}>
              <MarkerIcon shape={shapeForSlot(i + 1)} className="sv-scatter__key-icon" />
              <span className="sv-scatter__key-name">{group.label}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="sv-chart__axis-label">{y.label}</p>
      <p className="sv-visually-hidden" id={descriptionId}>{summary}</p>
      <MapReadout hint="Hover over or tab to a point to read its values.">
        <div className="sv-chart__plot">
          {(['narrow', 'wide'] as const).map(variant => (
            <Plot
              key={variant}
              layout={layouts[variant]}
              variant={variant}
              points={points}
              slotOf={slotOf}
              highlight={highlighted}
              readouts={readouts}
              label={label}
              descriptionId={descriptionId}
            />
          ))}
        </div>
        <p className="sv-chart__axis-label sv-scatter__x-label">{x.label}</p>
      </MapReadout>
    </>
  );

  const table = (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col" className="sv-data__th-text">{pointLabel}</th>
            <th scope="col">{x.label}</th>
            <th scope="col">{y.label}</th>
            {groupList.length > 0 && <th scope="col" className="sv-data__th-text">Group</th>}
            {hasNotes && <th scope="col" className="sv-data__th-text">Note</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(point => (
            <tr key={point.id} data-highlight={highlighted.has(point.id) || undefined}>
              <th scope="row">{point.name}</th>
              <td>{fx(point.x)}</td>
              <td>{fy(point.y)}</td>
              {groupList.length > 0 && <td className="sv-data__td-text">{(groupOf(point) ?? OTHER_GROUP).label}</td>}
              {hasNotes && <td className="sv-data__td-text sv-scatter__note">{point.note ?? ''}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} headingLevel={headingLevel} className="sv-scatter">
      {points.length === 0 ? <p className="sv-report__empty">No values to show.</p> : <ChartViewToggle label={label} graph={graph} table={table} />}
    </ReportFigure>
  );
}
