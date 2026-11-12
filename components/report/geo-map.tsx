import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { formatValue, slugify } from './format';
import type { MapEncoding } from './geo/categorical';
import { GeoDrawing, markerKinds, type MapInset, type MapMarker } from './geo/geo-drawing';
import type { Bounds, ProjectionKind } from './geo/project';
import { mapShading } from './geo/shading';
import type { GeoRegion } from './geo/types';
import { MarkerIcon, shapeForSlot } from './marker-shape';
import type { SourceCredit, ValueFormat } from './types';

export type { MapInset, MapMarker } from './geo/geo-drawing';

type GeoMapCommon = {
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
  /**
   * The lon/lat box to show; anything outside is cropped. Defaults to the
   * bounds of `regions`. Useful when an area has far-flung territories.
   */
  extent?: Bounds;
  /** Defaults to `auto`: a local projection for a country, Equal Earth for a continent, Mercator for the world. */
  projection?: ProjectionKind | 'auto';
  markers?: MapMarker[];
  /** What a marker's size measures, e.g. "People detained". */
  markerValueLabel?: string;
  markerFormat?: ValueFormat;
  /**
   * Areas too small to read at full-map scale, redrawn enlarged beside it —
   * a capital city region, a small island state. None by default.
   */
  insets?: MapInset[];
  /** Regions to outline in ink, e.g. the country a report is about. Never changes the fill. */
  highlight?: string[];
  /** Column heading for the areas in the table. Defaults to "Region". */
  areaLabel?: string;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  /** Rendered after the source line: the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  headingLevel?: 2 | 3;
};

/**
 * Shaded either by a number (`data`, `valueLabel`, `format`, `scale`, …) or
 * by a category (`categoryLabel`, `categories`, `categoryData`) — never both.
 * Regions with no entry are hatched as "No data" either way.
 */
export type GeoMapProps = GeoMapCommon & MapEncoding;

/**
 * A choropleth over real outlines: each region shaded by its figure on a
 * stepped scale, with a key, optional enlarged insets for areas too small to
 * see, and an optional layer of point markers.
 *
 * Use it when where something is matters to the argument. When the question
 * is only "which areas are higher", prefer TileMap: on a true-shape map, a
 * large empty region outweighs a small crowded one.
 */
export function GeoMap(props: GeoMapProps) {
  const {
    regions,
    contextRegions = [],
    extent,
    projection = 'auto',
    markers = [],
    markerValueLabel,
    markerFormat,
    insets = [],
    highlight = [],
    areaLabel = 'Region',
    id,
    title,
    description,
    sources,
    note,
    footer,
    panel,
    headingLevel,
  } = props;
  const what = props.categories ? props.categoryLabel : props.valueLabel;
  const reactId = useId();
  const baseId = `sv-geo-map-${id ?? slugify(title ?? what)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const descriptionId = `${baseId}-desc`;
  const shading = mapShading(props, regions, { caption: `${title ?? what}, by ${areaLabel.toLowerCase()}`, areaLabel });
  const kinds = markerKinds(markers);
  const markerMax = Math.max(0, ...markers.map(marker => Math.abs(marker.value ?? 0)));
  const markerSentence = markers.length > 0 ? `${markers.length} marked locations.` : undefined;

  const graph = (
    <>
      {shading.legend}
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
      <p className="sv-visually-hidden" id={descriptionId}>{shading.summary(mapSentence(regions, shading.categorical), markerSentence)}</p>
      <GeoDrawing
        regions={regions}
        contextRegions={contextRegions}
        extent={extent}
        projection={projection}
        markers={markers}
        markerValueLabel={markerValueLabel}
        markerFormat={markerFormat}
        insets={insets}
        highlight={highlight}
        lookFor={shading.lookFor}
        slots={shading.slots}
        categorical={shading.categorical}
        label={title ?? what}
        baseId={baseId}
        descriptionId={descriptionId}
      />
    </>
  );

  const table = (
    <>
      {shading.table}
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
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-geo-map">
      <ChartViewToggle label={title ?? what} graph={graph} table={table} />
    </ReportFigure>
  );
}

/** What the real-shape view's screen-reader description says about the drawing itself. */
export function mapSentence(regions: GeoRegion[], categorical: boolean): string | undefined {
  return categorical ? undefined : `Map of ${regions.length} areas.`;
}
