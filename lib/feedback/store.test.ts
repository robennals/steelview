import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { createTestDb } from '@/lib/db/test-db';
import { cruxComments, suggestions, users } from '@/lib/db/schema';
import type { DB } from '@/lib/db/client';
import {
  addComment,
  addSuggestion,
  addViewpointSuggestion,
  deleteComment,
  deleteSuggestion,
  editComment,
  editSuggestion,
  readReader,
  readTopicFeedback,
  setBacking,
  setReaderName,
  setUseful,
} from './store';

const TOPIC = 'uk-immigration';

async function withReaders(names: (string | null)[]): Promise<{ db: DB; ids: string[] }> {
  const db = await createTestDb();
  const ids = names.map((_, i) => `user-${i}`);
  await db.insert(users).values(names.map((name, i) => ({ id: ids[i], email: `reader${i}@example.com`, name })));
  return { db, ids };
}

test('a suggestion reads back with its author, what it is about, and no backers', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: { index: 2, heading: 'Britain has usually let people finish' }, body: 'Cite the 2008 ruling.', moderation: 'allowed' });
  await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'Open with the proposal.', moderation: 'allowed' });

  const { suggestions: byViewpoint } = await readTopicFeedback(db, TOPIC, null);
  const [card, whole] = [...byViewpoint['keep-our-word']].sort((a, b) => a.text.localeCompare(b.text));
  assert.deepEqual(card.about, { kind: 'card', card: 2, heading: 'Britain has usually let people finish' });
  assert.deepEqual(whole.about, { kind: 'whole' });
  assert.equal(card.author, 'Alice');
  assert.equal(card.status, 'open');
  assert.equal(card.backers, 0);
  assert.equal(card.backed, false);
});

test('feedback on another topic is not read', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  await addSuggestion(db, { userId: alice, topicSlug: 'uk-asylum', viewpointId: 'refuge', card: null, body: 'Elsewhere.', moderation: 'allowed' });
  assert.deepEqual(await readTopicFeedback(db, TOPIC, alice), { suggestions: {}, discussions: {} });
});

test('backing counts each reader once, shows the reader their own backing, and can be withdrawn', async () => {
  const { db, ids: [alice, bob] } = await withReaders(['Alice', 'Bob']);
  const { id } = await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'x', moderation: 'allowed' });
  assert.equal(await setBacking(db, { userId: bob, topicSlug: TOPIC, suggestionId: id, backed: true }), true);
  await setBacking(db, { userId: bob, topicSlug: TOPIC, suggestionId: id, backed: true });
  await setBacking(db, { userId: alice, topicSlug: TOPIC, suggestionId: id, backed: true });

  let [shown] = (await readTopicFeedback(db, TOPIC, bob)).suggestions['keep-our-word'];
  assert.equal(shown.backers, 2);
  assert.equal(shown.backed, true);

  await setBacking(db, { userId: bob, topicSlug: TOPIC, suggestionId: id, backed: false });
  [shown] = (await readTopicFeedback(db, TOPIC, bob)).suggestions['keep-our-word'];
  assert.equal(shown.backers, 1);
  assert.equal(shown.backed, false);
});

test('only an open suggestion on the same topic can be backed', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const { id } = await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'x', moderation: 'allowed' });
  assert.equal(await setBacking(db, { userId: alice, topicSlug: 'uk-asylum', suggestionId: id, backed: true }), false);
  await db.update(suggestions).set({ status: 'incorporated' }).where(eq(suggestions.id, id));
  assert.equal(await setBacking(db, { userId: alice, topicSlug: TOPIC, suggestionId: id, backed: true }), false);
});

test('an answered suggestion carries the editor’s reply, and a hidden one is not shown', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const answered = await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'a', moderation: 'allowed' });
  const hidden = await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'b', moderation: 'allowed' });
  await db.update(suggestions).set({ status: 'answered', answer: 'Covered at card 4.' }).where(eq(suggestions.id, answered.id));
  await db.update(suggestions).set({ hiddenAt: new Date() }).where(eq(suggestions.id, hidden.id));

  const shown = (await readTopicFeedback(db, TOPIC, null)).suggestions['keep-our-word'];
  assert.equal(shown.length, 1);
  assert.equal(shown[0].status, 'answered');
  assert.equal(shown[0].answer, 'Covered at card 4.');
});

test('a reply sits under its comment, in the order written, and useful marks count each reader once', async () => {
  const { db, ids: [alice, bob] } = await withReaders(['Alice', 'Bob']);
  const comment = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'will-recent-arrivals-integrate', parentId: null, body: 'Is there a survey?', moderation: 'allowed' });
  assert.ok(comment);
  await addComment(db, { userId: bob, topicSlug: TOPIC, cruxId: 'will-recent-arrivals-integrate', parentId: comment.id, body: 'Only the census.', moderation: 'allowed' });
  await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'will-recent-arrivals-integrate', parentId: comment.id, body: 'Thanks.', moderation: 'allowed' });
  await setUseful(db, { userId: bob, topicSlug: TOPIC, commentId: comment.id, useful: true });
  await setUseful(db, { userId: bob, topicSlug: TOPIC, commentId: comment.id, useful: true });

  const [shown] = (await readTopicFeedback(db, TOPIC, bob)).discussions['will-recent-arrivals-integrate'];
  assert.equal(shown.author, 'Alice');
  assert.equal(shown.useful, 1);
  assert.equal(shown.markedUseful, true);
  assert.deepEqual(shown.replies.map(r => [r.author, r.text]), [['Bob', 'Only the census.'], ['Alice', 'Thanks.']]);

  await setUseful(db, { userId: bob, topicSlug: TOPIC, commentId: comment.id, useful: false });
  assert.equal((await readTopicFeedback(db, TOPIC, bob)).discussions['will-recent-arrivals-integrate'][0].useful, 0);
});

test('a reply must be to a comment, not a reply, in the same discussion', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const comment = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: null, body: 'a', moderation: 'allowed' });
  assert.ok(comment);
  const reply = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: comment.id, body: 'b', moderation: 'allowed' });
  assert.ok(reply);
  assert.equal(await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: reply.id, body: 'c', moderation: 'allowed' }), null);
  assert.equal(await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'another-crux', parentId: comment.id, body: 'd', moderation: 'allowed' }), null);
});

test('replies to a hidden comment go with it', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const comment = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: null, body: 'a', moderation: 'allowed' });
  assert.ok(comment);
  await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: comment.id, body: 'b', moderation: 'allowed' });
  await db.update(cruxComments).set({ hiddenAt: new Date() }).where(eq(cruxComments.id, comment.id));
  assert.deepEqual(await readTopicFeedback(db, TOPIC, null), { suggestions: {}, discussions: {} });
});

test('a reader has no name until they set one', async () => {
  const { db, ids: [nameless] } = await withReaders([null]);
  assert.deepEqual(await readReader(db, nameless), { name: null });
  await setReaderName(db, nameless, 'Sam');
  assert.deepEqual(await readReader(db, nameless), { name: 'Sam' });
  assert.equal(await readReader(db, 'no-such-user'), null);
});

test('a suggested viewpoint is stored for editors', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const { id } = await addViewpointSuggestion(db, { userId: alice, topicSlug: TOPIC, title: 'A view', steps: 'One\nTwo', holders: null, moderation: 'allowed' });
  assert.match(id, /^[0-9a-f-]{36}$/);
});

test('a writer can edit their own open suggestion, which then reads as edited and theirs', async () => {
  const { db, ids: [alice, bob] } = await withReaders(['Alice', 'Bob']);
  const { id } = await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'First draft.', moderation: 'allowed' });
  assert.equal(await editSuggestion(db, { userId: bob, topicSlug: TOPIC, id, body: 'Not mine.', moderation: 'allowed' }), false);
  assert.equal(await editSuggestion(db, { userId: alice, topicSlug: TOPIC, id, body: 'Second draft.', moderation: 'allowed' }), true);

  const [asAlice] = (await readTopicFeedback(db, TOPIC, alice)).suggestions['keep-our-word'];
  assert.equal(asAlice.text, 'Second draft.');
  assert.equal(asAlice.edited, true);
  assert.equal(asAlice.mine, true);
  assert.equal((await readTopicFeedback(db, TOPIC, bob)).suggestions['keep-our-word'][0].mine, false);
});

test('a suggestion an editor has dealt with can be deleted by its writer but not edited', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const { id } = await addSuggestion(db, { userId: alice, topicSlug: TOPIC, viewpointId: 'keep-our-word', card: null, body: 'x', moderation: 'allowed' });
  await db.update(suggestions).set({ status: 'incorporated' }).where(eq(suggestions.id, id));
  assert.equal(await editSuggestion(db, { userId: alice, topicSlug: TOPIC, id, body: 'y', moderation: 'allowed' }), false);
  assert.equal(await deleteSuggestion(db, { userId: alice, topicSlug: 'uk-asylum', id }), false);
  assert.equal(await deleteSuggestion(db, { userId: alice, topicSlug: TOPIC, id }), true);
  assert.deepEqual(await readTopicFeedback(db, TOPIC, alice), { suggestions: {}, discussions: {} });
});

test('a writer can edit their own comment or reply, and no one else can', async () => {
  const { db, ids: [alice, bob] } = await withReaders(['Alice', 'Bob']);
  const comment = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: null, body: 'a', moderation: 'allowed' });
  assert.ok(comment);
  const reply = await addComment(db, { userId: bob, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: comment.id, body: 'b', moderation: 'allowed' });
  assert.ok(reply);
  assert.equal(await editComment(db, { userId: bob, topicSlug: TOPIC, id: comment.id, body: 'hijack', moderation: 'allowed' }), false);
  assert.equal(await editComment(db, { userId: bob, topicSlug: TOPIC, id: reply.id, body: 'b, rethought', moderation: 'allowed' }), true);

  const [shown] = (await readTopicFeedback(db, TOPIC, bob)).discussions['growth-or-continuity'];
  assert.equal(shown.text, 'a');
  assert.equal(shown.mine, false);
  assert.deepEqual([shown.replies[0].text, shown.replies[0].edited, shown.replies[0].mine], ['b, rethought', true, true]);
});

test('deleting a comment with replies empties it and keeps the replies; once they go, it goes', async () => {
  const { db, ids: [alice, bob] } = await withReaders(['Alice', 'Bob']);
  const comment = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: null, body: 'a', moderation: 'allowed' });
  assert.ok(comment);
  const reply = await addComment(db, { userId: bob, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: comment.id, body: 'b', moderation: 'allowed' });
  assert.ok(reply);
  assert.equal(await deleteComment(db, { userId: bob, topicSlug: TOPIC, id: comment.id }), false);
  assert.equal(await deleteComment(db, { userId: alice, topicSlug: TOPIC, id: comment.id }), true);

  const [shown] = (await readTopicFeedback(db, TOPIC, alice)).discussions['growth-or-continuity'];
  assert.deepEqual([shown.deleted, shown.text, shown.author, shown.mine], [true, '', '', false]);
  assert.equal(shown.replies[0].text, 'b');
  // No new replies, marks or edits on a deleted comment.
  assert.equal(await addComment(db, { userId: bob, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: comment.id, body: 'c', moderation: 'allowed' }), null);
  assert.equal(await setUseful(db, { userId: bob, topicSlug: TOPIC, commentId: comment.id, useful: true }), false);
  assert.equal(await editComment(db, { userId: alice, topicSlug: TOPIC, id: comment.id, body: 'back', moderation: 'allowed' }), false);

  assert.equal(await deleteComment(db, { userId: bob, topicSlug: TOPIC, id: reply.id }), true);
  assert.deepEqual(await readTopicFeedback(db, TOPIC, alice), { suggestions: {}, discussions: {} });
});

test('deleting a comment with no replies removes it', async () => {
  const { db, ids: [alice] } = await withReaders(['Alice']);
  const comment = await addComment(db, { userId: alice, topicSlug: TOPIC, cruxId: 'growth-or-continuity', parentId: null, body: 'a', moderation: 'allowed' });
  assert.ok(comment);
  assert.equal(await deleteComment(db, { userId: alice, topicSlug: TOPIC, id: comment.id }), true);
  assert.equal((await db.select().from(cruxComments)).length, 0);
});
