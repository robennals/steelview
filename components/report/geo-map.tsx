import { useId } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { formatValue, slugify } from './format';
import { aspectOf, boundsOf, centroidOf, fitBounds, pathFor, type Bounds, type Projection, type ProjectionKind } from './geo/project';
import type { GeoRegion } from './geo/types';
import { mapScale, mapSummary, readoutText, datumText, type MapData, type MapScale, type MapScaleKind } from './geo/choropleth';
import { MapLegend } from './geo/map-legend';
import { MapReadout } from './geo/map-readout';
import { MapTable } from './geo/map-table';
import { MarkerIcon, MarkerShape, shapeForSlot } from './marker-shape';
import type { SourceCredit, ValueFormat } from './types';

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

export type GeoMapProps = {
  /**
   * The areas the figure covers, each shaded by its value. Any outline set
   * works — `WORLD_COUNTRIES`, `EUROPE_COUNTRIES`, `UK_ITL1_REGIONS`, or your
   * own GeoJSON-shaped regions.
   */
  regions: GeoRegion[];
  /**
   * Neighbouring areas drawn for orientation only: plain, not shaded, not in
   * the table. Distinct from a covered area with no figure, which is hatched
   * as "No data" — a country outside the dataset is not a missing value.
   */
  contextRegions?: GeoRegion[];
  /** Figures keyed by region id. A region with no entry is drawn hatched as "No data". */
  data: MapData;
  /**
   * The lon/lat box to show; anything outside is cropped. Defaults to the
   * bounds of `regions`. Useful when an area has far-flung territories.
   */
  extent?: Bounds;
  /** Defaults to `auto`: a local projection for a country, Equal Earth for a continent or the world. */
  projection?: ProjectionKind | 'auto';
  /** What the figure is, e.g. "Share of residents born abroad". */
  valueLabel: string;
  format?: ValueFormat;
  scale?: MapScaleKind;
  steps?: number;
  domain?: [number, number];
  /** Explicit, possibly uneven, bin boundaries for skewed data. Overrides `steps` and `domain`. */
  breaks?: number[];
  markers?: MapMarker[];
  /** What a marker's size measures, e.g. "People detained". */
  markerValueLabel?: string;
  markerFormat?: ValueFormat;
  /**
   * Areas too small to read at full-map scale, redrawn enlarged beside it —
   * a capital city region, a small island state. None by default.
   */
  insets?: MapInset[];
  /** Column heading for the areas in the table. Defaults to "Region". */
  areaLabel?: string;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  headingLevel?: 2 | 3;
};

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

function fillFor(region: GeoRegion, data: MapData, scale: MapScale, hatchId: string) {
  const datum = data[region.id];
  return datum ? scale.color(datum.value) : `url(#${hatchId})`;
}

function inBounds({ lon, lat }: MapMarker, b: Bounds) {
  return lon >= b.minLon && lon <= b.maxLon && lat >= b.minLat && lat <= b.maxLat;
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

/**
 * A choropleth over real outlines: each region shaded by its figure on a
 * stepped scale, with a key, optional enlarged insets for areas too small to
 * see, and an optional layer of point markers.
 *
 * Use it when where something is matters to the argument. When the question
 * is only "which areas are higher", prefer TileMap: on a true-shape map, a
 * large empty region outweighs a small crowded one.
 */
export function GeoMap({
  regions,
  contextRegions = [],
  data,
  extent,
  projection: projectionKind = 'auto',
  valueLabel,
  format,
  scale: kind = 'sequential',
  steps,
  domain,
  breaks,
  markers = [],
  markerValueLabel,
  markerFormat,
  insets,
  areaLabel = 'Region',
  id,
  title,
  description,
  sources,
  note,
  headingLevel,
}: GeoMapProps) {
  const reactId = useId();
  const baseId = `sv-geo-map-${id ?? slugify(title ?? valueLabel)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const hatchId = `${baseId}-hatch`;
  const descriptionId = `${baseId}-desc`;

  const scale = mapScale(data, { kind, steps, domain, breaks });
  const resolvedInsets = (insets ?? [])
    .map(inset => ({ ...inset, regions: regions.filter(r => inset.regionIds.includes(r.id)) }))
    .filter(inset => inset.regions.length > 0);

  // Size the drawing to the geography: a tall country gets a tall map, the
  // world a wide one, rather than every map sharing one box.
  const view = extent ?? boundsOf(regions);
  const aspect = aspectOf(view, projectionKind);
  const mapHeight = Math.round(Math.max(MAP_MIN_HEIGHT, Math.min(MAP_MAX_WIDTH * aspect, MAP_MAX_HEIGHT)));
  const mapWidth = Math.round(Math.min(MAP_MAX_WIDTH, mapHeight / aspect));
  const insetLayout: InsetLayout = mapWidth > mapHeight ? 'row' : 'column';
  const width = mapWidth + (resolvedInsets.length > 0 && insetLayout === 'column' ? INSET_COLUMN : 0);
  const clipId = `${baseId}-clip`;

  const projection = fitBounds(view, { width: mapWidth, height: mapHeight, padding: PADDING, kind: projectionKind });
  const missing = regions.filter(region => !data[region.id]);

  const placedInsets = placeInsets(resolvedInsets, projection, insetLayout, mapWidth, mapHeight);
  // The drawing grows to hold the insets, wherever they were placed.
  const height = Math.max(mapHeight, ...placedInsets.map(inset => inset.y + INSET_SLOT));
  const { frame } = projection;

  const kinds = [...new Set(markers.map(marker => marker.kind ?? ''))];
  const markerMax = Math.max(0, ...markers.map(marker => Math.abs(marker.value ?? 0)));
  const radiusFor = (value: number | undefined) =>
    value === undefined || markerMax === 0 ? MARKER_DEFAULT_RADIUS : Math.max(2.5, MARKER_MAX_RADIUS * Math.sqrt(Math.abs(value) / markerMax));
  const markerText = (marker: MapMarker) =>
    marker.value === undefined ? marker.label : `${marker.label}: ${formatValue(marker.value, markerFormat)}${markerValueLabel ? ` (${markerValueLabel.toLowerCase()})` : ''}`;
  // Big symbols first, so a small one is never hidden underneath.
  const orderedMarkers = markers.map((marker, index) => ({ marker, index })).sort((a, b) => radiusFor(b.marker.value) - radiusFor(a.marker.value));

  const summary = mapSummary(
    `Map of ${regions.length} areas shaded by ${valueLabel.toLowerCase()}.`,
    regions,
    data,
    format,
    markers.length > 0 ? `${markers.length} marked locations.` : undefined,
  );

  const markerGlyph = (marker: MapMarker, index: number, projectionToUse: Projection, interactive: boolean) => {
    const [cx, cy] = projectionToUse.project([marker.lon, marker.lat]);
    const text = markerText(marker);
    return (
      <g
        key={`${index}-${interactive ? 'main' : 'inset'}`}
        className="sv-geo-map__marker"
        data-region={`marker-${index}`}
        data-readout={text}
        {...(interactive ? { tabIndex: 0, role: 'img', 'aria-label': text } : { 'aria-hidden': true })}
      >
        <MarkerShape shape={shapeForSlot(kinds.indexOf(marker.kind ?? '') + 1)} cx={cx} cy={cy} r={radiusFor(marker.value)} />
      </g>
    );
  };

  const regionPaths = (projectionToUse: Projection, list: GeoRegion[], interactive: boolean) =>
    list.map(region => {
      const text = readoutText(region.name, data[region.id], format);
      return (
        <path
          key={region.id}
          className="sv-geo-map__region"
          d={pathFor(region.coordinates, projectionToUse)}
          fillRule="evenodd"
          style={{ fill: fillFor(region, data, scale, hatchId) }}
          data-region={region.id}
          data-readout={text}
          data-missing={data[region.id] ? undefined : 'true'}
          vectorEffect="non-scaling-stroke"
          {...(interactive ? { tabIndex: 0, role: 'img', 'aria-label': text } : { 'aria-hidden': true })}
        />
      );
    });

  const graph = (
    <>
      <MapLegend scale={scale} format={format} valueLabel={valueLabel} showNoData={missing.length > 0} />
      {kinds.length > 0 && (
        <ul className="sv-geo-map__marker-key">
          {kinds.map((name, i) => (
            <li key={name || 'marker'}>
              <MarkerIcon shape={shapeForSlot(i + 1)} className="sv-geo-map__marker-icon" />
              {name || 'Marked location'}
            </li>
          ))}
          {markerMax > 0 && markerValueLabel && <li className="sv-geo-map__marker-size">Symbol area shows {markerValueLabel.toLowerCase()}</li>}
        </ul>
      )}
      <p className="sv-visually-hidden" id={descriptionId}>{summary}</p>
      <MapReadout hint="Hover over or tab to a region to read its value.">
        <svg
          className="sv-geo-map__svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMinYMid meet"
          role="group"
          aria-label={title ?? valueLabel}
          aria-describedby={descriptionId}
          data-insets={placedInsets.length > 0 ? 'true' : undefined}
        >
          <defs>
            <pattern id={hatchId} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
              <rect className="sv-geo-map__hatch-ground" width="5" height="5" />
              <line className="sv-geo-map__hatch-line" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
            <clipPath id={clipId}>
              <rect x={frame.x - PADDING} y={frame.y - PADDING} width={frame.width + 2 * PADDING} height={frame.height + 2 * PADDING} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {contextRegions.length > 0 && (
              <g className="sv-geo-map__context" aria-hidden="true">
                {contextRegions.map(region => (
                  <path key={region.id} d={pathFor(region.coordinates, projection)} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            )}
            <g className="sv-geo-map__regions">{regionPaths(projection, regions, true)}</g>
          </g>

          {placedInsets.map(inset => {
            const label = inset.label ?? inset.regions.map(r => r.name).join(', ');
            const valueText = inset.regions.length === 1 ? datumText(data[inset.regions[0].id], format) : null;
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
                <text className="sv-geo-map__inset-label" x={inset.x} y={inset.y + INSET_BOX.height + 18} aria-hidden="true">{label}</text>
                {valueText && <text className="sv-geo-map__inset-value" x={inset.x} y={inset.y + INSET_BOX.height + 37} aria-hidden="true">{valueText}</text>}
              </g>
            );
          })}

          {orderedMarkers.length > 0 && (
            <g className="sv-geo-map__markers">
              {orderedMarkers.map(({ marker, index }) => markerGlyph(marker, index, projection, true))}
            </g>
          )}
        </svg>
      </MapReadout>
    </>
  );

  const table = (
    <>
      <MapTable caption={`${title ?? valueLabel}, by ${areaLabel.toLowerCase()}`} areaLabel={areaLabel} valueLabel={valueLabel} areas={regions} data={data} format={format} />
      {markers.length > 0 && (
        <div className="sv-chart__table-scroll sv-geo-map__marker-table">
          <table className="sv-chart__table">
            <caption>Marked locations</caption>
            <thead>
              <tr>
                <th scope="col">Location</th>
                {kinds.some(Boolean) && <th scope="col">Kind</th>}
                {markerMax > 0 && <th scope="col">{markerValueLabel ?? 'Value'}</th>}
              </tr>
            </thead>
            <tbody>
              {markers.map((marker, i) => (
                <tr key={i}>
                  <th scope="row">{marker.label}</th>
                  {kinds.some(Boolean) && <td>{marker.kind ?? '—'}</td>}
                  {markerMax > 0 && <td>{marker.value === undefined ? '—' : formatValue(marker.value, markerFormat)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} headingLevel={headingLevel} className="sv-geo-map">
      <ChartViewToggle label={title ?? valueLabel} graph={graph} table={table} />
    </ReportFigure>
  );
}
