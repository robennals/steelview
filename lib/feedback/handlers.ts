import { z } from 'zod';
import type { FeedbackDeps } from './deps';
import {
  addComment,
  addSuggestion,
  addViewpointSuggestion,
  deleteComment,
  deleteSuggestion,
  editComment,
  editSuggestion,
  MAX_TEXT,
  ownLiveComment,
  ownOpenSuggestion,
  readReader,
  readTopicFeedback,
  setBacking,
  setReaderName,
  setUseful,
} from './store';
import { body, checkPost, failure, topicTargets, writer } from './route-helpers';
import type { TopicFeedbackResponse } from './types';

/*
 * The handlers behind the reader-feedback routes under app/api, one function
 * per route file, each taking what it needs from outside (./deps.ts). A route
 * file only binds its handlers to the real dependencies.
 */

type Params<T> = { params: Promise<T> };
const textSchema = z.object({ text: z.string().trim().min(1).max(MAX_TEXT) });

/** /api/account/name */
export function accountNameRoute(deps: FeedbackDeps) {
  const schema = z.object({ name: z.string().trim().min(1).max(80) });

  /** Sets the name shown with what the signed-in reader writes. */
  async function PUT(req: Request) {
    if (!deps.isAuthConfigured) return failure('not_configured', 503);
    const userId = await deps.currentUserId();
    if (!userId) return failure('unauthorized', 401);
    const input = await body(req, schema);
    if (input instanceof Response) return input;
    await setReaderName(deps.db, userId, input.name);
    return new Response(null, { status: 204 });
  }
  return { PUT };
}

/** /api/topics/[slug]/feedback */
export function topicFeedbackRoute(deps: FeedbackDeps) {
  /** Every suggestion and comment on a topic, and who is reading them. Topic pages are static, so they fetch this. */
  async function GET(_req: Request, { params }: Params<{ slug: string }>) {
    const { slug } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    const userId = await deps.currentUserId();
    const response: TopicFeedbackResponse = {
      ...(await readTopicFeedback(deps.db, slug, userId)),
      reader: userId ? await readReader(deps.db, userId) : null,
    };
    return Response.json(response, { headers: { 'Cache-Control': 'private, no-store' } });
  }
  return { GET };
}

/** /api/topics/[slug]/viewpoint-suggestions */
export function viewpointSuggestionsRoute(deps: FeedbackDeps) {
  const schema = z.object({
    title: z.string().trim().min(1).max(300),
    steps: z.string().trim().min(1).max(MAX_TEXT),
    holders: z.string().trim().max(300).transform(holders => holders || null),
  });

  /** Suggests a viewpoint the topic is missing. Editors read these; the page does not show them. */
  async function POST(req: Request, { params }: Params<{ slug: string }>) {
    const { slug } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    const input = await body(req, schema);
    if (input instanceof Response) return input;
    const userId = await writer(deps, { named: true });
    if (userId instanceof Response) return userId;
    const moderation = await checkPost(deps, {
      kind: 'a viewpoint the page is missing',
      topic: targets.title,
      about: input.title,
      text: [input.steps, input.holders && `Held by: ${input.holders}`].filter(Boolean).join('\n'),
    });
    if (moderation instanceof Response) return moderation;
    return Response.json(await addViewpointSuggestion(deps.db, { userId, topicSlug: slug, ...input, moderation }), { status: 201 });
  }
  return { POST };
}

/** /api/topics/[slug]/viewpoints/[viewpointId]/suggestions */
export function viewpointSuggestionRoute(deps: FeedbackDeps) {
  const schema = z.object({
    text: z.string().trim().min(1).max(MAX_TEXT),
    /** The card it is about, by position; null for the whole case. */
    card: z.number().int().nonnegative().nullable(),
  });

  /** Adds a suggestion for making a viewpoint stronger. */
  async function POST(req: Request, { params }: Params<{ slug: string; viewpointId: string }>) {
    const { slug, viewpointId } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    const viewpoint = targets.viewpoints.get(viewpointId);
    if (!viewpoint) return failure('unknown_viewpoint', 404);
    const { headings } = viewpoint;
    const input = await body(req, schema);
    if (input instanceof Response) return input;
    if (input.card !== null && input.card >= headings.length) return failure('unknown_card', 400);
    const userId = await writer(deps, { named: true });
    if (userId instanceof Response) return userId;

    const card = input.card === null ? null : { index: input.card, heading: headings[input.card] };
    const moderation = await checkPost(deps, {
      kind: 'a suggestion for strengthening a viewpoint',
      topic: targets.title,
      about: card ? `${viewpoint.name}, the step “${card.heading}”` : viewpoint.name,
      text: input.text,
    });
    if (moderation instanceof Response) return moderation;
    return Response.json(await addSuggestion(deps.db, { userId, topicSlug: slug, viewpointId, card, body: input.text, moderation }), { status: 201 });
  }
  return { POST };
}

type SuggestionContext = Params<{ slug: string; suggestionId: string }>;

/** /api/topics/[slug]/suggestions/[suggestionId] */
export function suggestionRoute(deps: FeedbackDeps) {
  /** The writer rewriting their own suggestion, while it is still open. It is checked again. */
  async function PATCH(req: Request, { params }: SuggestionContext) {
    const { slug, suggestionId } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    if (!z.uuid().safeParse(suggestionId).success) return failure('unknown_suggestion', 404);
    const input = await body(req, textSchema);
    if (input instanceof Response) return input;
    const userId = await writer(deps, { named: true });
    if (userId instanceof Response) return userId;

    const own = await ownOpenSuggestion(deps.db, { userId, topicSlug: slug, id: suggestionId });
    if (!own) return failure('unknown_suggestion', 404);
    const name = targets.viewpoints.get(own.viewpointId)?.name ?? own.viewpointId;
    const moderation = await checkPost(deps, {
      kind: 'a suggestion for strengthening a viewpoint',
      topic: targets.title,
      about: own.cardHeading ? `${name}, the step “${own.cardHeading}”` : name,
      text: input.text,
    });
    if (moderation instanceof Response) return moderation;
    const done = await editSuggestion(deps.db, { userId, topicSlug: slug, id: suggestionId, body: input.text, moderation });
    return done ? new Response(null, { status: 204 }) : failure('unknown_suggestion', 404);
  }

  /** The writer deleting their own suggestion. */
  async function DELETE(_req: Request, { params }: SuggestionContext) {
    const { slug, suggestionId } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    if (!z.uuid().safeParse(suggestionId).success) return failure('unknown_suggestion', 404);
    const userId = await writer(deps, { named: false });
    if (userId instanceof Response) return userId;
    const done = await deleteSuggestion(deps.db, { userId, topicSlug: slug, id: suggestionId });
    return done ? new Response(null, { status: 204 }) : failure('unknown_suggestion', 404);
  }
  return { PATCH, DELETE };
}

/** /api/topics/[slug]/suggestions/[suggestionId]/backing */
export function backingRoute(deps: FeedbackDeps) {
  /** The reader backing a suggestion (PUT), or withdrawing it (DELETE). */
  async function back(context: SuggestionContext, backed: boolean) {
    const { slug, suggestionId } = await context.params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    if (!z.uuid().safeParse(suggestionId).success) return failure('unknown_suggestion', 404);
    const userId = await writer(deps, { named: false });
    if (userId instanceof Response) return userId;
    const done = await setBacking(deps.db, { userId, topicSlug: slug, suggestionId, backed });
    return done ? new Response(null, { status: 204 }) : failure('unknown_suggestion', 404);
  }
  return {
    PUT: (_req: Request, context: SuggestionContext) => back(context, true),
    DELETE: (_req: Request, context: SuggestionContext) => back(context, false),
  };
}

/** /api/topics/[slug]/cruxes/[cruxId]/comments */
export function cruxCommentsRoute(deps: FeedbackDeps) {
  const schema = z.object({
    text: z.string().trim().min(1).max(MAX_TEXT),
    /** The comment this replies to, for a reply. */
    parentId: z.uuid().nullable(),
  });

  /** Adds a comment to a crux's discussion, or a reply to one of its comments. */
  async function POST(req: Request, { params }: Params<{ slug: string; cruxId: string }>) {
    const { slug, cruxId } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    const cruxTitle = targets.cruxes.get(cruxId);
    if (!cruxTitle) return failure('unknown_crux', 404);
    const input = await body(req, schema);
    if (input instanceof Response) return input;
    const userId = await writer(deps, { named: true });
    if (userId instanceof Response) return userId;

    const moderation = await checkPost(deps, {
      kind: input.parentId ? 'a reply in a discussion' : 'a comment in a discussion',
      topic: targets.title,
      about: cruxTitle,
      text: input.text,
    });
    if (moderation instanceof Response) return moderation;
    const added = await addComment(deps.db, { userId, topicSlug: slug, cruxId, parentId: input.parentId, body: input.text, moderation });
    return added ? Response.json(added, { status: 201 }) : failure('unknown_comment', 404);
  }
  return { POST };
}

type CommentContext = Params<{ slug: string; commentId: string }>;

/** /api/topics/[slug]/comments/[commentId] */
export function commentRoute(deps: FeedbackDeps) {
  /** The writer rewriting their own comment or reply. It is checked again. */
  async function PATCH(req: Request, { params }: CommentContext) {
    const { slug, commentId } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    if (!z.uuid().safeParse(commentId).success) return failure('unknown_comment', 404);
    const input = await body(req, textSchema);
    if (input instanceof Response) return input;
    const userId = await writer(deps, { named: true });
    if (userId instanceof Response) return userId;

    const own = await ownLiveComment(deps.db, { userId, topicSlug: slug, id: commentId });
    if (!own) return failure('unknown_comment', 404);
    const moderation = await checkPost(deps, {
      kind: own.parentId ? 'a reply in a discussion' : 'a comment in a discussion',
      topic: targets.title,
      about: targets.cruxes.get(own.cruxId) ?? own.cruxId,
      text: input.text,
    });
    if (moderation instanceof Response) return moderation;
    const done = await editComment(deps.db, { userId, topicSlug: slug, id: commentId, body: input.text, moderation });
    return done ? new Response(null, { status: 204 }) : failure('unknown_comment', 404);
  }

  /** The writer deleting their own comment or reply. */
  async function DELETE(_req: Request, { params }: CommentContext) {
    const { slug, commentId } = await params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    if (!z.uuid().safeParse(commentId).success) return failure('unknown_comment', 404);
    const userId = await writer(deps, { named: false });
    if (userId instanceof Response) return userId;
    const done = await deleteComment(deps.db, { userId, topicSlug: slug, id: commentId });
    return done ? new Response(null, { status: 204 }) : failure('unknown_comment', 404);
  }
  return { PATCH, DELETE };
}

/** /api/topics/[slug]/comments/[commentId]/useful */
export function usefulRoute(deps: FeedbackDeps) {
  /** The reader marking a crux comment useful (PUT), or unmarking it (DELETE). */
  async function mark(context: CommentContext, useful: boolean) {
    const { slug, commentId } = await context.params;
    const targets = await topicTargets(deps, slug);
    if (targets instanceof Response) return targets;
    if (!z.uuid().safeParse(commentId).success) return failure('unknown_comment', 404);
    const userId = await writer(deps, { named: false });
    if (userId instanceof Response) return userId;
    const done = await setUseful(deps.db, { userId, topicSlug: slug, commentId, useful });
    return done ? new Response(null, { status: 204 }) : failure('unknown_comment', 404);
  }
  return {
    PUT: (_req: Request, context: CommentContext) => mark(context, true),
    DELETE: (_req: Request, context: CommentContext) => mark(context, false),
  };
}
