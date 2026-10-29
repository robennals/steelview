import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datumText, mapScale, mapSummary, niceMapDomain, readoutText } from './choropleth';

test('sequential domain starts at a round number below the minimum and covers the maximum', () => {
  assert.deepEqual(niceMapDomain([6.8, 12, 40.6], 'sequential', 5), [0, 50]);
  assert.deepEqual(niceMapDomain([21, 24, 38], 'sequential', 4), [20, 40]);
  assert.deepEqual(niceMapDomain([0.03, 95], 'sequential', 5), [0, 100]);
});

test('diverging domain is symmetric about zero', () => {
  assert.deepEqual(niceMapDomain([-3.2, 7.4], 'diverging', 6), [-7.5, 7.5]);
  assert.deepEqual(niceMapDomain([-0.4, 0.2], 'diverging', 4), [-0.4, 0.4]);
});

test('an empty dataset still yields a usable domain', () => {
  assert.deepEqual(niceMapDomain([], 'sequential', 5), [0, 1]);
  assert.deepEqual(niceMapDomain([], 'diverging', 6), [-1, 1]);
});

test('mapScale bins the domain into the requested steps and colours by bin', () => {
  const scale = mapScale({ a: { value: 1 }, b: { value: 9 } }, { steps: 5 });
  assert.equal(scale.bins.length, 5);
  assert.deepEqual(scale.domain, [0, 10]);
  assert.equal(scale.color(1), scale.bins[0].color);
  assert.equal(scale.color(9), scale.bins[4].color);
  assert.equal(scale.color(10), scale.bins[4].color, 'the top boundary belongs to the top bin');
});

test('a fixed domain overrides the computed one', () => {
  assert.deepEqual(mapScale({ a: { value: 3 } }, { domain: [0, 100], steps: 4 }).domain, [0, 100]);
});

test('missing data reads "No data", not zero', () => {
  assert.equal(datumText(undefined), 'No data');
  assert.equal(datumText({ value: 0 }, { unit: 'percent' }), '0%');
  assert.equal(datumText({ value: 0.03, label: '<0.1' }), '<0.1');
  assert.equal(readoutText('London', { value: 40.6 }, { unit: 'percent' }), 'London: 40.6%');
});

test('explicit breaks make uneven bins, coloured in order', () => {
  const scale = mapScale({ a: { value: 3 }, b: { value: 95 } }, { breaks: [0, 5, 20, 100] });
  assert.deepEqual(scale.bins.map(b => [b.from, b.to]), [[0, 5], [5, 20], [20, 100]]);
  assert.deepEqual(scale.domain, [0, 100]);
  assert.equal(scale.color(3), scale.bins[0].color);
  assert.equal(scale.color(95), scale.bins[2].color);
  assert.notEqual(scale.bins[0].color, scale.bins[2].color);
});

test('mapSummary names the extremes and the areas with no data', () => {
  const areas = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }, { id: 'c', name: 'Gamma' }];
  assert.equal(
    mapSummary('Three areas.', areas, { a: { value: 2 }, b: { value: 9 } }, { unit: 'percent' }),
    'Three areas. Highest: Beta: 9%. Lowest: Alpha: 2%. No data for Gamma. Use the Table switch to see every value.',
  );
});
