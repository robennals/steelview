import { EUROPE_COUNTRIES, EUROPE_EXTENT } from '../../components/report/geo/europe-countries';
import type { Bounds } from '../../components/report/geo/project';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, US_TERRITORY_TILES, type MapTile } from '../../components/report/geo/tiles';
import type { GeoRegion } from '../../components/report/geo/types';
import { UK_ITL1_REGIONS } from '../../components/report/geo/uk-itl1';
import { US_STATES, US_TERRITORIES } from '../../components/report/geo/us-states';
import { WORLD_COUNTRIES, WORLD_EXTENT } from '../../components/report/geo/world-countries';
import { WORLD_COUNTRY_TILES } from '../../components/report/geo/world-tiles';
import type { MAP_PRESETS } from './schema';
import type { FigureOf } from './types';

type MapPreset = (typeof MAP_PRESETS)[number];

type PresetAreas = {
  /** The areas, as tiles. Every tile has a shape with its id in `outlines`. */
  tiles: MapTile[];
  /** The real-shape view's outlines and dots: the areas' own, and any neighbours drawn for context. */
  outlines: GeoRegion[];
  /** The lon/lat box the real-shape view shows. */
  extent?: Bounds;
  /** Areas drawn only when a figure names one: the US territories. */
  optional?: { tiles: MapTile[]; outlines: GeoRegion[] };
};

/**
 * Each preset's areas. The tiles decide what an area is: the real-shape view
 * draws every other outline in the set as plain context, so Europe's
 * neighbours and the world's territories (Greenland, Western Sahara) frame
 * the map without reading as "No data".
 */
const PRESETS: Record<MapPreset, PresetAreas> = {
  'us-states': { tiles: US_STATE_TILES, outlines: US_STATES, optional: { tiles: US_TERRITORY_TILES, outlines: US_TERRITORIES } },
  // The Europe set includes North Africa and the Middle East for context; the
  // extent crops to Europe and keeps far-flung territories off the drawing.
  europe: { tiles: EUROPE_COUNTRY_TILES, outlines: EUROPE_COUNTRIES, extent: EUROPE_EXTENT },
  'uk-regions': { tiles: UK_REGION_TILES, outlines: UK_ITL1_REGIONS },
  world: { tiles: WORLD_COUNTRY_TILES, outlines: WORLD_COUNTRIES, extent: WORLD_EXTENT },
};

type NamingFigure = Pick<FigureOf<'map'>, 'categories' | 'areas' | 'data' | 'highlight'>;

/** The area ids a map figure names: the keys of its data or category assignments, and its highlight. */
function namedAreas(figure: NamingFigure): Set<string> {
  return new Set([...Object.keys(figure.categories ? figure.areas ?? {} : figure.data ?? {}), ...figure.highlight]);
}

/**
 * What a `map` figure draws: its preset's areas as tiles and as shapes, in
 * the same order, the neighbours drawn for context, and the crop. What the
 * adapter renders and what validation counts as a gap. The US territories
 * join the states only when the figure names one, so a map of the 50 states
 * and DC is not followed by five "No data" tiles.
 */
export function mapAreas(figure: NamingFigure & Pick<FigureOf<'map'>, 'preset'>): { tiles: MapTile[]; regions: GeoRegion[]; contextRegions: GeoRegion[]; extent?: Bounds } {
  const { tiles, outlines, extent, optional } = PRESETS[figure.preset];
  const named = namedAreas(figure);
  const extra = optional && optional.tiles.some(tile => named.has(tile.id)) ? optional : { tiles: [], outlines: [] };
  const shownTiles = [...tiles, ...extra.tiles];
  const outlineOf = new Map([...outlines, ...extra.outlines].map(region => [region.id, region]));
  return {
    tiles: shownTiles,
    regions: shownTiles.flatMap(tile => outlineOf.get(tile.id) ?? []),
    contextRegions: outlines.filter(region => !shownTiles.some(tile => tile.id === region.id)),
    extent,
  };
}

/** Every area a `map` figure may name, optional ones included. */
export function mapAreaIds(preset: MapPreset): string[] {
  const { tiles, optional } = PRESETS[preset];
  return [...tiles, ...(optional?.tiles ?? [])].map(tile => tile.id);
}
