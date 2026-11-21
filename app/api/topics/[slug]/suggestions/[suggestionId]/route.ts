import { z } from 'zod';
import { db } from '@/lib/db/client';
import { deleteSuggestion, editSuggestion, MAX_TEXT, ownOpenSuggestion } from '@/lib/feedback/store';
import { body, checkPost, failure, topicTargets, writer } from '@/lib/feedback/route-helpers';

type Context = { params: Promise<{ slug: string; suggestionId: string }> };

const schema = z.object({ text: z.string().trim().min(1).max(MAX_TEXT) });

/** The writer rewriting their own suggestion, while it is still open. It is checked again. */
export async function PATCH(req: Request, { params }: Context) {
  const { slug, suggestionId } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!z.uuid().safeParse(suggestionId).success) return failure('unknown_suggestion', 404);
  const input = await body(req, schema);
  if (input instanceof Response) return input;
  const userId = await writer({ named: true });
  if (userId instanceof Response) return userId;

  const own = await ownOpenSuggestion(db, { userId, topicSlug: slug, id: suggestionId });
  if (!own) return failure('unknown_suggestion', 404);
  const name = targets.viewpoints.get(own.viewpointId)?.name ?? own.viewpointId;
  const moderation = await checkPost({
    kind: 'a suggestion for strengthening a viewpoint',
    topic: targets.title,
    about: own.cardHeading ? `${name}, the step “${own.cardHeading}”` : name,
    text: input.text,
  });
  if (moderation instanceof Response) return moderation;
  const done = await editSuggestion(db, { userId, topicSlug: slug, id: suggestionId, body: input.text, moderation });
  return done ? new Response(null, { status: 204 }) : failure('unknown_suggestion', 404);
}

/** The writer deleting their own suggestion. */
export async function DELETE(_req: Request, { params }: Context) {
  const { slug, suggestionId } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!z.uuid().safeParse(suggestionId).success) return failure('unknown_suggestion', 404);
  const userId = await writer({ named: false });
  if (userId instanceof Response) return userId;
  const done = await deleteSuggestion(db, { userId, topicSlug: slug, id: suggestionId });
  return done ? new Response(null, { status: 204 }) : failure('unknown_suggestion', 404);
}
