import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { slugify } from './format';
import { categoryAriaText, categoryCounts, categoryOf, categoryReadoutText, categorySlots, categorySummary, isCategorical, type MapEncoding } from './geo/categorical';
import { CategoryLegend } from './geo/category-legend';
import { CategoryTable } from './geo/category-table';
import { datumText, mapScale, mapSummary, readoutText } from './geo/choropleth';
import { MapLegend } from './geo/map-legend';
import { MapReadout } from './geo/map-readout';
import { MapTable } from './geo/map-table';
import type { MapTile } from './geo/tiles';
import type { SourceCredit } from './types';

type TileMapCommon = {
  /** Grid layout: a preset (`EUROPE_COUNTRY_TILES`, `US_STATE_TILES`, `UK_REGION_TILES`) or your own. */
  tiles: MapTile[];
  /** Tiles to outline, e.g. the country a report is about. Never changes the colour. */
  highlight?: string[];
  /** Column heading for the areas in the table. Defaults to "Area". */
  areaLabel?: string;
  id?: string;
  title?: string;
  description?: string;
  sources?: SourceCredit[];
  note?: string;
  /** Rendered after the source line: the figure's Observations. */
  footer?: ReactNode;
  headingLevel?: 2 | 3;
};

/**
 * Shaded either by a number (`data`, `valueLabel`, `format`, `scale`, …) or
 * by a category (`categoryLabel`, `categories`, `categoryData`) — never both.
 */
export type TileMapProps = TileMapCommon & MapEncoding;

/** What one tile shows, whichever way the map is shaded. */
type TileCell = {
  readout: string;
  ariaLabel: string;
  /** The second line: the value, or the category's mark. */
  text: string;
  background?: string;
  slot?: number;
  missing: boolean;
  dark: boolean;
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
 *
 * Given `categories` instead of `data`, it shows a rule or category per area:
 * each category gets a tint, a pattern and a short mark printed on its tiles,
 * so no category rests on colour alone and none implies an order.
 */
export function TileMap(props: TileMapProps) {
  const { tiles, highlight = [], areaLabel = 'Area', id, title, description, sources, note, footer, headingLevel } = props;
  const categorical = isCategorical(props);
  const what = categorical ? props.categoryLabel : props.valueLabel;
  const reactId = useId();
  const descriptionId = `sv-tile-map-${id ?? slugify(title ?? what)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-desc`;
  const rows = Math.max(...tiles.map(tile => tile.row)) + 1;
  const cols = Math.max(...tiles.map(tile => tile.col)) + 1;
  const caption = `${title ?? what}, by ${areaLabel.toLowerCase()}`;

  let cellFor: (tile: MapTile) => TileCell;
  let legend: ReactNode;
  let summary: string;
  let table: ReactNode;

  if (isCategorical(props)) {
    const slots = categorySlots(props.categories);
    const counts = categoryCounts(props.categoryData, tiles.map(tile => tile.id), props.categories);
    cellFor = tile => {
      const category = categoryOf(tile.id, props);
      return {
        readout: categoryReadoutText(tile.name, category, props.categoryData[tile.id]?.note),
        ariaLabel: categoryAriaText(tile.name, category),
        text: category?.mark ?? '–',
        slot: category && slots.get(category.id),
        missing: !category,
        dark: false,
      };
    };
    legend = <CategoryLegend categoryLabel={props.categoryLabel} categories={props.categories} slots={slots} counts={counts} />;
    summary = `${categorySummary(tiles, props)} Each area is an equal tile marked with its category's code. Use the Table switch to see every area.`;
    table = <CategoryTable caption={caption} areaLabel={areaLabel} areas={tiles} encoding={props} />;
  } else {
    const { data, valueLabel, format, scale: kind = 'sequential', steps, domain, breaks } = props;
    const scale = mapScale(data, { kind, steps, domain, breaks });
    cellFor = tile => {
      const datum = data[tile.id];
      const text = readoutText(tile.name, datum, format);
      const color = datum ? scale.color(datum.value) : undefined;
      // Only the deepest sequential steps take paper-coloured text: on
      // the light theme ink stays above 4.5:1 up to about 75% of the hue,
      // and the dark theme keeps ink throughout (see maps.css).
      const binIndex = datum ? scale.bins.findIndex(bin => bin.color === color) : -1;
      return {
        readout: text,
        ariaLabel: text,
        text: datum ? datumText(datum, { ...format, compact: format?.compact ?? true }) : '–',
        background: color,
        missing: !datum,
        dark: kind === 'sequential' && binIndex >= 0 && (binIndex + 0.5) / scale.bins.length >= 0.8,
      };
    };
    legend = <MapLegend scale={scale} format={format} valueLabel={valueLabel} showNoData={tiles.some(tile => !data[tile.id])} />;
    summary = mapSummary(`${tiles.length} areas, each drawn as an equal tile and shaded by ${valueLabel.toLowerCase()}.`, tiles, data, format);
    table = <MapTable caption={caption} areaLabel={areaLabel} valueLabel={valueLabel} areas={tiles} data={data} format={format} />;
  }

  const graph = (
    <>
      {legend}
      <p className="sv-visually-hidden" id={descriptionId}>{summary}</p>
      <MapReadout hint={`Hover over or tab to a tile to read its full name and ${categorical ? 'category' : 'value'}.`}>
        <ul
          className="sv-tile-map__grid"
          aria-label={title ?? what}
          aria-describedby={descriptionId}
          data-cols={cols > 6 ? 'many' : undefined}
          style={{ '--sv-tile-cols': cols, '--sv-tile-rows': rows }}
        >
          {tiles.map(tile => {
            const cell = cellFor(tile);
            return (
              <li
                key={tile.id}
                className={cell.slot ? 'sv-tile-map__tile sv-cat-fill' : 'sv-tile-map__tile'}
                style={{ gridRow: tile.row + 1, gridColumn: tile.col + 1, background: cell.background }}
                data-region={tile.id}
                data-readout={cell.readout}
                data-slot={cell.slot}
                data-missing={cell.missing ? 'true' : undefined}
                data-tone={cell.dark ? 'dark' : undefined}
                data-highlight={highlight.includes(tile.id) ? 'true' : undefined}
                tabIndex={0}
                aria-label={cell.ariaLabel}
              >
                <span className="sv-tile-map__code" aria-hidden="true">{tile.code}</span>
                <span className="sv-tile-map__value" aria-hidden="true">{cell.text}</span>
              </li>
            );
          })}
        </ul>
      </MapReadout>
    </>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} headingLevel={headingLevel} className="sv-tile-map">
      <ChartViewToggle label={title ?? what} graph={graph} table={table} />
    </ReportFigure>
  );
}
