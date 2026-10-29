import { useId, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { ReportFigure } from './figure';
import { slugify } from './format';
import type { MapEncoding } from './geo/categorical';
import { mapShading } from './geo/shading';
import { isDenseLayout, TileGrid } from './geo/tile-grid';
import type { MapTile } from './geo/tiles';
import type { SourceCredit } from './types';

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
};

/**
 * Shaded either by a number (`data`, `valueLabel`, `format`, `scale`, …) or
 * by a category (`categoryLabel`, `categories`, `categoryData`) — never both.
 */
export type TileMapProps = TileMapCommon & MapEncoding;

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
  const { tiles, highlight = [], areaLabel = 'Area', id, title, description, sources, note, footer, panel, headingLevel } = props;
  const what = props.categories ? props.categoryLabel : props.valueLabel;
  const reactId = useId();
  const descriptionId = `sv-tile-map-${id ?? slugify(title ?? what)}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-desc`;
  const shading = mapShading(props, tiles, { caption: `${title ?? what}, by ${areaLabel.toLowerCase()}`, areaLabel });

  const graph = (
    <>
      {shading.legend}
      <p className="sv-visually-hidden" id={descriptionId}>{shading.summary(tileSentence(tiles, shading.categorical))}</p>
      <TileGrid tiles={tiles} lookFor={shading.lookFor} highlight={highlight} label={title ?? what} descriptionId={descriptionId} categorical={shading.categorical} />
    </>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} headingLevel={headingLevel} className="sv-tile-map">
      <ChartViewToggle label={title ?? what} graph={graph} table={shading.table} />
    </ReportFigure>
  );
}

/** What the tile view's screen-reader description says about the drawing itself. */
export function tileSentence(tiles: MapTile[], categorical: boolean): string {
  const drawn = categorical ? 'Each area is an equal tile marked with its category\'s code.' : `${tiles.length} areas, each drawn as an equal tile.`;
  return isDenseLayout(tiles) && !categorical ? `${drawn} The tiles are too small to print values; tab to a tile or use the Table switch to read one.` : drawn;
}
