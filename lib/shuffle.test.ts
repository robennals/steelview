import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffledOrder } from './shuffle';

test('a shuffled order holds each index once', () => {
  for (let count = 0; count < 6; count++) {
    assert.deepEqual([...shuffledOrder(count)].sort((a, b) => a - b), Array.from({ length: count }, (_, i) => i));
  }
});

test('a new shuffle never repeats the order it replaces', () => {
  for (let run = 0; run < 200; run++) {
    const current = shuffledOrder(2);
    assert.notDeepEqual(shuffledOrder(2, current), current);
  }
});

test('every order can come up', () => {
  const seen = new Set<string>();
  for (let run = 0; run < 500; run++) seen.add(shuffledOrder(3).join());
  assert.equal(seen.size, 6);
});
