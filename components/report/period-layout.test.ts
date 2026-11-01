import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placePeriodLabels } from './period-layout';

test('a label that fits its bar goes inside', () => {
  assert.deepEqual(placePeriodLabels([{ left: 0, right: 60, label: 'Skilled worker' }]), ['inside']);
});

test('a label that does not fit goes right of its bar when that stretch of the row is free', () => {
  assert.deepEqual(placePeriodLabels([{ left: 10, right: 15, label: 'Pause' }]), ['right']);
  // Not past the end of the axis.
  assert.deepEqual(placePeriodLabels([{ left: 90, right: 95, label: 'Second blockade' }]), ['omitted']);
});

test('a label with neither room is omitted rather than set on a line of its own', () => {
  // The next bar starts straight after this one.
  assert.deepEqual(placePeriodLabels([{ left: 10, right: 15, label: 'First' }, { left: 18, right: 90, label: 'Second blockade' }]), ['omitted', 'inside']);
  // A bar of the same row drawn earlier counts too.
  assert.deepEqual(placePeriodLabels([{ left: 20, right: 80, label: 'Earlier on the list' }, { left: 10, right: 15, label: 'Pause' }]), ['inside', 'omitted']);
});

test('stages drawn over one another: only the part of a bar left showing can hold its label', () => {
  // Bleek's coding: explore from 1939, pursue from 1942, acquire from 1945, none ended, on a 1939–2017 axis.
  const at = (year: number) => ((year - 1939) / 78.5) * 100;
  const bars = [
    { left: at(1939), right: 100, label: 'Explore' },
    { left: at(1942), right: 100, label: 'Pursue' },
    { left: at(1945), right: 100, label: 'Acquire' },
  ];
  assert.deepEqual(placePeriodLabels(bars), ['omitted', 'omitted', 'inside']);
  // Stages that all end together: a label beside the stack would name the last stage drawn, so only it is labelled.
  assert.deepEqual(placePeriodLabels([{ left: 30, right: 40, label: 'Explore' }, { left: 35, right: 40, label: 'Pursue' }]), ['omitted', 'right']);
  // A long first stage shows its label even though a later one covers its end.
  assert.deepEqual(placePeriodLabels([{ left: 0, right: 100, label: 'Explore' }, { left: 50, right: 100, label: 'Pursue' }]), ['inside', 'inside']);
});

test('a bar with no label needs no room', () => {
  assert.deepEqual(placePeriodLabels([{ left: 0, right: 1, label: '' }]), ['none']);
});
