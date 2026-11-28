import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inOpeningOrder } from './order';

const ids = (items: { id: string }[]) => items.map(item => item.id);

test('items keep the order they were ranked in when the list opened', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(ids(inOpeningOrder(items, ['c', 'a', 'b'])), ['c', 'a', 'b']);
});

test('anything added since the list opened goes on top, newest order kept', () => {
  const items = [{ id: 'new1' }, { id: 'a' }, { id: 'new2' }, { id: 'b' }];
  assert.deepEqual(ids(inOpeningOrder(items, ['b', 'a'])), ['new1', 'new2', 'b', 'a']);
});

test('an item gone since the list opened is dropped, not left as a gap', () => {
  assert.deepEqual(ids(inOpeningOrder([{ id: 'a' }], ['b', 'a'])), ['a']);
});

test('the items themselves are returned, with their latest state', () => {
  const fresh = { id: 'a', backers: 3 };
  assert.equal(inOpeningOrder([fresh], ['a'])[0], fresh);
});
