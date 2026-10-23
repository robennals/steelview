import { test } from 'node:test';
import assert from 'node:assert/strict';
import { headlineFacts, rankFacts, supportingFactsByParent } from './rank-facts';
import type { Fact, FactStatus } from './types';

function fact(id: string, status: FactStatus = 'well-supported', supports?: string): Fact {
  return { id, claim: id, status, sources: [], body: '', ...(supports ? { supports } : {}) };
}

test('headline Data follows the explicit topic order', () => {
  const facts = [fact('a'), fact('b'), fact('c')];
  assert.deepEqual(rankFacts(facts, ['c', 'a', 'b']).map((item) => item.id), ['c', 'a', 'b']);
});

test('unlisted Data forms a status-ordered tail while the validator reports the omission', () => {
  const facts = [fact('a'), fact('b', 'contested'), fact('c', 'unknown')];
  assert.deepEqual(rankFacts(facts, ['a']).map((item) => item.id), ['a', 'b', 'c']);
});

test('supporting Data follows its parent without becoming a top-level collection', () => {
  const facts = [fact('parent'), fact('child', 'well-supported', 'parent'), fact('other')];
  assert.deepEqual(rankFacts(facts, ['other', 'parent']).map((item) => item.id), ['other', 'parent', 'child']);
  assert.deepEqual(headlineFacts(rankFacts(facts, ['other', 'parent'])).map((item) => item.id), ['other', 'parent']);
  assert.deepEqual(supportingFactsByParent(facts).get('parent')?.map((item) => item.id), ['child']);
});
