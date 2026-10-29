import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutScatter, placeLabels, SCATTER_GEOMETRY, scatterScale, type Box, type LabelInput } from './scatter';

/**
 * Seven states: hours to count 95% of the vote (AZ, NV, PA, GA and NC from
 * MIT Election Lab's 2024 figures; WI and MI made up) against an
 * illustrative processing lead time. Test data, not a fixture to publish.
 */
const SEVEN = [
  { id: 'az', label: 'AZ', x: 14, y: 147 },
  { id: 'nv', label: 'NV', x: 15, y: 51 },
  { id: 'pa', label: 'PA', x: 0, y: 8 },
  { id: 'ga', label: 'GA', x: 21, y: 5 },
  { id: 'nc', label: 'NC', x: 35, y: 6 },
  { id: 'wi', label: 'WI', x: 0, y: 20 },
  { id: 'mi', label: 'MI', x: 8, y: 12 },
];
const axes = { x: { format: String }, y: { format: String } };

const overlaps = (a: Box, b: Box) =>
  Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x) && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y);

test('scales include zero by default and end on round ticks', () => {
  assert.deepEqual(scatterScale([12, 147]).domain, [0, 150]);
  assert.equal(scatterScale([12, 147]).ticks[0], 0);
  const free = scatterScale([60, 147], { includeZero: false });
  assert.deepEqual(free.domain, [60, 160]);
});

test('an explicit domain is used as given, with ticks only inside it', () => {
  const scale = scatterScale([3, 40], { domain: [0, 45] });
  assert.deepEqual(scale.domain, [0, 45]);
  assert.ok(scale.ticks.every(tick => tick >= 0 && tick <= 45));
});

test('the narrow and wide variants share both scales', () => {
  const narrow = layoutScatter(SEVEN, axes, 'narrow');
  const wide = layoutScatter(SEVEN, axes, 'wide');
  assert.deepEqual(narrow.xScale, wide.xScale);
  assert.deepEqual(narrow.yScale, wide.yScale);
  assert.deepEqual(narrow.yTicks.map(tick => tick.value), wide.yTicks.map(tick => tick.value));
});

test('narrow y labels every second tick, wide labels each', () => {
  const narrow = layoutScatter(SEVEN, axes, 'narrow');
  const wide = layoutScatter(SEVEN, axes, 'wide');
  assert.ok(narrow.yTicks.some(tick => tick.label === null));
  assert.ok(wide.yTicks.every(tick => tick.label !== null));
  assert.equal(narrow.yTicks.find(tick => tick.value === 0)?.label, '0', 'zero stays labelled');
});

test('points sit inside the plot', () => {
  for (const variant of ['narrow', 'wide'] as const) {
    const { geometry: g, points } = layoutScatter(SEVEN, axes, variant);
    for (const point of points) {
      assert.ok(point.cx >= g.left && point.cx <= g.left + g.plotWidth);
      assert.ok(point.cy >= g.top && point.cy <= g.top + g.plotHeight);
    }
  }
});

for (const variant of ['narrow', 'wide'] as const) {
  test(`labels for the seven-state fixture stay inside the plot and never overlap (${variant})`, () => {
    const { geometry: g, points } = layoutScatter(SEVEN, axes, variant);
    const r = g.pointRadius;
    for (const point of points) {
      const { box } = point.label;
      assert.equal(point.label.crowded, false, `${point.id} found a free position`);
      assert.ok(box.x >= g.left && box.y >= g.top && box.x + box.width <= g.left + g.plotWidth && box.y + box.height <= g.top + g.plotHeight, `${point.id} label inside`);
      for (const other of points) {
        if (other === point) continue;
        assert.ok(!overlaps(box, other.label.box), `${point.id} label clear of ${other.id} label`);
        assert.ok(!overlaps(box, { x: other.cx - r, y: other.cy - r, width: 2 * r, height: 2 * r }), `${point.id} label clear of ${other.id} point`);
      }
    }
  });
}

test('placement is deterministic and does not depend on input order', () => {
  const { points } = layoutScatter(SEVEN, axes, 'narrow');
  const input: LabelInput[] = points.map(point => ({ id: point.id, label: point.id.toUpperCase(), cx: point.cx, cy: point.cy }));
  const once = placeLabels(input, SCATTER_GEOMETRY.narrow);
  const again = placeLabels([...input].reverse(), SCATTER_GEOMETRY.narrow).reverse();
  assert.deepEqual(once, again);
});

test('a point prefers a label on its right', () => {
  const g = SCATTER_GEOMETRY.wide;
  const [label] = placeLabels([{ id: 'a', label: 'AB', cx: g.left + 100, cy: g.top + 100 }], g);
  assert.equal(label.position, 'right');
  assert.equal(label.anchor, 'start');
});

test('a point at the right edge puts its label on the left', () => {
  const g = SCATTER_GEOMETRY.wide;
  const [label] = placeLabels([{ id: 'a', label: 'AB', cx: g.left + g.plotWidth, cy: g.top + 100 }], g);
  assert.equal(label.position, 'left');
  assert.equal(label.anchor, 'end');
});

test('highlighted points choose first', () => {
  const g = SCATTER_GEOMETRY.wide;
  // A point at the right edge can only go left, into the space its
  // neighbour's right-hand label wants. Whichever chooses first gets it.
  const edge = g.left + g.plotWidth;
  const points = (highlight: boolean): LabelInput[] => [
    { id: 'near', label: 'NN', cx: edge - 30, cy: g.top + 100 },
    { id: 'edge', label: 'EE', cx: edge, cy: g.top + 100, highlight },
  ];
  const [nearPlain, edgePlain] = placeLabels(points(false), g);
  assert.equal(nearPlain.position, 'right');
  assert.notEqual(edgePlain.position, 'left');
  const [nearHighlit, edgeHighlit] = placeLabels(points(true), g);
  assert.equal(edgeHighlit.position, 'left');
  assert.notEqual(nearHighlit.position, 'right');
});

test('a point with nowhere free is placed inside the plot and marked crowded', () => {
  const g = SCATTER_GEOMETRY.narrow;
  const cx = g.left + 50;
  const cy = g.top + 50;
  const ring: LabelInput[] = [-1, 0, 1].flatMap(dx => [-1, 0, 1].map(dy => ({ id: `${dx},${dy}`, label: 'WWWW', cx: cx + dx * 9, cy: cy + dy * 9 })));
  const labels = placeLabels(ring, g);
  const centre = labels.find(label => label.id === '0,0');
  assert.ok(centre?.crowded);
  for (const label of labels) {
    assert.ok(label.box.x >= g.left && label.box.x + label.box.width <= g.left + g.plotWidth);
  }
});
