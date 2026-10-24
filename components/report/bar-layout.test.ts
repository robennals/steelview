import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barScale, barSpan, stackExtent, stackSpans, tickLabels } from './bar-layout';

test('bar scale always includes zero', () => {
  const scale = barScale([40, 42]);
  assert.equal(scale.domain[0], 0);
  assert.equal(scale.zero, 0);
});

test('negative bars extend left of zero', () => {
  const scale = barScale([-40, 40]);
  assert.deepEqual(scale.domain, [-40, 40]);
  assert.equal(scale.zero, 50);
  assert.deepEqual(barSpan(-40, scale), { left: 0, width: 50 });
  assert.deepEqual(barSpan(20, scale), { left: 50, width: 25 });
});

test('domainMax widens the axis', () => {
  assert.equal(barScale([10], 100).domain[1], 100);
});

test('stacks run positive parts right and negative parts left of zero', () => {
  const scale = barScale([-20, 60]);
  const zero = scale.zero;
  const spans = stackSpans([30, -20, 30, null], scale);
  assert.equal(spans[0]!.left, zero);
  assert.equal(spans[2]!.left, scale.x(30));
  assert.equal(spans[1]!.left + spans[1]!.width, zero);
  assert.equal(spans[3], null);
  assert.deepEqual(stackExtent([30, -20, 30, null]), [-20, 60]);
});

test('large ticks are compacted, and ticks compaction would round go unlabelled', () => {
  assert.deepEqual(tickLabels([0, 500_000, 1_000_000]).map(t => t.label), ['0', '500k', '1m']);
  assert.deepEqual(tickLabels([0, 1_000_000, 1_250_000]).map(t => t.label), ['0', '1m', null]);
  assert.deepEqual(tickLabels([0, 20, 40], { unit: 'percent' }).map(t => t.label), ['0%', '20%', '40%']);
  assert.deepEqual(tickLabels([1_250_000], { compact: false }).map(t => t.label), ['1,250,000']);
});
