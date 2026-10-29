import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { slugify } from './format';
import { categoryAriaText, categoryCounts, categoryOf, categoryReadoutText, categorySlots, categorySummary, isCategorical, type MapEncoding } from './geo/categorical';
import { CategoryLegend } from './geo/category-legend';
import { CategoryTable } from './geo/category-table';
import { PREVIEW_CLOSING, isStippled, mapScale, mapSummary, readoutText, tileText } from './geo/choropleth';
import { MapLegend } from './geo/map-legend';
import { MapReadout } from './geo/map-readout';
import { MapTable } from './geo/map-table';
import type { MapTile } from './geo/tiles';
import { boundGlyph, isRange, pointValue, qualificationsIn } from './qualified';
import type { FigurePreview, SourceCredit } from './types';

/**
 * Past this many columns (the world grid has 28) a tile is too small to
 * print a number: it shows its code and, on a numeric map, only a bound's
 * ▲ or ▼, and the grid keeps a minimum tile size, scrolling sideways on a
 * phone rather than shrinking every tile below a fingertip.
 */
const DENSE_COLUMNS = 16;

type TileMapCommon = {
  /** Grid layout: a preset (`EUROPE_COUNTRY_TILES`, `US_STATE_TILES`, `UK_REGION_TILES`, `WORLD_COUNTRY_TILES`) or your own. */
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
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  headingLevel?: 2 | 3;
  /**
   * Draw the compact preview: the linked title, the key and every tile, the
   * grid sized to the space it is given. Tiles carry their code only — the
   * shading and key carry the value — and take no focus.
   */
  preview?: FigurePreview;
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
  /** The figure is a bound, an approximation or a range: drawn with a stipple. */
  stippled?: boolean;
  range?: boolean;
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
  const { tiles, highlight = [], areaLabel = 'Area', id, title, description, sources, note, footer, panel, headingLevel, preview } = props;
  const categorical = isCategorical(props);
  const what = categorical ? props.categoryLabel : props.valueLabel;
  const reactId = useId();
  const descriptionId = `sv-tile-map-${id ?? slugify(title ?? what)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-desc`;
  const rows = Math.max(...tiles.map(tile => tile.row + (tile.h ?? 1)));
  const cols = Math.max(...tiles.map(tile => tile.col + (tile.w ?? 1)));
  const caption = `${title ?? what}, by ${areaLabel.toLowerCase()}`;
  const dense = cols > DENSE_COLUMNS;

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
    summary = `${categorySummary(tiles, props)} Each area is an equal tile marked with its category's code. ${preview ? PREVIEW_CLOSING : 'Use the Table switch to see every area.'}`;
    table = <CategoryTable caption={caption} areaLabel={areaLabel} areas={tiles} encoding={props} />;
  } else {
    const { data, valueLabel, format, scale: kind = 'sequential', steps, domain, breaks } = props;
    const scale = mapScale(data, { kind, steps, domain, breaks });
    cellFor = tile => {
      const datum = data[tile.id];
      const text = readoutText(tile.name, datum, format);
      const color = datum ? scale.color(pointValue(datum)) : undefined;
      // Only the deepest sequential steps take paper-coloured text: on
      // the light theme ink stays above 4.5:1 up to about 75% of the hue,
      // and the dark theme keeps ink throughout (see maps.css).
      const binIndex = datum ? scale.bins.findIndex(bin => bin.color === color) : -1;
      return {
        readout: text,
        ariaLabel: text,
        text: dense ? (datum ? boundGlyph(datum) ?? '' : '') : tileText(datum, { ...format, compact: format?.compact ?? true }),
        background: color,
        missing: !datum,
        stippled: isStippled(datum),
        range: datum !== undefined && isRange(datum),
        dark: kind === 'sequential' && binIndex >= 0 && (binIndex + 0.5) / scale.bins.length >= 0.8,
      };
    };
    // The key to the qualification marks explains method, so a preview leaves it to the full figure.
    const qualifications = preview ? [] : qualificationsIn(tiles.flatMap(tile => (data[tile.id] ? [data[tile.id]] : [])));
    legend = <MapLegend scale={scale} format={format} valueLabel={valueLabel} showNoData={tiles.some(tile => !data[tile.id])} qualifications={qualifications} />;
    summary = mapSummary(`${tiles.length} areas, each drawn as an equal tile and shaded by ${valueLabel.toLowerCase()}.`, tiles, data, format, undefined, preview ? PREVIEW_CLOSING : undefined);
    if (dense && !preview) summary += ' The tiles are too small to print values; tab to a tile or use the Table switch to read one.';
    table = <MapTable caption={caption} areaLabel={areaLabel} valueLabel={valueLabel} areas={tiles} data={data} format={format} />;
  }

  const grid = (
    <ul
      className="sv-tile-map__grid"
      aria-label={title ?? what}
      aria-describedby={descriptionId}
      data-cols={dense ? 'dense' : cols > 6 ? 'many' : undefined}
      style={{ '--sv-tile-cols': cols, '--sv-tile-rows': rows }}
    >
      {tiles.map(tile => {
        const cell = cellFor(tile);
        return (
          <li
            key={tile.id}
            className={cell.slot ? 'sv-tile-map__tile sv-cat-fill' : 'sv-tile-map__tile'}
            style={{ gridRow: `${tile.row + 1} / span ${tile.h ?? 1}`, gridColumn: `${tile.col + 1} / span ${tile.w ?? 1}`, backgroundColor: cell.background }}
            data-region={tile.id}
            data-readout={cell.readout}
            data-slot={cell.slot}
            data-missing={cell.missing ? 'true' : undefined}
            data-stippled={cell.stippled ? 'true' : undefined}
            data-range={cell.range ? 'true' : undefined}
            data-tone={cell.dark ? 'dark' : undefined}
            data-highlight={highlight.includes(tile.id) ? 'true' : undefined}
            tabIndex={preview ? undefined : 0}
            aria-label={cell.ariaLabel}
          >
            <span className="sv-tile-map__code" aria-hidden="true">{tile.code}</span>
            {!preview && <span className="sv-tile-map__value" aria-hidden="true">{cell.text}</span>}
          </li>
        );
      })}
    </ul>
  );

  const graph = (
    <>
      {legend}
      <p className="sv-visually-hidden" id={descriptionId}>{summary}</p>
      {preview ? (
        // Sized by its container, so the whole grid fits the slide's height as well as its width.
        <div className="sv-tile-map__fit" style={{ '--sv-tile-cols': cols, '--sv-tile-rows': rows }}>{grid}</div>
      ) : (
        <MapReadout hint={`Hover over or tab to a tile to read its full name and ${categorical ? 'category' : 'value'}.`}>
          <div className="sv-tile-map__scroll">{grid}</div>
        </MapReadout>
      )}
    </>
  );

  if (preview) return <ReportFigure id={id} title={title} preview={preview} className="sv-tile-map">{graph}</ReportFigure>;

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-tile-map">
      <ChartViewToggle label={title ?? what} graph={graph} table={table} />
    </ReportFigure>
  );
}
