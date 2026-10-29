import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barScale, barSpan, qualifiedSpan, stackExtent, stackSpans, tickLabels } from './bar-layout';

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

test('a bound or an approximation is drawn to its value and keeps its qualification', () => {
  const scale = barScale([0, 100]);
  assert.deepEqual(qualifiedSpan({ value: 40, qualifier: 'at least' }, scale), { left: 0, width: 40, qualification: 'lower-bound' });
  assert.deepEqual(qualifiedSpan({ value: 40, qualifier: 'under' }, scale), { left: 0, width: 40, qualification: 'upper-bound' });
  assert.deepEqual(qualifiedSpan({ value: 40, qualifier: 'about' }, scale), { left: 0, width: 40, qualification: 'approximate' });
  assert.deepEqual(qualifiedSpan(40, scale), { left: 0, width: 40, qualification: 'exact' });
});

test('a range is a bar to its low end and a whisker on to its high end', () => {
  const scale = barScale([0, 100]);
  assert.deepEqual(qualifiedSpan({ low: 20, high: 60 }, scale), { left: 0, width: 20, qualification: 'range', whisker: { left: 20, width: 40 } });
});

test('a negative value is marked so its end mark sits at its left edge', () => {
  const scale = barScale([-50, 50]);
  assert.equal(qualifiedSpan({ value: -20, qualifier: 'about' }, scale).negative, true);
  assert.equal(qualifiedSpan(20, scale).negative, undefined);
});
