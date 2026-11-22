import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { DB } from '@/lib/db/client';
import { commentUseful, cruxComments, suggestionBackers, suggestions, users, viewpointSuggestions } from '@/lib/db/schema';
import type { CruxComment, Reader, Suggestion, TopicFeedback } from './types';
import type { MODERATION_RESULTS } from '@/lib/db/schema';

/** What the moderation check said about a post that is going up. */
export type ModerationResult = (typeof MODERATION_RESULTS)[number];

/*
 * Reading and writing reader feedback. Each function takes the database, so
 * tests run them against an in-process Postgres. Callers check first that
 * what a write is about exists in the topic's content (./targets.ts).
 */

/** The name shown for a reader who has none yet, which can only be someone whose rows predate the rule that posting needs one. */
const NAMELESS = 'A reader';

/** The longest suggestion, comment or reply, in characters. */
export const MAX_TEXT = 4000;

/** Every visible suggestion and comment on a topic, marked with what `readerId` has backed or found useful. */
export async function readTopicFeedback(db: DB, topicSlug: string, readerId: string | null): Promise<TopicFeedback> {
  const suggestionRows = await db
    .select({ suggestion: suggestions, author: users.name })
    .from(suggestions)
    .innerJoin(users, eq(users.id, suggestions.userId))
    .where(and(eq(suggestions.topicSlug, topicSlug), isNull(suggestions.hiddenAt)));
  const backerRows = suggestionRows.length === 0 ? [] : await db
    .select({ suggestionId: suggestionBackers.suggestionId, userId: suggestionBackers.userId })
    .from(suggestionBackers)
    .where(inArray(suggestionBackers.suggestionId, suggestionRows.map(r => r.suggestion.id)));

  const commentRows = await db
    .select({ comment: cruxComments, author: users.name })
    .from(cruxComments)
    .innerJoin(users, eq(users.id, cruxComments.userId))
    .where(and(eq(cruxComments.topicSlug, topicSlug), isNull(cruxComments.hiddenAt)));
  const usefulRows = commentRows.length === 0 ? [] : await db
    .select({ commentId: commentUseful.commentId, userId: commentUseful.userId })
    .from(commentUseful)
    .where(inArray(commentUseful.commentId, commentRows.map(r => r.comment.id)));

  const feedback: TopicFeedback = { suggestions: {}, discussions: {} };

  for (const { suggestion: s, author } of suggestionRows) {
    const backers = backerRows.filter(b => b.suggestionId === s.id);
    const shown: Suggestion = {
      id: s.id,
      about: s.card === null ? { kind: 'whole' } : { kind: 'card', card: s.card, heading: s.cardHeading ?? '' },
      text: s.body,
      author: author ?? NAMELESS,
      date: s.createdAt.toISOString(),
      backers: backers.length,
      backed: backers.some(b => b.userId === readerId),
      mine: s.userId === readerId,
      edited: s.editedAt !== null,
      status: s.status,
      ...(s.answer ? { answer: s.answer } : {}),
    };
    (feedback.suggestions[s.viewpointId] ??= []).push(shown);
  }

  // Comments first, so every reply finds its comment; a reply to a hidden comment goes with it.
  const comments = new Map<string, CruxComment>();
  for (const { comment: c, author } of commentRows.filter(r => r.comment.parentId === null)) {
    const useful = usefulRows.filter(u => u.commentId === c.id);
    const deleted = c.deletedAt !== null;
    const shown: CruxComment = {
      id: c.id,
      author: deleted ? '' : author ?? NAMELESS,
      date: c.createdAt.toISOString(),
      text: deleted ? '' : c.body,
      useful: useful.length,
      markedUseful: useful.some(u => u.userId === readerId),
      mine: !deleted && c.userId === readerId,
      edited: c.editedAt !== null,
      deleted,
      replies: [],
    };
    comments.set(c.id, shown);
    (feedback.discussions[c.cruxId] ??= []).push(shown);
  }
  for (const { comment: c, author } of commentRows.filter(r => r.comment.parentId !== null).sort((a, b) => a.comment.createdAt.getTime() - b.comment.createdAt.getTime())) {
    comments.get(c.parentId ?? '')?.replies.push({
      id: c.id,
      author: author ?? NAMELESS,
      date: c.createdAt.toISOString(),
      text: c.body,
      mine: c.userId === readerId,
      edited: c.editedAt !== null,
    });
  }
  // A deleted comment stays only while replies need it.
  for (const [cruxId, discussion] of Object.entries(feedback.discussions)) {
    const kept = discussion.filter(c => !c.deleted || c.replies.length > 0);
    if (kept.length > 0) feedback.discussions[cruxId] = kept;
    else delete feedback.discussions[cruxId];
  }
  return feedback;
}

/** The signed-in reader, or null if their account has gone. */
export async function readReader(db: DB, userId: string): Promise<Reader | null> {
  const [row] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  return row ? { name: row.name } : null;
}

/** Sets the name shown with what a reader writes. */
export async function setReaderName(db: DB, userId: string, name: string): Promise<void> {
  await db.update(users).set({ name }).where(eq(users.id, userId));
}

export type NewSuggestion = {
  userId: string;
  topicSlug: string;
  viewpointId: string;
  /** The card it is about, with its heading as it reads now; null for the whole case. */
  card: { index: number; heading: string } | null;
  body: string;
  moderation: ModerationResult;
};

export async function addSuggestion(db: DB, input: NewSuggestion): Promise<{ id: string }> {
  const [row] = await db.insert(suggestions).values({
    userId: input.userId,
    topicSlug: input.topicSlug,
    viewpointId: input.viewpointId,
    card: input.card?.index ?? null,
    cardHeading: input.card?.heading ?? null,
    body: input.body,
    moderation: input.moderation,
  }).returning({ id: suggestions.id });
  return row;
}

/**
 * Backs a suggestion, or withdraws the backing. Only an open, visible
 * suggestion on this topic can be backed; false if there is none.
 */
export async function setBacking(db: DB, input: { userId: string; topicSlug: string; suggestionId: string; backed: boolean }): Promise<boolean> {
  const [target] = await db.select({ id: suggestions.id }).from(suggestions)
    .where(and(eq(suggestions.id, input.suggestionId), eq(suggestions.topicSlug, input.topicSlug), eq(suggestions.status, 'open'), isNull(suggestions.hiddenAt)))
    .limit(1);
  if (!target) return false;
  const mine = and(eq(suggestionBackers.suggestionId, target.id), eq(suggestionBackers.userId, input.userId));
  if (input.backed) await db.insert(suggestionBackers).values({ suggestionId: target.id, userId: input.userId }).onConflictDoNothing();
  else await db.delete(suggestionBackers).where(mine);
  return true;
}

export type NewComment = {
  userId: string;
  topicSlug: string;
  cruxId: string;
  /** The comment this replies to, for a reply. */
  parentId: string | null;
  body: string;
  moderation: ModerationResult;
};

/**
 * Adds a comment to a crux's discussion, or a reply to one of its comments.
 * A reply must be to a visible comment, not a reply, in the same discussion;
 * null if it is not.
 */
export async function addComment(db: DB, input: NewComment): Promise<{ id: string } | null> {
  if (input.parentId) {
    const [parent] = await db.select({ id: cruxComments.id }).from(cruxComments)
      .where(and(
        eq(cruxComments.id, input.parentId),
        eq(cruxComments.topicSlug, input.topicSlug),
        eq(cruxComments.cruxId, input.cruxId),
        isNull(cruxComments.parentId),
        isNull(cruxComments.hiddenAt),
        isNull(cruxComments.deletedAt),
      ))
      .limit(1);
    if (!parent) return null;
  }
  const [row] = await db.insert(cruxComments).values(input).returning({ id: cruxComments.id });
  return row;
}

/** Marks a comment useful, or unmarks it. Only a visible comment on this topic counts; false if there is none. */
export async function setUseful(db: DB, input: { userId: string; topicSlug: string; commentId: string; useful: boolean }): Promise<boolean> {
  const [target] = await db.select({ id: cruxComments.id }).from(cruxComments)
    .where(and(eq(cruxComments.id, input.commentId), eq(cruxComments.topicSlug, input.topicSlug), isNull(cruxComments.hiddenAt), isNull(cruxComments.deletedAt)))
    .limit(1);
  if (!target) return false;
  const mine = and(eq(commentUseful.commentId, target.id), eq(commentUseful.userId, input.userId));
  if (input.useful) await db.insert(commentUseful).values({ commentId: target.id, userId: input.userId }).onConflictDoNothing();
  else await db.delete(commentUseful).where(mine);
  return true;
}

export type NewViewpointSuggestion = { userId: string; topicSlug: string; title: string; steps: string; holders: string | null; moderation: ModerationResult };

export async function addViewpointSuggestion(db: DB, input: NewViewpointSuggestion): Promise<{ id: string }> {
  const [row] = await db.insert(viewpointSuggestions).values(input).returning({ id: viewpointSuggestions.id });
  return row;
}

/** Which of a reader's own posts a write is about. */
type OwnPost = { userId: string; topicSlug: string; id: string };

/**
 * The reader's own suggestion, while they may still change it: it is open
 * and visible. Null if there is no such suggestion of theirs.
 */
export async function ownOpenSuggestion(db: DB, own: OwnPost): Promise<{ viewpointId: string; cardHeading: string | null } | null> {
  const [row] = await db.select({ viewpointId: suggestions.viewpointId, cardHeading: suggestions.cardHeading }).from(suggestions)
    .where(and(eq(suggestions.id, own.id), eq(suggestions.userId, own.userId), eq(suggestions.topicSlug, own.topicSlug), eq(suggestions.status, 'open'), isNull(suggestions.hiddenAt)))
    .limit(1);
  return row ?? null;
}

/** Rewrites the reader's own open suggestion. False if there is none they may change. */
export async function editSuggestion(db: DB, own: OwnPost & { body: string; moderation: ModerationResult }): Promise<boolean> {
  const rows = await db.update(suggestions).set({ body: own.body, moderation: own.moderation, editedAt: new Date() })
    .where(and(eq(suggestions.id, own.id), eq(suggestions.userId, own.userId), eq(suggestions.topicSlug, own.topicSlug), eq(suggestions.status, 'open'), isNull(suggestions.hiddenAt)))
    .returning({ id: suggestions.id });
  return rows.length > 0;
}

/** Deletes the reader's own suggestion, whatever became of it, and its backings with it. False if there is none of theirs. */
export async function deleteSuggestion(db: DB, own: OwnPost): Promise<boolean> {
  const rows = await db.delete(suggestions)
    .where(and(eq(suggestions.id, own.id), eq(suggestions.userId, own.userId), eq(suggestions.topicSlug, own.topicSlug)))
    .returning({ id: suggestions.id });
  return rows.length > 0;
}

/** The reader's own comment or reply, while it is visible and not deleted. Null if there is no such post of theirs. */
export async function ownLiveComment(db: DB, own: OwnPost): Promise<{ cruxId: string; parentId: string | null } | null> {
  const [row] = await db.select({ cruxId: cruxComments.cruxId, parentId: cruxComments.parentId }).from(cruxComments)
    .where(and(eq(cruxComments.id, own.id), eq(cruxComments.userId, own.userId), eq(cruxComments.topicSlug, own.topicSlug), isNull(cruxComments.hiddenAt), isNull(cruxComments.deletedAt)))
    .limit(1);
  return row ?? null;
}

/** Rewrites the reader's own comment or reply. False if there is none they may change. */
export async function editComment(db: DB, own: OwnPost & { body: string; moderation: ModerationResult }): Promise<boolean> {
  const rows = await db.update(cruxComments).set({ body: own.body, moderation: own.moderation, editedAt: new Date() })
    .where(and(eq(cruxComments.id, own.id), eq(cruxComments.userId, own.userId), eq(cruxComments.topicSlug, own.topicSlug), isNull(cruxComments.hiddenAt), isNull(cruxComments.deletedAt)))
    .returning({ id: cruxComments.id });
  return rows.length > 0;
}

/**
 * Deletes the reader's own comment or reply. A comment others have replied
 * to is emptied and marked deleted instead, so their replies keep their
 * place. False if there is no such post of theirs.
 */
export async function deleteComment(db: DB, own: OwnPost): Promise<boolean> {
  const mine = and(eq(cruxComments.id, own.id), eq(cruxComments.userId, own.userId), eq(cruxComments.topicSlug, own.topicSlug), isNull(cruxComments.deletedAt));
  const [target] = await db.select({ id: cruxComments.id }).from(cruxComments).where(mine).limit(1);
  if (!target) return false;
  const [reply] = await db.select({ id: cruxComments.id }).from(cruxComments).where(eq(cruxComments.parentId, target.id)).limit(1);
  if (reply) await db.update(cruxComments).set({ body: '', deletedAt: new Date() }).where(mine);
  else await db.delete(cruxComments).where(mine);
  return true;
}
