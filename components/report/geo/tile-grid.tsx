import { MapReadout } from './map-readout';
import type { AreaLook } from './shading';
import type { MapTile } from './tiles';

/**
 * Past this many columns (the world grid has 28) a tile is too small to
 * print a number: it shows its code and, on a numeric map, only a bound's
 * ▲ or ▼, and the grid keeps a minimum tile size, scrolling sideways on a
 * phone rather than shrinking every tile below a fingertip.
 */
const DENSE_COLUMNS = 16;

/** Whether a layout is too wide for its tiles to print values (see DENSE_COLUMNS). */
export function isDenseLayout(tiles: MapTile[]): boolean {
  return Math.max(...tiles.map(tile => tile.col + (tile.w ?? 1))) > DENSE_COLUMNS;
}

type TileGridProps = {
  tiles: MapTile[];
  lookFor: (tile: MapTile) => AreaLook;
  highlight: string[];
  /** The grid's accessible name: the figure's title. */
  label: string;
  /** The id of the screen-reader description the grid points at. */
  descriptionId: string;
  categorical: boolean;
  /**
   * A compact preview: the grid scaled to fit the space it is given, each
   * tile its code only — the shading and key carry the value — and no
   * readout or focus stops.
   */
  preview?: boolean;
};

/**
 * The tile view: every area one tile (or a few cells, where the layout
 * spans them) in a CSS grid, each printing its code and its value or mark,
 * and each focusable, with its sentence in the shared readout.
 */
export function TileGrid({ tiles, lookFor, highlight, label, descriptionId, categorical, preview = false }: TileGridProps) {
  const rows = Math.max(...tiles.map(tile => tile.row + (tile.h ?? 1)));
  const cols = Math.max(...tiles.map(tile => tile.col + (tile.w ?? 1)));
  const dense = isDenseLayout(tiles);
  const grid = (
    <ul
      className="sv-tile-map__grid"
      aria-label={label}
      aria-describedby={descriptionId}
      data-cols={dense ? 'dense' : cols > 6 ? 'many' : undefined}
      style={{ '--sv-tile-cols': cols, '--sv-tile-rows': rows }}
    >
      {tiles.map(tile => {
        const look = lookFor(tile);
        return (
          <li
            key={tile.id}
            className={look.slot ? 'sv-tile-map__tile sv-cat-fill' : 'sv-tile-map__tile'}
            style={{ gridRow: `${tile.row + 1} / span ${tile.h ?? 1}`, gridColumn: `${tile.col + 1} / span ${tile.w ?? 1}`, backgroundColor: look.color }}
            data-region={tile.id}
            data-row={tile.id}
            data-readout={look.readout}
            data-slot={look.slot}
            data-missing={look.missing ? 'true' : undefined}
            data-stippled={look.stippled ? 'true' : undefined}
            data-range={look.range ? 'true' : undefined}
            data-tone={look.dark ? 'dark' : undefined}
            data-highlight={highlight.includes(tile.id) ? 'true' : undefined}
            tabIndex={preview ? undefined : 0}
            aria-label={look.ariaLabel}
          >
            <span className="sv-tile-map__code" aria-hidden="true">{tile.code}</span>
            {!preview && <span className="sv-tile-map__value" aria-hidden="true">{dense ? look.denseText : look.tileText}</span>}
          </li>
        );
      })}
    </ul>
  );
  // Sized by its container, so the whole grid fits the slide's height as well as its width.
  if (preview) return <div className="sv-tile-map__fit" style={{ '--sv-tile-cols': cols, '--sv-tile-rows': rows }}>{grid}</div>;
  return (
    <MapReadout hint={`Hover over or tab to a tile to read its full name and ${categorical ? 'category' : 'value'}.`}>
      <div className="sv-tile-map__scroll">{grid}</div>
    </MapReadout>
  );
}
