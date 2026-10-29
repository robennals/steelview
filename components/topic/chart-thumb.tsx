import type { ReactNode } from 'react';
import type { ComponentFigure, Fact } from '@/lib/content/types';
import { previewTarget } from '@/lib/content/preview';
import { layoutReading, pathFor, seriesStrokeDash } from '@/lib/chart/series-chart';
import { layoutScatter } from '@/lib/chart/scatter';
import {
  barChartProps,
  compositionBarProps,
  estimateRangeProps,
  figureContext,
  geoMapProps,
  periodTimelineProps,
  scatterPlotProps,
  tileMapProps,
  timelineProps,
} from '@/lib/content/figure-props';
import type { BarChartProps, CompositionBarProps, EstimateRangeProps, GeoMapProps, MapEncoding, PeriodTimelineProps, ScatterPlotProps, TileMapProps, TimelineProps } from '@/components/report';
import { barScale, orderBars, qualifiedSpan } from '@/components/report/bar-layout';
import { compose, compositionColor } from '@/components/report/composition';
import { estimateScale, whiskerSpan } from '@/components/report/estimate-layout';
import { categoryOf, categorySlots, isCategorical } from '@/components/report/geo/categorical';
import { mapScale } from '@/components/report/geo/choropleth';
import { boundsOf, fitBounds, pathFor as geoPathFor } from '@/components/report/geo/project';
import { periodSpan } from '@/components/report/period-timeline';
import { seriesColor } from '@/components/report/scale';
import { extentValues, pointValue } from '@/components/report/qualified';
import { percentAlong, spanOf, toYear } from '@/components/report/time-axis';

/**
 * A chart's silhouette, for a collapsed home-page row: the shape of the data
 * with no axes or text. It is decoration beside the chart's label — the chart
 * itself, with its scales, labels and source, is one click away — so it is
 * hidden from assistive technology.
 *
 * Each silhouette is drawn from the same layout code as the chart it stands
 * for, so it cannot show a different shape from the slide: a series reading
 * from `SeriesChart`'s narrow plot, cropped to the plot area; a comparison as
 * one column per item; each figure kind from its component's own scales
 * (`figureThumb`), or plain rows where a kind has no shape of its own.
 */
export function ChartThumb({ fact, chart, reading }: { fact: Fact; chart: string; reading?: string }) {
  const target = previewTarget(fact, chart);
  switch (target?.kind) {
    case 'series': {
      const { series } = target;
      const layout = layoutReading(series, series.readings.find(r => r.id === reading) ?? series.readings[0], 'narrow');
      const g = layout.geometry;
      return (
        <Thumb viewBox={`${g.left} ${g.top} ${g.plotWidth} ${g.plotHeight}`}>
          {layout.lines.flatMap(line => line.runs.map((run, i) => (
            <path key={`${line.name}-${i}`} d={pathFor(run.points)} fill="none" stroke={`var(--sv-series-${line.slot})`} strokeWidth="2" strokeDasharray={seriesStrokeDash(line.slot)} vectorEffect="non-scaling-stroke" />
          )))}
        </Thumb>
      );
    }
    case 'comparison':
      return <ColumnsThumb items={target.comparison.items} />;
    case 'figure':
      return figureThumb(target.figure, fact);
    default:
      return null;
  }
}

/**
 * One silhouette per figure kind, from the kind's adapter (figure-props.ts)
 * and its component's layout helpers. A kind with no case — tables, quotes
 * and key figures, which are set as type — is plain rows.
 */
export function figureThumb(figure: ComponentFigure, fact: Fact): ReactNode {
  const context = figureContext(fact);
  switch (figure.kind) {
    case 'barChart':
      return <BarsThumb {...barChartProps(figure, context)} />;
    case 'compositionBar':
      return <CompositionThumb {...compositionBarProps(figure, context)} />;
    case 'estimateRange':
      return <EstimatesThumb {...estimateRangeProps(figure, context)} />;
    case 'scatterPlot':
      return <ScatterThumb {...scatterPlotProps(figure, context)} />;
    case 'tileMap':
      return <TilesThumb {...tileMapProps(figure, context)} />;
    case 'geoMap':
      return <GeoThumb {...geoMapProps(figure, context)} />;
    case 'timeline':
      return <EventsThumb {...timelineProps(figure, context)} />;
    case 'periodTimeline':
      return <PeriodsThumb {...periodTimelineProps(figure, context)} />;
    default:
      return <RowsThumb />;
  }
}

/**
 * The frame every silhouette shares: stretched to the thumbnail's box, except
 * with `keepShape` for the maps, whose areas would distort.
 */
function Thumb({ viewBox = '0 0 100 100', keepShape = false, children }: { viewBox?: string; keepShape?: boolean; children: ReactNode }) {
  return (
    <svg className="sv-thumb" viewBox={viewBox} preserveAspectRatio={keepShape ? 'xMidYMid meet' : 'none'} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** A dot that stays round in a stretched frame: a zero-length line with a round cap. */
function Dot({ x, y, size = 4, color }: { x: number; y: number; size?: number; color: string }) {
  return <line className="sv-thumb__dot" x1={x} y1={y} x2={x} y2={y} stroke={color} strokeWidth={size} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
}

/** The rows of a table or a list of quotes: the shape of a figure set as type. */
function RowsThumb() {
  return (
    <Thumb>
      {[14, 38, 62, 86].map(y => <rect key={y} className="sv-thumb__column" x="8" width="84" y={y - 6} height="12" />)}
    </Thumb>
  );
}

/** Columns standing on a zero line, every item; negative values hang below it. */
function ColumnsThumb({ items }: { items: Array<{ value: number; highlight?: boolean }> }) {
  const values = items.map(item => item.value);
  const top = Math.max(0, ...values);
  const range = top - Math.min(0, ...values) || 1;
  const width = 100 / items.length;
  return (
    <Thumb>
      {items.map((item, i) => (
        <rect key={i} className="sv-thumb__column" data-highlight={item.highlight || undefined}
          x={i * width + width * 0.08} width={width * 0.84}
          y={(top - Math.max(0, item.value)) / range * 100} height={Math.max(0.5, Math.abs(item.value) / range * 100)} />
      ))}
    </Thumb>
  );
}

/**
 * Horizontal bars in the chart's own order, on its zero-based scale. A
 * published range is a bar to its low end and a whisker on to its high end,
 * as on the chart; a bound's arrowhead is too small to draw here.
 */
function BarsThumb({ items, sort, domainMax }: BarChartProps) {
  const ordered = orderBars(items, sort);
  const scale = barScale(ordered.flatMap(item => extentValues(item.value)), domainMax);
  const row = 100 / Math.max(1, ordered.length);
  return (
    <Thumb>
      {ordered.map((item, i) => {
        const span = qualifiedSpan(item.value, scale);
        const middle = i * row + row / 2;
        return (
          <g key={i}>
            <rect className="sv-thumb__column" data-highlight={item.highlight || undefined} x={span.left} width={Math.max(0.5, span.width)} y={i * row + row * 0.15} height={row * 0.7} />
            {span.whisker && <line className="sv-thumb__whisker" x1={span.whisker.left} x2={span.whisker.left + span.whisker.width} y1={middle} y2={middle} vectorEffect="non-scaling-stroke" />}
          </g>
        );
      })}
    </Thumb>
  );
}

/** One full-width bar per row, split into its parts' shares in the chart's colours. */
function CompositionThumb({ categories, rows, otherThreshold, otherLabel }: CompositionBarProps) {
  const composed = compose(categories, rows, { otherThreshold, otherLabel });
  const row = 100 / Math.max(1, composed.rows.length);
  return (
    <Thumb>
      {composed.rows.flatMap((r, i) => {
        const starts = r.segments.map((_, j) => r.segments.slice(0, j).reduce((sum, s) => sum + s.share, 0));
        return r.segments.map((segment, j) => segment.share > 0 && (
          <rect key={`${i}-${segment.key}`} x={starts[j]} width={segment.share} y={i * row + row * 0.2} height={row * 0.6} fill={compositionColor(categories, segment.key)} />
        ));
      })}
    </Thumb>
  );
}

/** Each estimate's interval as a line and its central estimate as a dot, against the no-effect line. */
function EstimatesThumb({ estimates, nullValue = 0, domain }: EstimateRangeProps) {
  // As on the chart, layout reads the central estimate's number; its qualifier is for the text.
  const bounds = estimates.map(e => ({ low: e.low, high: e.high, estimate: e.estimate === undefined ? undefined : pointValue(e.estimate) }));
  const scale = estimateScale(bounds, nullValue, domain);
  const row = 100 / Math.max(1, bounds.length);
  return (
    <Thumb>
      {scale.zero !== undefined && <line className="sv-thumb__rule" x1={scale.zero} x2={scale.zero} y1={0} y2={100} vectorEffect="non-scaling-stroke" />}
      {bounds.map((e, i) => {
        const y = i * row + row / 2;
        const whisker = whiskerSpan(e, scale.x);
        return (
          <g key={i}>
            {whisker && <line x1={whisker.left} x2={whisker.right} y1={y} y2={y} stroke="var(--sv-series-1)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
            {e.estimate !== undefined && <Dot x={scale.x(e.estimate)} y={y} color="var(--sv-series-1)" />}
          </g>
        );
      })}
    </Thumb>
  );
}

/** Every point, placed by the scatter plot's own narrow layout and cropped to (just round) its plot area. */
function ScatterThumb({ points, x, y, groups = [], highlight = [] }: ScatterPlotProps) {
  const layout = layoutScatter(
    points.map(p => ({ id: p.id, label: p.label, x: pointValue(p.x), y: pointValue(p.y) })),
    { x: { ...x, format: String }, y: { ...y, format: String } },
    'narrow',
  );
  const g = layout.geometry;
  // Room round the plot area, so a point on an axis is not cut in half.
  const pad = g.pointRadius * 2;
  // The plot's own slots: groups in order, then one more for points in none.
  const slotOf = (group?: string) => (groups.length === 0 ? 1 : groups.findIndex(gr => gr.id === group) + 1 || groups.length + 1);
  return (
    <Thumb viewBox={`${g.left - pad} ${g.top - pad} ${g.plotWidth + 2 * pad} ${g.plotHeight + 2 * pad}`}>
      {layout.points.map((placed, i) => (
        <Dot key={placed.id} x={placed.cx} y={placed.cy} size={highlight.includes(placed.id) ? 6 : 4} color={seriesColor(slotOf(points[i].group))} />
      ))}
    </Thumb>
  );
}

/** A map's fill for each area: its shading step, its category's colour, or none for no data. */
function areaFill(encoding: MapEncoding): (id: string) => string | undefined {
  if (isCategorical(encoding)) {
    const slots = categorySlots(encoding.categories);
    return id => {
      const category = categoryOf(id, encoding);
      return category && seriesColor(slots.get(category.id) ?? 1);
    };
  }
  const scale = mapScale(encoding.data, { kind: encoding.scale, steps: encoding.steps, domain: encoding.domain, breaks: encoding.breaks });
  return id => (encoding.data[id] ? scale.color(pointValue(encoding.data[id])) : undefined);
}

/** Every tile in its grid place, shaded as on the map. */
function TilesThumb(props: TileMapProps) {
  const fill = areaFill(props);
  const rows = Math.max(...props.tiles.map(tile => tile.row)) + 1;
  const cols = Math.max(...props.tiles.map(tile => tile.col)) + 1;
  return (
    <Thumb viewBox={`0 0 ${cols} ${rows}`} keepShape>
      {props.tiles.map(tile => (
        <rect key={tile.id} className="sv-thumb__area" data-missing={fill(tile.id) ? undefined : true} x={tile.col + 0.06} y={tile.row + 0.06} width={0.88} height={0.88} fill={fill(tile.id)} />
      ))}
    </Thumb>
  );
}

/**
 * The thumbnail map's box, in the proportions of the thumbnail, and how far
 * apart (in its units, about a pixel) two outline points must be to both be drawn.
 */
const GEO_THUMB = { width: 120, height: 66, tolerance: 1 };

/** Every region's outline, projected as the map projects it and shaded as on the map. */
function GeoThumb(props: GeoMapProps) {
  const fill = areaFill(props);
  const projection = fitBounds(props.extent ?? boundsOf(props.regions), { width: GEO_THUMB.width, height: GEO_THUMB.height, kind: props.projection ?? 'auto' });
  return (
    <Thumb viewBox={`0 0 ${GEO_THUMB.width} ${GEO_THUMB.height}`} keepShape>
      {props.regions.map(region => {
        const d = geoPathFor(region.coordinates, projection, GEO_THUMB.tolerance);
        return d && <path key={region.id} className="sv-thumb__area" data-missing={fill(region.id) ? undefined : true} d={d} fillRule="evenodd" fill={fill(region.id)} />;
      })}
    </Thumb>
  );
}

/** Every event a tick on the timeline's span, in its category's colour; major events taller. */
function EventsThumb({ events, categories }: TimelineProps) {
  const span = spanOf(events.map(e => e.date));
  // The timeline's own slots: categories in order, else in order of first appearance.
  const order = categories?.map(c => c.id) ?? [...new Set(events.map(e => e.category))];
  return (
    <Thumb>
      <line className="sv-thumb__rule" x1={0} x2={100} y1={50} y2={50} vectorEffect="non-scaling-stroke" />
      {events.map((e, i) => {
        const x = percentAlong(toYear(e.date), span);
        const reach = e.significance === 'major' ? 34 : 20;
        return <line key={i} x1={x} x2={x} y1={50 - reach} y2={50 + reach} stroke={seriesColor(order.indexOf(e.category) + 1 || 1)} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />;
      })}
    </Thumb>
  );
}

/** Every row's periods as bars on the timeline's own axis, coloured by category. */
function PeriodsThumb(props: PeriodTimelineProps) {
  const span = periodSpan(props);
  const order = (props.categories ?? []).map(c => c.id);
  const row = 100 / Math.max(1, props.rows.length);
  return (
    <Thumb>
      {props.rows.flatMap((r, i) => r.periods.map((period, j) => {
        const left = percentAlong(toYear(period.from), span);
        const right = period.to ? percentAlong(toYear(period.to), span) : 100;
        return <rect key={`${i}-${j}`} x={left} width={Math.max(0.6, right - left)} y={i * row + row * 0.2} height={row * 0.6} fill={seriesColor(order.indexOf(period.category ?? '') + 1 || 1)} />;
      }))}
    </Thumb>
  );
}
