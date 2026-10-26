import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatValue, slugify } from './format';
import { rampBins, binColor, zeroBasedDomain } from './scale';

test('counts group thousands and negatives use a true minus sign', () => {
  assert.equal(formatValue(1441000), '1,441,000');
  assert.equal(formatValue(-85000), '−85,000');
});

test('percent and currency carry their unit, with per-unit default precision', () => {
  assert.equal(formatValue(2.104, { unit: 'percent' }), '2.1%');
  assert.equal(formatValue(38700, { unit: 'currency', currency: 'GBP' }), '£38,700');
  assert.equal(formatValue(38700, { unit: 'currency', currency: 'USD' }), '$38,700');
  assert.equal(formatValue(-1250, { unit: 'currency', currency: 'EUR' }), '\u2212€1,250');
  assert.equal(formatValue(0.456, { unit: 'number' }), '0.46');
});

test('compact writes millions and thousands the way prose does', () => {
  assert.equal(formatValue(1_441_000, { compact: true }), '1.4m');
  assert.equal(formatValue(820_000, { compact: true }), '820k');
  assert.equal(formatValue(2_300_000_000, { unit: 'currency', currency: 'GBP', compact: true }), '£2.3bn');
});

test('signed marks rises but never invents a sign for zero', () => {
  assert.equal(formatValue(31, { unit: 'percent', signed: true }), '+31%');
  assert.equal(formatValue(0, { signed: true }), '0');
});

test('a negative that rounds to zero is written as zero, not minus zero', () => {
  assert.equal(formatValue(-0.001, { unit: 'percent' }), '0%');
});

test('dates are written as precisely as they were given', () => {
  assert.equal(formatDate('2024'), '2024');
  assert.equal(formatDate('2024-11'), 'Nov 2024');
  assert.equal(formatDate('2024-11-08'), '8 Nov 2024');
});

test('slugify makes a DOM-safe id fragment', () => {
  assert.equal(slugify('Health & care (2022)'), 'health-care-2022');
});

test('a bar domain always includes zero', () => {
  const { domain } = zeroBasedDomain([40, 42]);
  assert.equal(domain[0], 0);
  assert.ok(domain[1] >= 42);
});

test('ramp bins cover the domain and place values in the right bin', () => {
  const bins = rampBins([0, 50], 5);
  assert.equal(bins.length, 5);
  assert.equal(bins[0].from, 0);
  assert.equal(bins[4].to, 50);
  assert.equal(binColor(12, bins), bins[1].color);
  assert.equal(binColor(50, bins), bins[4].color);
});

test('fixed keeps trailing zeros so a column of decimals lines up', () => {
  assert.equal(formatValue(16, { unit: 'percent', fixed: true }), '16.0%');
  assert.equal(formatValue(16, { unit: 'percent' }), '16%');
});
