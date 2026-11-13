import { Fragment } from 'react';
import { formatValue } from '../format';
import { MarkerShape, shapeForSlot } from '../marker-shape';
import type { ValueFormat } from '../types';
import { MapReadout } from './map-readout';
import { aspectOf, boundsOf, centroidOf, clipToBounds, fitBounds, focusBoxOf, pathFor, type Bounds, type Projection, type ProjectionKind } from './project';
import type { AreaLook } from './shading';
import type { GeoRegion } from './types';

/** A point of interest drawn over the shading: a port, a centre, a site. */
export type MapMarker = {
  lon: number;
  lat: number;
  label: string;
  /** Sizes the symbol by area. Markers without a value share one small size. */
  value?: number;
  /** Groups markers in the key; each kind gets its own shape. */
  kind?: string;
};

/** Areas too small to read at full-map scale, redrawn enlarged beside it. */
export type MapInset = { regionIds: string[]; label?: string };

/** The drawing is sized to the geography: as wide as this, unless that would make it taller than MAP_MAX_HEIGHT. */
const MAP_MAX_WIDTH = 560;
const MAP_MAX_HEIGHT = 560;
const MAP_MIN_HEIGHT = 200;
const PADDING = 6;
const INSET_COLUMN = 132;
const INSET_BOX = { width: 116, height: 92 };
const INSET_LABEL_SPACE = 42;
const MARKER_MAX_RADIUS = 12;
const MARKER_DEFAULT_RADIUS = 4.5;
/** An area drawn as a dot: big enough to show its fill, inside an invisible hit area several times wider. The tile view is the roomier way in. */
const DOT_RADIUS = 3.5;
const DOT_HIT_RADIUS = 9;
/** Degrees kept beyond a crop on every side: the projected frame's corners reach past a curved edge of the lon/lat box. */
const CROP_MARGIN = 4;

function inBounds({ lon, lat }: MapMarker, b: Bounds) {
  return lon >= b.minLon && lon <= b.maxLon && lat >= b.minLat && lat <= b.maxLat;
}

/**
 * One SVG pattern per category slot: the slot's 30% tint as ground, with the
 * same overlay the tiles draw in CSS (maps.css) — none, dots, horizontal,
 * vertical, grid, diagonal — in the slot's series colour. The tint and the
 * colour come from the `--sv-cat-fill-N` and `--sv-series-N` tokens, so the
 * map and its legend change theme together.
 */
function CategoryPatterns({ idPrefix, slots }: { idPrefix: string; slots: number[] }) {
  return slots.map(slot => {
    const size = slot === 2 ? 6 : 5;
    return (
      <pattern
        key={slot}
        id={`${idPrefix}-${slot}`}
        className="sv-geo-map__cat-pattern"
        patternUnits="userSpaceOnUse"
        width={size}
        height={size}
        patternTransform={slot === 6 ? 'rotate(45)' : undefined}
        data-base-transform={slot === 6 ? 'rotate(45)' : ''}
        style={{ color: `var(--sv-series-${slot})`, fill: `var(--sv-cat-fill-${slot})` }}
      >
        <rect width={size} height={size} />
        {slot === 2 && <circle className="sv-geo-map__cat-dot" cx={3} cy={3} r={1} />}
        {(slot === 3 || slot === 5) && <line className="sv-geo-map__cat-line" x1={0} y1={0.5} x2={size} y2={0.5} />}
        {(slot === 4 || slot === 5 || slot === 6) && <line className="sv-geo-map__cat-line" x1={0.5} y1={0} x2={0.5} y2={size} />}
      </pattern>
    );
  });
}

type InsetLayout = 'column' | 'row';
const INSET_SLOT = INSET_BOX.height + INSET_LABEL_SPACE + 12;

/**
 * Where the insets go. Beside a tall map, in a column, each as close as
 * possible to the height of the area it enlarges so its leader line stays
 * short, and never overlapping the one above. Under a wide map, in a row:
 * a leader from there would cut across half the map, so each inset is tied
 * to its place by a ring on the map and its name instead.
 */
function placeInsets(insets: Array<MapInset & { regions: GeoRegion[] }>, projection: Projection, layout: InsetLayout, mapWidth: number, mapHeight: number) {
  const placed: Array<MapInset & { regions: GeoRegion[]; x: number; y: number; projection: Projection; anchor: [number, number]; bounds: Bounds }> = [];
  insets.forEach((inset, i) => {
    const anchor = projection.project(centroidOf(inset.regions[0]));
    let x: number;
    let y: number;
    if (layout === 'row') {
      x = PADDING + i * (INSET_BOX.width + 16);
      y = mapHeight + 8;
    } else {
      x = mapWidth + (INSET_COLUMN - INSET_BOX.width);
      const previous = placed[placed.length - 1];
      const floor = previous ? previous.y + INSET_SLOT : PADDING;
      y = Math.max(floor, Math.min(anchor[1] - INSET_BOX.height / 2, mapHeight - INSET_SLOT));
    }
    const bounds = boundsOf(inset.regions);
    placed.push({ ...inset, x, y, anchor, bounds, projection: fitBounds(bounds, { ...INSET_BOX, padding: 8, x, y }) });
  });
  return placed;
}

/** The kinds of marker on a map, in first-seen order: each gets its own shape, in the key and on the drawing. */
export function markerKinds(markers: MapMarker[]): string[] {
  return [...new Set(markers.map(marker => marker.kind ?? ''))];
}

type GeoDrawingProps = {
  regions: GeoRegion[];
  contextRegions: GeoRegion[];
  extent?: Bounds;
  projection: ProjectionKind | 'auto';
  markers: MapMarker[];
  markerValueLabel?: string;
  markerFormat?: ValueFormat;
  insets: MapInset[];
  highlight: string[];
  lookFor: (region: GeoRegion) => AreaLook;
  /** The categorical slots in use: one SVG pattern each. */
  slots: number[];
  categorical: boolean;
  /** The drawing's accessible name: the figure's title. */
  label: string;
  /** Unique per figure: the prefix of every pattern and clip id. */
  baseId: string;
  descriptionId: string;
  /**
   * A compact preview: the drawing centred in the space it is given, with no
   * readout and no focus stops; every area and marker still names itself.
   */
  preview?: boolean;
};

/**
 * The real-shape view: projected outlines, dots for areas too small to
 * outline, optional enlarged insets and point markers, each area focusable
 * with its sentence in the shared readout. Clicking an area zooms to it; see
 * MapReadout.
 */
export function GeoDrawing({ regions, contextRegions, extent, projection: projectionKind, markers, markerValueLabel, markerFormat, insets, highlight, lookFor, slots, categorical, label, baseId, descriptionId, preview = false }: GeoDrawingProps) {
  const hatchId = `${baseId}-hatch`;
  const stippleId = `${baseId}-stipple`;
  const clipId = `${baseId}-clip`;
  const fillOf = (look: AreaLook) => (look.slot ? `url(#${baseId}-cat-${look.slot})` : look.color ?? `url(#${hatchId})`);

  const resolvedInsets = insets
    .map(inset => ({ ...inset, regions: regions.filter(r => inset.regionIds.includes(r.id)) }))
    .filter(inset => inset.regions.length > 0);
  // A cropped map carries only what its crop shows, plus a margin for the
  // frame's corners; an inset still draws its area's full outline.
  const crop = extent && { minLon: extent.minLon - CROP_MARGIN, maxLon: extent.maxLon + CROP_MARGIN, minLat: extent.minLat - CROP_MARGIN, maxLat: extent.maxLat + CROP_MARGIN };
  const cropped = (list: GeoRegion[]) => (crop ? list.map(region => ({ ...region, coordinates: clipToBounds(region.coordinates, crop) })) : list);

  // Size the drawing to the geography: a tall country gets a tall map, the
  // world a wide one, rather than every map sharing one box.
  const view = extent ?? boundsOf(regions);
  const aspect = aspectOf(view, projectionKind);
  const mapHeight = Math.round(Math.max(MAP_MIN_HEIGHT, Math.min(MAP_MAX_WIDTH * aspect, MAP_MAX_HEIGHT)));
  const mapWidth = Math.round(Math.min(MAP_MAX_WIDTH, mapHeight / aspect));
  const insetLayout: InsetLayout = mapWidth > mapHeight ? 'row' : 'column';
  const width = mapWidth + (resolvedInsets.length > 0 && insetLayout === 'column' ? INSET_COLUMN : 0);

  const projection = fitBounds(view, { width: mapWidth, height: mapHeight, padding: PADDING, kind: projectionKind });

  const placedInsets = placeInsets(resolvedInsets, projection, insetLayout, mapWidth, mapHeight);
  // The drawing grows to hold the insets, wherever they were placed.
  const height = Math.max(mapHeight, ...placedInsets.map(inset => inset.y + INSET_SLOT));
  const { frame } = projection;

  const kinds = markerKinds(markers);
  const markerMax = Math.max(0, ...markers.map(marker => Math.abs(marker.value ?? 0)));
  const radiusFor = (value: number | undefined) =>
    value === undefined || markerMax === 0 ? MARKER_DEFAULT_RADIUS : Math.max(2.5, MARKER_MAX_RADIUS * Math.sqrt(Math.abs(value) / markerMax));
  const markerText = (marker: MapMarker) =>
    marker.value === undefined ? marker.label : `${marker.label}: ${formatValue(marker.value, markerFormat)}${markerValueLabel ? ` (${markerValueLabel.toLowerCase()})` : ''}`;
  // Big symbols first, so a small one is never hidden underneath.
  const orderedMarkers = markers.map((marker, index) => ({ marker, index })).sort((a, b) => radiusFor(b.marker.value) - radiusFor(a.marker.value));

  const markerGlyph = (marker: MapMarker, index: number, projectionToUse: Projection, interactive: boolean) => {
    const [cx, cy] = projectionToUse.project([marker.lon, marker.lat]);
    const text = markerText(marker);
    return (
      <g
        key={`${index}-${interactive ? 'main' : 'inset'}`}
        className="sv-geo-map__marker"
        data-region={`marker-${index}`}
        data-readout={text}
        {...(interactive ? { ...(preview ? null : { tabIndex: 0 }), role: 'img', 'aria-label': text } : { 'aria-hidden': true })}
      >
        <MarkerShape shape={shapeForSlot(kinds.indexOf(marker.kind ?? '') + 1)} cx={cx} cy={cy} r={radiusFor(marker.value)} />
      </g>
    );
  };

  /**
   * Every area's outline, then every dot over all the outlines, so a later
   * neighbour's fill never hides a dot (Washington DC under Maryland). A
   * bound's ▲ or ▼ sits at the area's centre, or above its dot: it is the
   * mark that says "at least" in greyscale. Names go over everything.
   */
  const regionPaths = (projectionToUse: Projection, list: GeoRegion[], interactive: boolean) => {
    const drawn = list.map(region => {
      const look = lookFor(region);
      const d = pathFor(region.coordinates, projectionToUse);
      const dot = region.point && projectionToUse.project(region.point);
      const areaAttributes = {
        'data-region': region.id,
        'data-row': region.id,
        'data-readout': look.readout,
        'data-missing': look.missing ? 'true' : undefined,
        'data-highlight': highlight.includes(region.id) ? 'true' : undefined,
        'data-focus': interactive && !preview ? focusBoxOf(region, projectionToUse) : undefined,
      };
      // A dot, when there is one, is what a keyboard reaches; an outline under
      // it (Washington DC's) still answers the pointer.
      const focusable = interactive ? { ...(preview ? null : { tabIndex: 0 }), role: 'img', 'aria-label': look.ariaLabel } : { 'aria-hidden': true };
      const [gx, gy] = dot ? [dot[0], dot[1] - DOT_RADIUS - 5] : projectionToUse.project(centroidOf(region));
      const outline = d && (
        <Fragment key={`outline-${region.id}`}>
          <path
            className="sv-geo-map__region"
            d={d}
            fillRule="evenodd"
            style={{ fill: fillOf(look) }}
            {...areaAttributes}
            vectorEffect="non-scaling-stroke"
            {...(dot ? { 'aria-hidden': true } : focusable)}
          />
          {/* Over the fill, never instead of it: the colour still reads the value. */}
          {look.stippled && <path className="sv-geo-map__stipple" d={d} fillRule="evenodd" style={{ fill: `url(#${stippleId})` }} aria-hidden="true" />}
        </Fragment>
      );
      const marks = (
        <Fragment key={`marks-${region.id}`}>
          {dot && (
            <g className="sv-geo-map__dot" {...areaAttributes} {...focusable}>
              <circle className="sv-geo-map__dot-hit" cx={dot[0]} cy={dot[1]} r={DOT_HIT_RADIUS} />
              <circle className="sv-geo-map__dot-mark" cx={dot[0]} cy={dot[1]} r={DOT_RADIUS} style={{ fill: fillOf(look) }} vectorEffect="non-scaling-stroke" />
              {look.stippled && <circle className="sv-geo-map__stipple" cx={dot[0]} cy={dot[1]} r={DOT_RADIUS} style={{ fill: `url(#${stippleId})` }} />}
            </g>
          )}
          {look.glyph && <text className="sv-geo-map__glyph" x={gx} y={gy} aria-hidden="true">{look.glyph}</text>}
        </Fragment>
      );
      // Every outlined area's name, at its centre: MapReadout shows it only
      // where it has room, clear of other names, at the current zoom.
      const name = interactive && !preview && d && (
        <text key={`name-${region.id}`} className="sv-geo-map__label" x={gx} y={gy} dy={look.glyph ? '1.1em' : undefined} data-label-for={region.id} aria-hidden="true">
          {region.name}
        </text>
      );
      return { outline, marks, name };
    });
    return [...drawn.map(area => area.outline), ...drawn.map(area => area.marks), ...drawn.map(area => area.name)];
  };

  const drawing = (
    <svg
      className="sv-geo-map__svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={preview ? 'xMidYMid meet' : 'xMinYMid meet'}
      role="group"
      aria-label={label}
      aria-describedby={descriptionId}
      data-insets={placedInsets.length > 0 ? 'true' : undefined}
      data-zoom-stage=""
    >
      <defs>
        {/* Rotated so the lines run top-left to bottom-right, like the CSS
            hatch on the legend swatch and on tiles. */}
        <pattern id={hatchId} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(-45)" data-base-transform="rotate(-45)">
          <rect className="sv-geo-map__hatch-ground" width="5" height="5" />
          <line className="sv-geo-map__hatch-line" x1="0" y1="0" x2="0" y2="5" />
        </pattern>
        <pattern id={stippleId} patternUnits="userSpaceOnUse" width="4" height="4" data-base-transform="">
          <circle className="sv-geo-map__stipple-dot" cx="2" cy="2" r="0.7" />
        </pattern>
        <clipPath id={clipId}>
          <rect x={frame.x - PADDING} y={frame.y - PADDING} width={frame.width + 2 * PADDING} height={frame.height + 2 * PADDING} />
        </clipPath>
        {categorical && <CategoryPatterns idPrefix={`${baseId}-cat`} slots={slots} />}
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g data-zoom-layer="">
          {contextRegions.length > 0 && (
            <g className="sv-geo-map__context" aria-hidden="true">
              {cropped(contextRegions).filter(region => region.coordinates.length > 0).map(region => (
                <path key={region.id} d={pathFor(region.coordinates, projection)} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          )}
          <g className="sv-geo-map__regions">{regionPaths(projection, cropped(regions), true)}</g>
          {orderedMarkers.length > 0 && (
            <g className="sv-geo-map__markers">
              {orderedMarkers.map(({ marker, index }) => markerGlyph(marker, index, projection, true))}
            </g>
          )}
        </g>
      </g>

      {placedInsets.map(inset => {
        const insetLabel = inset.label ?? inset.regions.map(r => r.name).join(', ');
        const valueText = inset.regions.length === 1 ? lookFor(inset.regions[0]).insetText : null;
        const [ax, ay] = inset.anchor;
        return (
          <g key={inset.regionIds.join('-')} className="sv-geo-map__inset">
            {insetLayout === 'column' ? (
              <>
                <line className="sv-geo-map__leader" x1={ax} y1={ay} x2={inset.x} y2={inset.y + INSET_BOX.height / 2} vectorEffect="non-scaling-stroke" />
                <circle className="sv-geo-map__anchor" cx={ax} cy={ay} r={2} />
              </>
            ) : (
              <circle className="sv-geo-map__anchor-ring" cx={ax} cy={ay} r={5} vectorEffect="non-scaling-stroke" />
            )}
            <rect className="sv-geo-map__inset-frame" x={inset.x} y={inset.y} width={INSET_BOX.width} height={INSET_BOX.height} vectorEffect="non-scaling-stroke" />
            {regionPaths(inset.projection, inset.regions, false)}
            {/* Markers inside the inset's area are redrawn there too, so the
                enlargement does not hide what the main map crowds together. */}
            {orderedMarkers
              .filter(({ marker }) => inBounds(marker, inset.bounds))
              .map(({ marker, index }) => markerGlyph(marker, index, inset.projection, false))}
            <text className="sv-geo-map__inset-label" x={inset.x} y={inset.y + INSET_BOX.height + 18} aria-hidden="true">{insetLabel}</text>
            {valueText && <text className="sv-geo-map__inset-value" x={inset.x} y={inset.y + INSET_BOX.height + 37} aria-hidden="true">{valueText}</text>}
          </g>
        );
      })}
    </svg>
  );
  if (preview) return drawing;
  return (
    <MapReadout key="shapes" hint={`Hover over or tab to a region to read its ${categorical ? 'category' : 'value'}; click it to zoom in.`} frame={frame}>
      {drawing}
    </MapReadout>
  );
}
