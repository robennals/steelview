import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, type MapTile } from '../../components/report/geo/tiles';
import type { MAP_TILE_PRESETS } from './schema';

const PRESETS: Record<(typeof MAP_TILE_PRESETS)[number], MapTile[]> = {
  'us-states': US_STATE_TILES,
  'europe-countries': EUROPE_COUNTRY_TILES,
  'uk-regions': UK_REGION_TILES,
};

/** The tiles a `tileMap` figure's `map` names: what the adapter draws and what validation checks data keys against. */
export function mapTiles(map: (typeof MAP_TILE_PRESETS)[number]): MapTile[] {
  return PRESETS[map];
}
