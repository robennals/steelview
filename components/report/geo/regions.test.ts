import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partitionRegions } from './regions';
import { EUROPE_COUNTRIES } from './europe-countries';
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
