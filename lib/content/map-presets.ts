import { EUROPE_COUNTRIES, EUROPE_EXTENT } from '../../components/report/geo/europe-countries';
import type { Bounds } from '../../components/report/geo/project';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, type MapTile } from '../../components/report/geo/tiles';
import type { GeoRegion } from '../../components/report/geo/types';
import { UK_ITL1_REGIONS } from '../../components/report/geo/uk-itl1';
import { WORLD_COUNTRIES } from '../../components/report/geo/world-countries';
import type { GEO_MAP_PRESETS, MAP_TILE_PRESETS } from './schema';

const PRESETS: Record<(typeof MAP_TILE_PRESETS)[number], MapTile[]> = {
  'us-states': US_STATE_TILES,
  'europe-countries': EUROPE_COUNTRY_TILES,
  'uk-regions': UK_REGION_TILES,
};

/** The tiles a `tileMap` figure's `map` names: what the adapter draws and what validation checks data keys against. */
export function mapTiles(map: (typeof MAP_TILE_PRESETS)[number]): MapTile[] {
  return PRESETS[map];
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
