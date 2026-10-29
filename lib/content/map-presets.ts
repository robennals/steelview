import { EUROPE_COUNTRIES, EUROPE_EXTENT } from '../../components/report/geo/europe-countries';
import type { Bounds } from '../../components/report/geo/project';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, US_TERRITORY_TILES, type MapTile } from '../../components/report/geo/tiles';
import type { GeoRegion } from '../../components/report/geo/types';
import { UK_ITL1_REGIONS } from '../../components/report/geo/uk-itl1';
import { WORLD_COUNTRIES } from '../../components/report/geo/world-countries';
import type { GEO_MAP_PRESETS, MAP_TILE_PRESETS } from './schema';
import type { FigureOf } from './types';

type TilePreset = (typeof MAP_TILE_PRESETS)[number];

/** Each preset's tiles, and the optional row drawn only when a figure covers one of its areas. */
const PRESETS: Record<TilePreset, { tiles: MapTile[]; optional?: MapTile[] }> = {
  'us-states': { tiles: US_STATE_TILES, optional: US_TERRITORY_TILES },
  'europe-countries': { tiles: EUROPE_COUNTRY_TILES },
  'uk-regions': { tiles: UK_REGION_TILES },
};

/** The area ids a map figure names: the keys of its data or category assignments, and its highlight. */
export function namedAreas(figure: Pick<FigureOf<'tileMap'>, 'categories' | 'areas' | 'data' | 'highlight'>): string[] {
  return [...Object.keys(figure.categories ? figure.areas ?? {} : figure.data ?? {}), ...figure.highlight];
}

/**
 * The tiles a `tileMap` figure draws: what the adapter renders and what
 * validation counts as a gap. The US territories join the states only when
 * the figure names one (see `namedAreas`), so a map of the 50 states and DC
 * is not followed by five "No data" tiles.
 */
export function mapTiles(figure: Pick<FigureOf<'tileMap'>, 'map' | 'categories' | 'areas' | 'data' | 'highlight'>): MapTile[] {
  const { tiles, optional = [] } = PRESETS[figure.map];
  const named = new Set(namedAreas(figure));
  return optional.some(tile => named.has(tile.id)) ? [...tiles, ...optional] : tiles;
}

/** Every area a `tileMap` figure may name, optional rows included. */
export function mapTileIds(map: TilePreset): string[] {
  const { tiles, optional = [] } = PRESETS[map];
  return [...tiles, ...optional].map(tile => tile.id);
}

const GEO_PRESETS: Record<(typeof GEO_MAP_PRESETS)[number], { regions: GeoRegion[]; extent?: Bounds }> = {
  world: { regions: WORLD_COUNTRIES },
  // The Europe set includes North Africa and the Middle East for context; the
  // extent crops to Europe and keeps far-flung territories off the drawing.
  europe: { regions: EUROPE_COUNTRIES, extent: EUROPE_EXTENT },
  'uk-itl1': { regions: UK_ITL1_REGIONS },
};

/** The outlines (and crop) a `geoMap` figure's `regions` names: what the adapter draws and what validation checks area ids against. */
export function geoRegions(regions: (typeof GEO_MAP_PRESETS)[number]): { regions: GeoRegion[]; extent?: Bounds } {
  return GEO_PRESETS[regions];
}
