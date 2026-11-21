import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moderate, type ModerationCall, type Post } from './moderate';

const post: Post = { kind: 'a comment in a discussion', topic: 'UK immigration', about: 'Prosperity and a shared way of life', text: 'A point.' };

/** A stand-in for the API that answers as given. */
const answering = (answer: Awaited<ReturnType<ModerationCall>>): ModerationCall => async () => answer;

test('an allowed post goes up as allowed', async () => {
  assert.deepEqual(await moderate(post, answering({ stopReason: 'end_turn', verdict: { allowed: true, reason: '' } })), { verdict: 'allowed' });
});

test('a blocked post carries the reason the writer sees', async () => {
  const result = await moderate(post, answering({ stopReason: 'end_turn', verdict: { allowed: false, reason: ' Please remove the insult. ' } }));
  assert.deepEqual(result, { verdict: 'blocked', reason: 'Please remove the insult.' });
});

test('a block with no reason still tells the writer why', async () => {
  const result = await moderate(post, answering({ stopReason: 'end_turn', verdict: { allowed: false, reason: '' } }));
  assert.equal(result.verdict, 'blocked');
  assert.ok(result.verdict === 'blocked' && result.reason.length > 0);
});

test('if the check cannot run or cannot be read, the post goes up unchecked rather than being lost', async () => {
  const failing: ModerationCall = async () => { throw new Error('timeout'); };
  const original = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await moderate(post, failing), { verdict: 'unchecked' });
  } finally {
    console.error = original;
  }
  assert.deepEqual(await moderate(post, answering({ stopReason: 'refusal', verdict: null })), { verdict: 'unchecked' });
  assert.deepEqual(await moderate(post, answering({ stopReason: 'max_tokens', verdict: null })), { verdict: 'unchecked' });
});
