import { useId } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { slugify } from './format';
import { datumText, mapScale, mapSummary, readoutText, type MapData, type MapScaleKind } from './geo/choropleth';
import { MapLegend } from './geo/map-legend';
import { MapReadout } from './geo/map-readout';
import { MapTable } from './geo/map-table';
import type { MapTile } from './geo/tiles';
import type { SourceCredit, ValueFormat } from './types';

export type TileMapProps = {
  /** Grid layout: a preset (`EUROPE_COUNTRY_TILES`, `US_STATE_TILES`, `UK_REGION_TILES`) or your own. */
  tiles: MapTile[];
  /** Figures keyed by tile id. A tile with no entry is hatched and reads "No data". */
  data: MapData;
  valueLabel: string;
  format?: ValueFormat;
  scale?: MapScaleKind;
  steps?: number;
  domain?: [number, number];
  /** Explicit, possibly uneven, bin boundaries for skewed data. Overrides `steps` and `domain`. */
  breaks?: number[];
  /** Tiles to outline, e.g. the country a report is about. Never changes the colour. */
  highlight?: string[];
  /** Column heading for the areas in the table. Defaults to "Area". */
  areaLabel?: string;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  headingLevel?: 2 | 3;
};

/**
 * A grid cartogram: every area one equal tile, shaded on the same stepped
 * scale as GeoMap and labelled with its code and value.
 *
 * Use it to compare areas of very different size on an equal footing — EU
 * countries by asylum claims per head, states or regions by a rate — where a
 * true-shape map would let the biggest landmass dominate. Every tile carries
 * its number, so the colour is a guide to the pattern rather than the only
 * way to read a value.
 */
export function TileMap({
  tiles,
  data,
  valueLabel,
  format,
  scale: kind = 'sequential',
  steps,
  domain,
  breaks,
  highlight = [],
  areaLabel = 'Area',
  id,
  title,
  description,
  sources,
  note,
  headingLevel,
}: TileMapProps) {
  const reactId = useId();
  const descriptionId = `sv-tile-map-${id ?? slugify(title ?? valueLabel)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-desc`;
  const scale = mapScale(data, { kind, steps, domain, breaks });
  const rows = Math.max(...tiles.map(tile => tile.row)) + 1;
  const cols = Math.max(...tiles.map(tile => tile.col)) + 1;
  const missing = tiles.filter(tile => !data[tile.id]);
  const summary = mapSummary(`${tiles.length} areas, each drawn as an equal tile and shaded by ${valueLabel.toLowerCase()}.`, tiles, data, format);

  const graph = (
    <>
      <MapLegend scale={scale} format={format} valueLabel={valueLabel} showNoData={missing.length > 0} />
      <p className="sv-visually-hidden" id={descriptionId}>{summary}</p>
      <MapReadout hint="Hover over or tab to a tile to read its full name and value.">
        <ul
          className="sv-tile-map__grid"
          aria-label={title ?? valueLabel}
          aria-describedby={descriptionId}
          data-cols={cols > 6 ? 'many' : undefined}
          style={{ '--sv-tile-cols': cols, '--sv-tile-rows': rows }}
        >
          {tiles.map(tile => {
            const datum = data[tile.id];
            const text = readoutText(tile.name, datum, format);
            const color = datum ? scale.color(datum.value) : undefined;
            // Only the deepest sequential steps take paper-coloured text: on
            // the light theme ink stays above 4.5:1 up to about 75% of the hue,
            // and the dark theme keeps ink throughout (see maps.css).
            const binIndex = datum ? scale.bins.findIndex(bin => bin.color === color) : -1;
            const dark = kind === 'sequential' && binIndex >= 0 && (binIndex + 0.5) / scale.bins.length >= 0.8;
            return (
              <li
                key={tile.id}
                className="sv-tile-map__tile"
                style={{ gridRow: tile.row + 1, gridColumn: tile.col + 1, background: color }}
                data-region={tile.id}
                data-readout={text}
                data-missing={datum ? undefined : 'true'}
                data-tone={dark ? 'dark' : undefined}
                data-highlight={highlight.includes(tile.id) ? 'true' : undefined}
                tabIndex={0}
                aria-label={text}
              >
                <span className="sv-tile-map__code" aria-hidden="true">{tile.code}</span>
                <span className="sv-tile-map__value" aria-hidden="true">{datum ? datumText(datum, { ...format, compact: format?.compact ?? true }) : '–'}</span>
              </li>
            );
          })}
        </ul>
      </MapReadout>
    </>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} headingLevel={headingLevel} className="sv-tile-map">
      <ChartViewToggle
        label={title ?? valueLabel}
        graph={graph}
        table={<MapTable caption={`${title ?? valueLabel}, by ${areaLabel.toLowerCase()}`} areaLabel={areaLabel} valueLabel={valueLabel} areas={tiles} data={data} format={format} />}
      />
    </ReportFigure>
  );
}
