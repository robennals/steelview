import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { createTestDb } from '@/lib/db/test-db';
import { cruxComments, rateLimits, suggestions, users, viewpointSuggestions } from '@/lib/db/schema';
import type { FeedbackDeps } from './deps';
import {
  accountNameRoute,
  backingRoute,
  commentRoute,
  cruxCommentsRoute,
  suggestionRoute,
  topicFeedbackRoute,
  usefulRoute,
  viewpointSuggestionRoute,
  viewpointSuggestionsRoute,
} from './handlers';
import type { Moderation, Post } from './moderate';
import { feedbackTargets } from './targets';
import type { TopicFeedbackResponse } from './types';

/*
 * The feedback routes against an in-process Postgres, with sign-in and the
 * moderation check stood in for. Viewpoint, card and crux ids come from the
 * topic's content as it is now, so editing the topic does not break these.
 */

const TOPIC = 'uk-immigration';
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

async function topicIds() {
  const targets = await feedbackTargets(TOPIC);
  assert.ok(targets);
  const [[viewpointId, viewpoint]] = [...targets.viewpoints];
  const [[cruxId, cruxTitle]] = [...targets.cruxes];
  return { targets, viewpointId, viewpoint, cruxId, cruxTitle };
}

/** A database with three readers (two named, one not), signed in as `alice`, with every post allowed. */
async function site(options: { isAuthConfigured?: boolean } = {}) {
  const db = await createTestDb();
  await db.insert(users).values([
    { id: 'alice', email: 'alice@example.com', name: 'Alice' },
    { id: 'bob', email: 'bob@example.com', name: 'Bob' },
    { id: 'nameless', email: 'nameless@example.com', name: null },
  ]);
  const state: { signedIn: string | null; verdict: Moderation; checked: Post[] } = { signedIn: 'alice', verdict: { verdict: 'allowed' }, checked: [] };
  const deps: FeedbackDeps = {
    db,
    isAuthConfigured: options.isAuthConfigured ?? true,
    currentUserId: async () => state.signedIn,
    moderate: async post => {
      state.checked.push(post);
      return state.verdict;
    },
  };
  return {
    db,
    state,
    as(userId: string | null) {
      state.signedIn = userId;
    },
    routes: {
      accountName: accountNameRoute(deps),
      feedback: topicFeedbackRoute(deps),
      viewpointSuggestions: viewpointSuggestionsRoute(deps),
      suggest: viewpointSuggestionRoute(deps),
      suggestion: suggestionRoute(deps),
      backing: backingRoute(deps),
      comments: cruxCommentsRoute(deps),
      comment: commentRoute(deps),
      useful: usefulRoute(deps),
    },
  };
}

type Site = Awaited<ReturnType<typeof site>>;

const request = (payload?: unknown) => new Request('http://localhost/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: payload === undefined ? undefined : typeof payload === 'string' ? payload : JSON.stringify(payload),
});
const context = <T>(params: T) => ({ params: Promise.resolve(params) });

async function assertFailure(response: Response, status: number, error: string) {
  assert.equal(response.status, status);
  assert.deepEqual(await response.json(), { error });
}

async function readFeedback(s: Site): Promise<TopicFeedbackResponse> {
  const response = await s.routes.feedback.GET(request(), context({ slug: TOPIC }));
  assert.equal(response.status, 200);
  return response.json();
}

async function postSuggestion(s: Site, viewpointId: string, payload: unknown) {
  return s.routes.suggest.POST(request(payload), context({ slug: TOPIC, viewpointId }));
}

async function addSuggestion(s: Site, text = 'Cite the ruling.'): Promise<string> {
  const { viewpointId } = await topicIds();
  const response = await postSuggestion(s, viewpointId, { text, card: null });
  assert.equal(response.status, 201);
  return (await response.json()).id;
}

async function addComment(s: Site, text: string, parentId: string | null = null): Promise<string> {
  const { cruxId } = await topicIds();
  const response = await s.routes.comments.POST(request({ text, parentId }), context({ slug: TOPIC, cruxId }));
  assert.equal(response.status, 201);
  return (await response.json()).id;
}

// Every write is checked against the topic and against who is writing.

test('with sign-in switched off, every feedback route answers 503', async () => {
  const s = await site({ isAuthConfigured: false });
  const { viewpointId, cruxId } = await topicIds();
  await assertFailure(await s.routes.feedback.GET(request(), context({ slug: TOPIC })), 503, 'not_configured');
  await assertFailure(await s.routes.accountName.PUT(request({ name: 'Al' })), 503, 'not_configured');
  await assertFailure(await postSuggestion(s, viewpointId, { text: 'x', card: null }), 503, 'not_configured');
  await assertFailure(await s.routes.comments.POST(request({ text: 'x', parentId: null }), context({ slug: TOPIC, cruxId })), 503, 'not_configured');
  await assertFailure(await s.routes.backing.PUT(request(), context({ slug: TOPIC, suggestionId: UNKNOWN_ID })), 503, 'not_configured');
});

test('a topic that does not exist is a 404 on every route', async () => {
  const s = await site();
  const slug = 'no-such-topic';
  await assertFailure(await s.routes.feedback.GET(request(), context({ slug })), 404, 'unknown_topic');
  await assertFailure(await s.routes.viewpointSuggestions.POST(request({ title: 'a', steps: 'b', holders: '' }), context({ slug })), 404, 'unknown_topic');
  await assertFailure(await s.routes.suggest.POST(request({ text: 'x', card: null }), context({ slug, viewpointId: 'v' })), 404, 'unknown_topic');
  await assertFailure(await s.routes.suggestion.PATCH(request({ text: 'x' }), context({ slug, suggestionId: UNKNOWN_ID })), 404, 'unknown_topic');
  await assertFailure(await s.routes.suggestion.DELETE(request(), context({ slug, suggestionId: UNKNOWN_ID })), 404, 'unknown_topic');
  await assertFailure(await s.routes.backing.PUT(request(), context({ slug, suggestionId: UNKNOWN_ID })), 404, 'unknown_topic');
  await assertFailure(await s.routes.comments.POST(request({ text: 'x', parentId: null }), context({ slug, cruxId: 'c' })), 404, 'unknown_topic');
  await assertFailure(await s.routes.comment.PATCH(request({ text: 'x' }), context({ slug, commentId: UNKNOWN_ID })), 404, 'unknown_topic');
  await assertFailure(await s.routes.comment.DELETE(request(), context({ slug, commentId: UNKNOWN_ID })), 404, 'unknown_topic');
  await assertFailure(await s.routes.useful.PUT(request(), context({ slug, commentId: UNKNOWN_ID })), 404, 'unknown_topic');
});

test('posting needs a signed-in reader with an account and a name', async () => {
  const s = await site();
  const { viewpointId } = await topicIds();
  s.as(null);
  await assertFailure(await postSuggestion(s, viewpointId, { text: 'x', card: null }), 401, 'unauthorized');
  s.as('deleted-account');
  await assertFailure(await postSuggestion(s, viewpointId, { text: 'x', card: null }), 401, 'unauthorized');
  s.as('nameless');
  await assertFailure(await postSuggestion(s, viewpointId, { text: 'x', card: null }), 403, 'name_required');
  assert.equal((await s.db.select().from(suggestions)).length, 0);
});

test('backing a suggestion and marking a comment useful need sign-in but not a name', async () => {
  const s = await site();
  const suggestionId = await addSuggestion(s);
  const commentId = await addComment(s, 'A comment.');
  s.as(null);
  await assertFailure(await s.routes.backing.PUT(request(), context({ slug: TOPIC, suggestionId })), 401, 'unauthorized');
  await assertFailure(await s.routes.useful.PUT(request(), context({ slug: TOPIC, commentId })), 401, 'unauthorized');

  s.as('nameless');
  assert.equal((await s.routes.backing.PUT(request(), context({ slug: TOPIC, suggestionId }))).status, 204);
  assert.equal((await s.routes.useful.PUT(request(), context({ slug: TOPIC, commentId }))).status, 204);
  let feedback = await readFeedback(s);
  const { viewpointId, cruxId } = await topicIds();
  assert.deepEqual([feedback.suggestions[viewpointId][0].backers, feedback.suggestions[viewpointId][0].backed], [1, true]);
  assert.deepEqual([feedback.discussions[cruxId][0].useful, feedback.discussions[cruxId][0].markedUseful], [1, true]);

  assert.equal((await s.routes.backing.DELETE(request(), context({ slug: TOPIC, suggestionId }))).status, 204);
  assert.equal((await s.routes.useful.DELETE(request(), context({ slug: TOPIC, commentId }))).status, 204);
  feedback = await readFeedback(s);
  assert.equal(feedback.suggestions[viewpointId][0].backers, 0);
  assert.equal(feedback.discussions[cruxId][0].useful, 0);
});

test('a reader who has written 60 times in the hour is refused with when to try again', async () => {
  const s = await site();
  const { viewpointId } = await topicIds();
  await s.db.insert(rateLimits).values({ key: 'feedback:alice', count: 60, windowStart: new Date() });
  const response = await postSuggestion(s, viewpointId, { text: 'x', card: null });
  assert.equal(response.status, 429);
  const { error, retryAfterMs } = await response.json();
  assert.equal(error, 'rate_limited');
  assert.ok(retryAfterMs > 0 && retryAfterMs <= 60 * 60 * 1000);

  // The limit is each reader's own.
  s.as('bob');
  assert.equal((await postSuggestion(s, viewpointId, { text: 'x', card: null })).status, 201);
});

test('every write counts towards the hourly limit', async () => {
  const s = await site();
  const suggestionId = await addSuggestion(s);
  await s.routes.backing.PUT(request(), context({ slug: TOPIC, suggestionId }));
  const [row] = await s.db.select().from(rateLimits).where(eq(rateLimits.key, 'feedback:alice'));
  assert.equal(row.count, 2);
});

test('a body of the wrong shape is a 400', async () => {
  const s = await site();
  const { viewpointId, cruxId } = await topicIds();
  for (const payload of ['not json', { card: null }, { text: '   ', card: null }, { text: 'x'.repeat(4001), card: null }, { text: 'x', card: -1 }, { text: 'x', card: 1.5 }]) {
    await assertFailure(await postSuggestion(s, viewpointId, payload), 400, 'invalid_body');
  }
  await assertFailure(await s.routes.comments.POST(request({ text: 'x', parentId: 'not-a-uuid' }), context({ slug: TOPIC, cruxId })), 400, 'invalid_body');
  await assertFailure(await s.routes.viewpointSuggestions.POST(request({ title: '', steps: 'b', holders: '' }), context({ slug: TOPIC })), 400, 'invalid_body');
  await assertFailure(await s.routes.accountName.PUT(request({ name: ' ' })), 400, 'invalid_body');
});

test('a post the check blocks is refused with its reason, and not stored', async () => {
  const s = await site();
  const { viewpointId, cruxId } = await topicIds();
  s.state.verdict = { verdict: 'blocked', reason: 'Leave out the insult.' };
  for (const response of [
    await postSuggestion(s, viewpointId, { text: 'x', card: null }),
    await s.routes.comments.POST(request({ text: 'x', parentId: null }), context({ slug: TOPIC, cruxId })),
    await s.routes.viewpointSuggestions.POST(request({ title: 'a', steps: 'b', holders: '' }), context({ slug: TOPIC })),
  ]) {
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), { error: 'blocked', reason: 'Leave out the insult.' });
  }
  assert.equal((await s.db.select().from(suggestions)).length, 0);
  assert.equal((await s.db.select().from(cruxComments)).length, 0);
  assert.equal((await s.db.select().from(viewpointSuggestions)).length, 0);
});

test('a post the check could not run on goes up marked unchecked', async () => {
  const s = await site();
  s.state.verdict = { verdict: 'unchecked' };
  const id = await addSuggestion(s);
  const [row] = await s.db.select().from(suggestions).where(eq(suggestions.id, id));
  assert.equal(row.moderation, 'unchecked');
});

// Suggestions.

test('a suggestion on a card stores the card’s heading and is checked as about that card', async () => {
  const s = await site();
  const { targets, viewpointId, viewpoint } = await topicIds();
  const last = viewpoint.headings.length - 1;
  const response = await postSuggestion(s, viewpointId, { text: '  Cite the ruling.  ', card: last });
  assert.equal(response.status, 201);
  const { id } = await response.json();

  const [row] = await s.db.select().from(suggestions).where(eq(suggestions.id, id));
  assert.deepEqual([row.userId, row.viewpointId, row.card, row.cardHeading, row.body, row.moderation], ['alice', viewpointId, last, viewpoint.headings[last], 'Cite the ruling.', 'allowed']);
  assert.deepEqual(s.state.checked, [{
    kind: 'a suggestion for strengthening a viewpoint',
    topic: targets.title,
    about: `${viewpoint.name}, the step “${viewpoint.headings[last]}”`,
    text: 'Cite the ruling.',
  }]);
});

test('a suggestion on the whole case is checked as about the viewpoint', async () => {
  const s = await site();
  const { viewpoint } = await topicIds();
  await addSuggestion(s);
  assert.equal(s.state.checked[0].about, viewpoint.name);
});

test('a suggestion on a viewpoint the topic does not have, or a card past its last, is refused', async () => {
  const s = await site();
  const { viewpointId, viewpoint } = await topicIds();
  await assertFailure(await postSuggestion(s, 'no-such-viewpoint', { text: 'x', card: null }), 404, 'unknown_viewpoint');
  await assertFailure(await postSuggestion(s, viewpointId, { text: 'x', card: viewpoint.headings.length }), 400, 'unknown_card');
  assert.equal(s.state.checked.length, 0);
});

test('a writer can edit their own open suggestion; it is checked again and reads as edited', async () => {
  const s = await site();
  const { viewpointId } = await topicIds();
  const suggestionId = await addSuggestion(s, 'First draft.');
  const response = await s.routes.suggestion.PATCH(request({ text: 'Second draft.' }), context({ slug: TOPIC, suggestionId }));
  assert.equal(response.status, 204);
  assert.equal(s.state.checked.at(-1)?.text, 'Second draft.');
  const [shown] = (await readFeedback(s)).suggestions[viewpointId];
  assert.deepEqual([shown.text, shown.edited, shown.mine], ['Second draft.', true, true]);
});

test('an edit the check blocks is refused with its reason, and the suggestion is unchanged', async () => {
  const s = await site();
  const suggestionId = await addSuggestion(s, 'First draft.');
  s.state.verdict = { verdict: 'blocked', reason: 'No ads.' };
  const response = await s.routes.suggestion.PATCH(request({ text: 'Buy now.' }), context({ slug: TOPIC, suggestionId }));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: 'blocked', reason: 'No ads.' });
  const [row] = await s.db.select().from(suggestions).where(eq(suggestions.id, suggestionId));
  assert.deepEqual([row.body, row.editedAt], ['First draft.', null]);
});

test('only its writer can edit or delete a suggestion', async () => {
  const s = await site();
  const suggestionId = await addSuggestion(s);
  s.as('bob');
  await assertFailure(await s.routes.suggestion.PATCH(request({ text: 'Mine now.' }), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
  await assertFailure(await s.routes.suggestion.DELETE(request(), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
  assert.equal((await s.db.select().from(suggestions)).length, 1);
  s.as('alice');
  assert.equal((await s.routes.suggestion.DELETE(request(), context({ slug: TOPIC, suggestionId }))).status, 204);
  assert.equal((await s.db.select().from(suggestions)).length, 0);
});

test('a suggestion an editor has dealt with can no longer be edited or backed, but can be deleted', async () => {
  const s = await site();
  const suggestionId = await addSuggestion(s);
  await s.db.update(suggestions).set({ status: 'answered', answer: 'Covered.' }).where(eq(suggestions.id, suggestionId));
  await assertFailure(await s.routes.suggestion.PATCH(request({ text: 'y' }), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
  await assertFailure(await s.routes.backing.PUT(request(), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
  assert.equal((await s.routes.suggestion.DELETE(request(), context({ slug: TOPIC, suggestionId }))).status, 204);
});

test('a suggestion id that is not a uuid, or names no suggestion, is a 404', async () => {
  const s = await site();
  for (const suggestionId of ['not-a-uuid', UNKNOWN_ID]) {
    await assertFailure(await s.routes.suggestion.PATCH(request({ text: 'x' }), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
    await assertFailure(await s.routes.suggestion.DELETE(request(), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
    await assertFailure(await s.routes.backing.PUT(request(), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
    await assertFailure(await s.routes.backing.DELETE(request(), context({ slug: TOPIC, suggestionId })), 404, 'unknown_suggestion');
  }
});

test('a suggested viewpoint is stored for editors, checked with its steps and who holds it', async () => {
  const s = await site();
  const { targets } = await topicIds();
  const response = await s.routes.viewpointSuggestions.POST(request({ title: 'A view', steps: 'One\nTwo', holders: 'Some economists' }), context({ slug: TOPIC }));
  assert.equal(response.status, 201);
  assert.deepEqual(s.state.checked, [{ kind: 'a viewpoint the page is missing', topic: targets.title, about: 'A view', text: 'One\nTwo\nHeld by: Some economists' }]);

  await s.routes.viewpointSuggestions.POST(request({ title: 'Another', steps: 'Three', holders: '  ' }), context({ slug: TOPIC }));
  assert.equal(s.state.checked[1].text, 'Three');
  const rows = await s.db.select().from(viewpointSuggestions);
  assert.deepEqual(rows.map(r => r.holders).sort(), ['Some economists', null]);
});

// Discussions.

test('a comment and a reply are added to a crux’s discussion, each checked as what it is', async () => {
  const s = await site();
  const { targets, cruxId, cruxTitle } = await topicIds();
  const commentId = await addComment(s, 'Is there a survey?');
  s.as('bob');
  await addComment(s, 'Only the census.', commentId);

  assert.deepEqual(s.state.checked.map(p => [p.kind, p.topic, p.about]), [
    ['a comment in a discussion', targets.title, cruxTitle],
    ['a reply in a discussion', targets.title, cruxTitle],
  ]);
  const [shown] = (await readFeedback(s)).discussions[cruxId];
  assert.deepEqual([shown.author, shown.text, shown.replies.map(r => [r.author, r.text, r.mine])], ['Alice', 'Is there a survey?', [['Bob', 'Only the census.', true]]]);
});

test('a comment on a crux the topic does not have, or a reply to no comment, is a 404', async () => {
  const s = await site();
  const { cruxId } = await topicIds();
  await assertFailure(await s.routes.comments.POST(request({ text: 'x', parentId: null }), context({ slug: TOPIC, cruxId: 'no-such-crux' })), 404, 'unknown_crux');
  await assertFailure(await s.routes.comments.POST(request({ text: 'x', parentId: UNKNOWN_ID }), context({ slug: TOPIC, cruxId })), 404, 'unknown_comment');
  assert.equal((await s.db.select().from(cruxComments)).length, 0);
});

test('a writer can edit their own comment or reply; it is checked again and reads as edited', async () => {
  const s = await site();
  const { cruxId, cruxTitle } = await topicIds();
  const commentId = await addComment(s, 'a');
  s.as('bob');
  const replyId = await addComment(s, 'b', commentId);

  assert.equal((await s.routes.comment.PATCH(request({ text: 'b, rethought' }), context({ slug: TOPIC, commentId: replyId }))).status, 204);
  assert.deepEqual(s.state.checked.at(-1), { kind: 'a reply in a discussion', topic: (await topicIds()).targets.title, about: cruxTitle, text: 'b, rethought' });
  s.as('alice');
  assert.equal((await s.routes.comment.PATCH(request({ text: 'a, rethought' }), context({ slug: TOPIC, commentId }))).status, 204);
  assert.equal(s.state.checked.at(-1)?.kind, 'a comment in a discussion');

  const [shown] = (await readFeedback(s)).discussions[cruxId];
  assert.deepEqual([shown.text, shown.edited], ['a, rethought', true]);
  assert.deepEqual([shown.replies[0].text, shown.replies[0].edited], ['b, rethought', true]);
});

test('an edit to a comment the check blocks is refused with its reason, and the comment is unchanged', async () => {
  const s = await site();
  const commentId = await addComment(s, 'a');
  s.state.verdict = { verdict: 'blocked', reason: 'Stay on topic.' };
  const response = await s.routes.comment.PATCH(request({ text: 'off topic' }), context({ slug: TOPIC, commentId }));
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: 'blocked', reason: 'Stay on topic.' });
  const [row] = await s.db.select().from(cruxComments).where(eq(cruxComments.id, commentId));
  assert.deepEqual([row.body, row.editedAt], ['a', null]);
});

test('only its writer can edit or delete a comment', async () => {
  const s = await site();
  const commentId = await addComment(s, 'a');
  s.as('bob');
  await assertFailure(await s.routes.comment.PATCH(request({ text: 'hijack' }), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
  await assertFailure(await s.routes.comment.DELETE(request(), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
  s.as('alice');
  assert.equal((await s.routes.comment.DELETE(request(), context({ slug: TOPIC, commentId }))).status, 204);
  assert.equal((await s.db.select().from(cruxComments)).length, 0);
});

test('a deleted comment with replies is kept, empty, so its replies keep their place, and can no longer be edited', async () => {
  const s = await site();
  const { cruxId } = await topicIds();
  const commentId = await addComment(s, 'a');
  s.as('bob');
  await addComment(s, 'b', commentId);
  s.as('alice');
  assert.equal((await s.routes.comment.DELETE(request(), context({ slug: TOPIC, commentId }))).status, 204);

  const [shown] = (await readFeedback(s)).discussions[cruxId];
  assert.deepEqual([shown.id, shown.deleted, shown.text, shown.author, shown.mine], [commentId, true, '', '', false]);
  assert.equal(shown.replies[0].text, 'b');
  await assertFailure(await s.routes.comment.PATCH(request({ text: 'back' }), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
  await assertFailure(await s.routes.comment.DELETE(request(), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
  await assertFailure(await s.routes.useful.PUT(request(), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
});

test('a comment id that is not a uuid, or names no comment, is a 404', async () => {
  const s = await site();
  for (const commentId of ['not-a-uuid', UNKNOWN_ID]) {
    await assertFailure(await s.routes.comment.PATCH(request({ text: 'x' }), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
    await assertFailure(await s.routes.comment.DELETE(request(), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
    await assertFailure(await s.routes.useful.PUT(request(), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
    await assertFailure(await s.routes.useful.DELETE(request(), context({ slug: TOPIC, commentId })), 404, 'unknown_comment');
  }
});

test('a post on one topic cannot be changed through another', async () => {
  const s = await site();
  const suggestionId = await addSuggestion(s);
  const commentId = await addComment(s, 'a');
  const other = 'uk-asylum';
  assert.ok(await feedbackTargets(other));
  await assertFailure(await s.routes.suggestion.PATCH(request({ text: 'x' }), context({ slug: other, suggestionId })), 404, 'unknown_suggestion');
  await assertFailure(await s.routes.suggestion.DELETE(request(), context({ slug: other, suggestionId })), 404, 'unknown_suggestion');
  await assertFailure(await s.routes.backing.PUT(request(), context({ slug: other, suggestionId })), 404, 'unknown_suggestion');
  await assertFailure(await s.routes.comment.PATCH(request({ text: 'x' }), context({ slug: other, commentId })), 404, 'unknown_comment');
  await assertFailure(await s.routes.comment.DELETE(request(), context({ slug: other, commentId })), 404, 'unknown_comment');
  await assertFailure(await s.routes.useful.PUT(request(), context({ slug: other, commentId })), 404, 'unknown_comment');
});

// Reading feedback, and the reader's name.

test('the topic’s feedback comes with who is reading it, and is never cached', async () => {
  const s = await site();
  const { viewpointId } = await topicIds();
  await addSuggestion(s);

  const response = await s.routes.feedback.GET(request(), context({ slug: TOPIC }));
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  const asAlice: TopicFeedbackResponse = await response.json();
  assert.deepEqual(asAlice.reader, { name: 'Alice' });
  assert.equal(asAlice.suggestions[viewpointId][0].mine, true);

  s.as(null);
  const signedOut = await readFeedback(s);
  assert.equal(signedOut.reader, null);
  assert.equal(signedOut.suggestions[viewpointId][0].mine, false);
});

test('a signed-in reader can set the name they post under, and then post', async () => {
  const s = await site();
  const { viewpointId } = await topicIds();
  s.as(null);
  await assertFailure(await s.routes.accountName.PUT(request({ name: 'Sam' })), 401, 'unauthorized');

  s.as('nameless');
  assert.equal((await s.routes.accountName.PUT(request({ name: '  Sam  ' }))).status, 204);
  assert.deepEqual((await readFeedback(s)).reader, { name: 'Sam' });
  assert.equal((await postSuggestion(s, viewpointId, { text: 'x', card: null })).status, 201);
});
