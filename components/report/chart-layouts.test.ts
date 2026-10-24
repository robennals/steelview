import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossesNull, estimateScale } from './estimate-layout';
import { layoutPanels } from './small-multiples-layout';

test('forest plot axis always includes the no-effect value', () => {
  const scale = estimateScale([{ estimate: 0.5, low: 0.2, high: 0.8 }]);
  assert.equal(scale.ticks[0], 0);
  assert.equal(scale.zero, 0);
  assert.equal(crossesNull({ low: 0.2, high: 0.8 }), false);
  assert.equal(crossesNull({ low: -0.1, high: 0.8 }), true);
});

test('a fixed forest-plot domain clamps positions to the track', () => {
  const scale = estimateScale([{ estimate: 0, low: -2, high: 2 }], 0, [-1, 1]);
  assert.equal(scale.x(-2), 0);
  assert.equal(scale.x(2), 100);
  assert.equal(scale.zero, 50);
});

test('small multiples share one y-scale unless asked not to', () => {
  const panels = [
    { name: 'big', points: [{ period: '2021', value: 100 }, { period: '2022', value: 200 }] },
    { name: 'small', points: [{ period: '2021', value: 10 }, { period: '2022', value: 20 }] },
  ];
  const shared = layoutPanels(panels);
  assert.deepEqual(shared.panels[0].ticks, shared.panels[1].ticks);
  // The small panel's latest point sits low on the shared scale.
  assert.ok(shared.panels[1].last!.y > 80);
  const independent = layoutPanels(panels, { independentScales: true });
  assert.notDeepEqual(independent.panels[0].ticks, independent.panels[1].ticks);
  assert.equal(independent.panels[1].last!.y, 0);
  assert.deepEqual(shared.periods, ['2021', '2022']);
});
