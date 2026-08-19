import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greeting } from './smoke';

test('the test runner is wired up', () => {
  assert.equal(greeting(), 'steelview');
});
