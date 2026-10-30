import type { ReactNode } from 'react';
import type { ComponentFigure, Fact } from '@/lib/content/types';
import { previewTarget } from '@/lib/content/preview';
import { datePlacement } from '@/lib/content/period';
import { layoutReading, pathFor, seriesStrokeDash } from '@/lib/chart/series-chart';
import { layoutScatter } from '@/lib/chart/scatter';
import {
  areaMapProps,
  barChartProps,
  compositionBarProps,
  estimateRangeProps,
  figureContext,
  pairedBarChartProps,
  periodTimelineProps,
  scatterPlotProps,
  sliceExplorerProps,
  smallMultiplesProps,
  timelineProps,
} from '@/lib/content/figure-props';
import type { AreaMapProps, BarChartProps, CompositionBarProps, EstimateRangeProps, MapEncoding, PairedBarChartProps, PeriodTimelineProps, ScatterPlotProps, SliceExplorerProps, SmallMultiplesProps, TimelineProps } from '@/components/report';
import { barScale, orderBars, qualifiedSpan } from '@/components/report/bar-layout';
import { compose, compositionColor } from '@/components/report/composition';
import { estimateScale, whiskerSpan } from '@/components/report/estimate-layout';
import { categoryOf, categorySlots, isCategorical } from '@/components/report/geo/categorical';
import { mapScale } from '@/components/report/geo/choropleth';
import { boundsOf, clipToBounds, fitBounds, pathFor as geoPathFor } from '@/components/report/geo/project';
import { periodSpan } from '@/components/report/period-timeline';
import { seriesColor } from '@/components/report/scale';
import { defaultChoices, sliceView } from '@/components/report/slice-view';
import { layoutPanels } from '@/components/report/small-multiples-layout';
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
      return figure.series ? <PairedBarsThumb {...pairedBarChartProps(figure, context)} /> : <BarsThumb {...barChartProps(figure, context)} />;
    case 'compositionBar':
      return <CompositionThumb {...compositionBarProps(figure, context)} />;
    case 'estimateRange':
      return <EstimatesThumb {...estimateRangeProps(figure, context)} />;
    case 'scatterPlot':
      return <ScatterThumb {...scatterPlotProps(figure, context)} />;
    case 'map':
      return <MapThumb {...areaMapProps(figure, context)} />;
    case 'timeline':
      return <EventsThumb {...timelineProps(figure, context)} />;
    case 'periodTimeline':
      return <PeriodsThumb {...periodTimelineProps(figure, context)} />;
    case 'sliceExplorer':
      return <SliceThumb {...sliceExplorerProps(figure, context)} />;
    case 'smallMultiples':
      return <PanelsThumb {...smallMultiplesProps(figure, context)} />;
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

/**
 * Each row's measures on the chart's one zero-based scale, in its series
 * colours and order: thin bars one under another, or for a dumbbell two dots
 * joined by a line. A missing measure draws nothing.
 */
function PairedBarsThumb({ series, items, style = 'paired', domainMax }: PairedBarChartProps) {
  const valuesOf = (item: PairedBarChartProps['items'][number]) => series.map(s => item.values[s.key] ?? null);
  const scale = barScale(items.flatMap(item => valuesOf(item).flatMap(value => (value === null ? [] : extentValues(value)))), domainMax);
  const row = 100 / Math.max(1, items.length);
  return (
    <Thumb>
      {items.map((item, i) => {
        const spans = valuesOf(item).map(value => (value === null ? null : qualifiedSpan(value, scale)));
        if (style === 'dumbbell') {
          const y = i * row + row / 2;
          const ends = spans.flatMap((span, slot) => (span ? [{ x: span.negative ? span.left : span.left + span.width, slot: slot + 1 }] : []));
          const xs = ends.map(end => end.x);
          return (
            <g key={i}>
              {ends.length > 1 && <line className="sv-thumb__rule" x1={Math.min(...xs)} x2={Math.max(...xs)} y1={y} y2={y} vectorEffect="non-scaling-stroke" />}
              {ends.map(end => <Dot key={end.slot} x={end.x} y={y} color={seriesColor(end.slot)} />)}
            </g>
          );
        }
        const bar = (row * 0.8) / series.length;
        return spans.map((span, slot) => span && (
          <rect key={`${i}-${slot}`} x={span.left} width={Math.max(0.5, span.width)} y={i * row + row * 0.1 + slot * bar} height={bar * 0.85} fill={seriesColor(slot + 1)} />
        ));
      })}
    </Thumb>
  );
}

/**
 * The explorer's opening cut, as its preview draws it: one bar per group,
 * split into stacked parts or thin side-by-side bars in the split's colours.
 */
function SliceThumb(props: SliceExplorerProps) {
  const { barRows, layout } = sliceView(props, defaultChoices(props));
  const row = 100 / Math.max(1, barRows.length);
  return (
    <Thumb>
      {barRows.flatMap((r, i) => r.segments.map((segment, j) => {
        const grouped = layout === 'grouped';
        const height = grouped ? (row * 0.8) / r.segments.length : row * 0.7;
        const y = i * row + (grouped ? row * 0.1 + j * height : row * 0.15);
        return segment.width > 0 && (
          <rect key={`${i}-${j}`} className={segment.color ? undefined : 'sv-thumb__column'} x={segment.left} width={segment.width} y={y} height={grouped ? height * 0.85 : height} fill={segment.color} />
        );
      }))}
    </Thumb>
  );
}

/**
 * Every panel's line in a grid, wider than tall like the thumbnail, from the
 * panels' own layout — so on their shared scale unless the figure gives each
 * its own; the highlighted panel's line in the accent.
 */
function PanelsThumb({ panels, independentScales, zeroBased }: SmallMultiplesProps) {
  const { panels: laid } = layoutPanels(panels, { independentScales, zeroBased });
  const cols = Math.min(laid.length, Math.ceil(Math.sqrt(laid.length * 2)));
  const rows = Math.ceil(laid.length / cols);
  const width = 100 / cols;
  const height = 100 / rows;
  return (
    <Thumb>
      {laid.map((panel, i) => (
        <svg key={panel.name} x={(i % cols) * width + width * 0.08} y={Math.floor(i / cols) * height + height * 0.15} width={width * 0.84} height={height * 0.7} viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">
          <path d={panel.path} fill="none" stroke={panels[i].highlight ? 'var(--accent)' : 'var(--sv-series-1)'} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
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

/** Each estimate's interval as a line (a lone bound's open tail dashed) and its central estimate as a dot, against the no-effect line. */
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
        const whisker = whiskerSpan(e, scale);
        // A lone published bound is a short dashed tail, as on the chart: never a measured line.
        const open = whisker && (whisker.start === 'open' || whisker.end === 'open');
        return (
          <g key={i}>
            {whisker && <line x1={whisker.left} x2={whisker.right} y1={y} y2={y} stroke="var(--sv-series-1)" strokeWidth={1.5} strokeDasharray={open ? '3 2' : undefined} vectorEffect="non-scaling-stroke" />}
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
      if (!category) return undefined;
      return category.quiet ? 'var(--paper-sunk)' : seriesColor(slots.get(category.id) ?? 1);
    };
  }
  const scale = mapScale(encoding.data, { kind: encoding.scale, steps: encoding.steps, domain: encoding.domain, breaks: encoding.breaks });
  return id => (encoding.data[id] ? scale.color(pointValue(encoding.data[id])) : undefined);
}

/** A map's silhouette in the view its preview opens on: its tiles, or its real shapes. */
function MapThumb(props: AreaMapProps) {
  return props.defaultView === 'tiles' ? <TilesThumb {...props} /> : <GeoThumb {...props} />;
}

/** Every tile in its grid place, spanning its cells, shaded as on the map. */
function TilesThumb(props: AreaMapProps) {
  const fill = areaFill(props);
  const rows = Math.max(...props.tiles.map(tile => tile.row + (tile.h ?? 1)));
  const cols = Math.max(...props.tiles.map(tile => tile.col + (tile.w ?? 1)));
  return (
    <Thumb viewBox={`0 0 ${cols} ${rows}`} keepShape>
      {props.tiles.map(tile => (
        <rect key={tile.id} className="sv-thumb__area" data-missing={fill(tile.id) ? undefined : true} x={tile.col + 0.06} y={tile.row + 0.06} width={(tile.w ?? 1) - 0.12} height={(tile.h ?? 1) - 0.12} fill={fill(tile.id)} />
      ))}
    </Thumb>
  );
}

/**
 * The thumbnail map's box, in the proportions of the thumbnail, and how far
 * apart (in its units, about a pixel) two outline points must be to both be drawn.
 */
const GEO_THUMB = { width: 120, height: 66, tolerance: 1 };

/**
 * Every area's outline, projected as the map projects it, cropped to its
 * extent and shaded as on the map. An area the map draws as a dot (a
 * microstate, a territory) is left out: at this size it would be a speck,
 * and the outlines alone give the map's shape. Context outlines are left out too.
 */
function GeoThumb(props: AreaMapProps) {
  const { regions, extent } = props;
  const fill = areaFill(props);
  const projection = fitBounds(extent ?? boundsOf(regions), { width: GEO_THUMB.width, height: GEO_THUMB.height, kind: 'auto' });
  return (
    <Thumb viewBox={`0 0 ${GEO_THUMB.width} ${GEO_THUMB.height}`} keepShape>
      {regions.filter(region => !region.point).map(region => {
        const d = geoPathFor(extent ? clipToBounds(region.coordinates, extent) : region.coordinates, projection, GEO_THUMB.tolerance);
        return d && <path key={region.id} className="sv-thumb__area" data-missing={fill(region.id) ? undefined : true} d={d} fillRule="evenodd" fill={fill(region.id)} />;
      })}
    </Thumb>
  );
}

/** Every event a tick on the timeline's span, in its category's colour; major events taller. */
function EventsThumb({ events, categories }: TimelineProps) {
  // An approximate date ("1850s", "c. 1888") sits where the timeline places it.
  const span = spanOf(events.map(e => datePlacement(e.date)));
  // The timeline's own slots: categories in order, else in order of first appearance.
  const order = categories?.map(c => c.id) ?? [...new Set(events.map(e => e.category))];
  return (
    <Thumb>
      <line className="sv-thumb__rule" x1={0} x2={100} y1={50} y2={50} vectorEffect="non-scaling-stroke" />
      {events.map((e, i) => {
        const x = percentAlong(toYear(datePlacement(e.date)), span);
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
