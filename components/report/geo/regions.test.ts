import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partitionRegions } from './regions';
import { EUROPE_COUNTRIES } from './europe-countries';
import { EUROPE_COUNTRY_TILES, UK_REGION_TILES, US_STATE_TILES, US_TERRITORY_TILES, type MapTile } from './tiles';
import { WORLD_COUNTRIES } from './world-countries';
import { WORLD_COUNTRY_TILES } from './world-tiles';

test('partitionRegions splits covered areas from context, losing none', () => {
  const { regions, context } = partitionRegions(EUROPE_COUNTRIES, ['FR', 'DE', 'XX']);
  assert.deepEqual(regions.map(r => r.id).sort(), ['DE', 'FR']);
  assert.equal(regions.length + context.length, EUROPE_COUNTRIES.length);
});

test('preset outline sets have unique ids, so data joins are unambiguous', () => {
  for (const set of [WORLD_COUNTRIES, EUROPE_COUNTRIES]) {
    const ids = set.map(r => r.id);
    assert.equal(new Set(ids).size, ids.length);
  }
  assert.ok(WORLD_COUNTRIES.some(r => r.id === 'FR'), 'France resolved from Natural Earth\'s -99 placeholder');
  assert.ok(WORLD_COUNTRIES.some(r => r.id === 'NO'), 'Norway resolved from Natural Earth\'s -99 placeholder');
});

test('every sovereign state too small for the world outlines is drawn as a dot', () => {
  for (const id of ['AD', 'LI', 'MC', 'SM', 'VA', 'MT', 'FM', 'MH', 'PW', 'NR', 'TV', 'KI', 'SG']) {
    const region = WORLD_COUNTRIES.find(r => r.id === id);
    assert.ok(region?.point, `${id} has a dot`);
    assert.deepEqual(region.coordinates, []);
  }
  assert.equal(WORLD_COUNTRIES.find(r => r.id === 'BA')?.name, 'Bosnia and Herzegovina', 'abbreviated names are written out');
});

test('the Europe tiles cover the EU27, the four EFTA states and the UK', () => {
  const ids = EUROPE_COUNTRY_TILES.map(tile => tile.id);
  assert.equal(ids.length, 32);
  for (const id of ['IS', 'LI', 'NO', 'CH', 'GB']) assert.ok(ids.includes(id), id);
});

/** Every grid cell a tile covers, spans included. */
const cellsOf = (tile: MapTile) =>
  Array.from({ length: (tile.w ?? 1) * (tile.h ?? 1) }, (_, i) => `${tile.row + Math.floor(i / (tile.w ?? 1))},${tile.col + (i % (tile.w ?? 1))}`);

test('no two tiles of a layout cover the same cell, spans included', () => {
  for (const layout of [EUROPE_COUNTRY_TILES, UK_REGION_TILES, [...US_STATE_TILES, ...US_TERRITORY_TILES], WORLD_COUNTRY_TILES]) {
    const cells = layout.flatMap(cellsOf);
    assert.equal(new Set(cells).size, cells.length);
  }
});

test('the US layout draws Alaska, California and Texas larger, and keeps spans modest', () => {
  const size = (id: string) => {
    const tile = US_STATE_TILES.find(t => t.id === id);
    return `${tile?.w ?? 1}×${tile?.h ?? 1}`;
  };
  assert.deepEqual(['AK', 'CA', 'TX', 'RI', 'DC'].map(size), ['2×2', '1×2', '2×2', '1×1', '1×1']);
  for (const tile of US_STATE_TILES) assert.ok((tile.w ?? 1) * (tile.h ?? 1) <= 4, `${tile.id} spans at most four cells`);
});

test('the world tiles give every sovereign state one tile, each joined to its outline or dot', () => {
  assert.equal(WORLD_COUNTRY_TILES.length, 197);
  const ids = new Set(WORLD_COUNTRY_TILES.map(tile => tile.id));
  assert.equal(ids.size, 197);
  for (const id of ids) assert.ok(WORLD_COUNTRIES.some(region => region.id === id), `${id} has an outline or a dot`);
  // Natural Earth's other mapped areas — territories and places of disputed status — have no tile.
  const untiled = WORLD_COUNTRIES.filter(region => !ids.has(region.id)).map(region => region.id).sort();
  assert.deepEqual(untiled, ['AQ', 'CYN', 'EH', 'FK', 'GL', 'NC', 'PR', 'SOL', 'TF']);
});
