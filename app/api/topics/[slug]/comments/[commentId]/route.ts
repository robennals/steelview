import { z } from 'zod';
import { db } from '@/lib/db/client';
import { deleteComment, editComment, MAX_TEXT, ownLiveComment } from '@/lib/feedback/store';
import { body, checkPost, failure, topicTargets, writer } from '@/lib/feedback/route-helpers';

type Context = { params: Promise<{ slug: string; commentId: string }> };

const schema = z.object({ text: z.string().trim().min(1).max(MAX_TEXT) });

/** The writer rewriting their own comment or reply. It is checked again. */
export async function PATCH(req: Request, { params }: Context) {
  const { slug, commentId } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!z.uuid().safeParse(commentId).success) return failure('unknown_comment', 404);
  const input = await body(req, schema);
  if (input instanceof Response) return input;
  const userId = await writer({ named: true });
  if (userId instanceof Response) return userId;

  const own = await ownLiveComment(db, { userId, topicSlug: slug, id: commentId });
  if (!own) return failure('unknown_comment', 404);
  const moderation = await checkPost({
    kind: own.parentId ? 'a reply in a discussion' : 'a comment in a discussion',
    topic: targets.title,
    about: targets.cruxes.get(own.cruxId) ?? own.cruxId,
    text: input.text,
  });
  if (moderation instanceof Response) return moderation;
  const done = await editComment(db, { userId, topicSlug: slug, id: commentId, body: input.text, moderation });
  return done ? new Response(null, { status: 204 }) : failure('unknown_comment', 404);
}

/** The writer deleting their own comment or reply. */
export async function DELETE(_req: Request, { params }: Context) {
  const { slug, commentId } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!z.uuid().safeParse(commentId).success) return failure('unknown_comment', 404);
  const userId = await writer({ named: false });
  if (userId instanceof Response) return userId;
  const done = await deleteComment(db, { userId, topicSlug: slug, id: commentId });
  return done ? new Response(null, { status: 204 }) : failure('unknown_comment', 404);
}
