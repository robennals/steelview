import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { GeoRegion } from './types';
import { aspectOf, boundsOf, centroidOf, chooseProjection, equalEarth, fitBounds, fitProjection, pathFor } from './project';
import { UK_ITL1_REGIONS } from './uk-itl1';

/** A 2°×1° box on the equator, where the cosine squeeze is within 0.004% of 1. */
const box: GeoRegion = {
  id: 'box',
  name: 'Box',
  coordinates: [[[[0, 0], [2, 0], [2, 1], [0, 1], [0, 0]]]],
};

function near(actual: number[], expected: number[], tolerance = 0.01) {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < tolerance, `${actual} ≈ ${expected}`));
}

test('boundsOf spans every point of every region', () => {
  assert.deepEqual(boundsOf([box]), { minLon: 0, maxLon: 2, minLat: 0, maxLat: 1 });
  const uk = boundsOf(UK_ITL1_REGIONS);
  assert.ok(uk.minLon < -8 && uk.maxLon > 1.5, 'UK longitude from Northern Ireland to East Anglia');
  assert.ok(uk.minLat < 50.1 && uk.maxLat > 60, 'UK latitude from Cornwall to Shetland');
});

test('fitProjection fits without stretching and centres the slack', () => {
  // 2×1 degrees into 100×100: width-limited, so 50px per degree, 25px slack top and bottom.
  const { project, scale } = fitProjection([box], { width: 100, height: 100 });
  near([scale], [50]);
  near(project([0, 1]), [0, 25]);
  near(project([2, 0]), [100, 75]);
});

test('fitProjection honours padding and offset', () => {
  const { project } = fitProjection([box], { width: 120, height: 100, padding: 10, x: 5, y: 7 });
  near(project([0, 1]), [15, 32]);
  near(project([2, 0]), [115, 82]);
});

test('north is up: higher latitude projects to smaller y', () => {
  const { project } = fitProjection(UK_ITL1_REGIONS, { width: 300, height: 500 });
  const [, shetlandY] = project([-1.2, 60.3]);
  const [, cornwallY] = project([-5.5, 50.1]);
  assert.ok(shetlandY < cornwallY);
});

test('longitude is squeezed by the cosine of the centre latitude', () => {
  const at60: GeoRegion = { id: 'n', name: 'N', coordinates: [[[[0, 59.5], [1, 59.5], [1, 60.5], [0, 60.5]]]] };
  const { project } = fitProjection([at60], { width: 1000, height: 100 });
  const [x0] = project([0, 60]);
  const [x1] = project([1, 60]);
  assert.ok(Math.abs((x1 - x0) / 100 - Math.cos(Math.PI / 3)) < 1e-9, 'one degree of longitude at 60°N is half a degree of latitude');
});

test('pathFor writes one closed subpath per ring, rounded to 0.1px', () => {
  const holed: GeoRegion = {
    id: 'h',
    name: 'H',
    coordinates: [[
      [[0, 0], [2, 0], [2, 1], [0, 1]],
      [[0.5, 0.25], [1.5, 0.25], [1.5, 0.75]],
    ]],
  };
  const projection = fitProjection([holed], { width: 3, height: 3 });
  const d = pathFor(holed.coordinates, projection);
  assert.equal(d.match(/M/g)?.length, 2);
  assert.equal(d.match(/Z/g)?.length, 2);
  assert.match(d, /^M0,2\.3L3,2\.3L3,0\.7L0,0\.7ZM/);
});

test('pathFor skips degenerate rings', () => {
  const projection = fitProjection([box], { width: 10, height: 10 });
  assert.equal(pathFor([[[[0, 0], [1, 1]]]], projection), '');
});

test('centroidOf lands inside the region', () => {
  assert.deepEqual(centroidOf(box), [1, 0.5]);
  const london = UK_ITL1_REGIONS.find(region => region.id === 'london')!;
  const [lon, lat] = centroidOf(london);
  assert.ok(lon > -0.4 && lon < 0.1 && lat > 51.35 && lat < 51.65, `London centroid ${lon},${lat}`);
});

test('the projection is chosen from the extent: local for a country, Equal Earth beyond', () => {
  assert.equal(chooseProjection(boundsOf(UK_ITL1_REGIONS)), 'local');
  assert.equal(chooseProjection({ minLon: -180, maxLon: 180, minLat: -60, maxLat: 85 }), 'equal-earth');
  assert.equal(chooseProjection({ minLon: -25, maxLon: 42, minLat: 34, maxLat: 71.5 }), 'equal-earth');
});

test('Equal Earth matches the published reference values', () => {
  // The origin maps to the origin; the projection's full width at the
  // equator is 2 × 2.7066 and its height pole to pole 2 × 1.3173 (Šavrič et al. 2018).
  near(equalEarth(0, 0), [0, 0], 1e-12);
  near([equalEarth(Math.PI, 0)[0]], [2.7066], 1e-3);
  near([equalEarth(0, Math.PI / 2)[1]], [1.3173], 1e-3);
});

test('Equal Earth is equal-area: two cells of equal true area project to equal areas', () => {
  // A 10°×10° cell's true area scales with sin(lat2) − sin(lat1).
  const cellArea = (lat: number) => {
    const p = (lon: number, la: number) => equalEarth((lon * Math.PI) / 180, (la * Math.PI) / 180);
    const [a, b, c, d] = [p(0, lat), p(10, lat), p(10, lat + 10), p(0, lat + 10)];
    return Math.abs((a[0] * b[1] - b[0] * a[1]) + (b[0] * c[1] - c[0] * b[1]) + (c[0] * d[1] - d[0] * c[1]) + (d[0] * a[1] - a[0] * d[1])) / 2;
  };
  const trueArea = (lat: number) => Math.sin(((lat + 10) * Math.PI) / 180) - Math.sin((lat * Math.PI) / 180);
  const ratio = (lat: number) => cellArea(lat) / trueArea(lat);
  assert.ok(Math.abs(ratio(0) / ratio(60) - 1) < 0.01, `area ratio at 0° vs 60°: ${ratio(0) / ratio(60)}`);
});

test('a map is drawn in the proportions of its geography', () => {
  assert.ok(aspectOf(boundsOf(UK_ITL1_REGIONS)) > 1.4, 'the UK is tall');
  const world = aspectOf({ minLon: -180, maxLon: 180, minLat: -60, maxLat: 85 });
  assert.ok(world > 0.4 && world < 0.6, `the world is wide: ${world}`);
});

test('the fitted frame is the box the extent occupies, for clipping', () => {
  const { frame } = fitBounds({ minLon: 0, maxLon: 2, minLat: 0, maxLat: 1 }, { width: 100, height: 100, kind: 'local' });
  near([frame.x, frame.y, frame.width, frame.height], [0, 25, 100, 50]);
});
