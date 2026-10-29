import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partitionRegions } from './regions';
import { EUROPE_COUNTRIES } from './europe-countries';
import { EUROPE_COUNTRY_TILES } from './tiles';
import { WORLD_COUNTRIES } from './world-countries';

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
  const cells = EUROPE_COUNTRY_TILES.map(tile => `${tile.row},${tile.col}`);
  assert.equal(new Set(cells).size, cells.length, 'no two tiles share a cell');
});
