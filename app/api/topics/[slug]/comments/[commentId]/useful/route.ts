import { z } from 'zod';
import { db } from '@/lib/db/client';
import { setUseful } from '@/lib/feedback/store';
import { failure, topicTargets, writer } from '@/lib/feedback/route-helpers';

type Context = { params: Promise<{ slug: string; commentId: string }> };

/** The reader marking a crux comment useful (PUT), or unmarking it (DELETE). */
async function mark(context: Context, useful: boolean) {
  const { slug, commentId } = await context.params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!z.uuid().safeParse(commentId).success) return failure('unknown_comment', 404);
  const userId = await writer({ named: false });
  if (userId instanceof Response) return userId;
  const done = await setUseful(db, { userId, topicSlug: slug, commentId, useful });
  return done ? new Response(null, { status: 204 }) : failure('unknown_comment', 404);
}

export const PUT = (_req: Request, context: Context) => mark(context, true);
export const DELETE = (_req: Request, context: Context) => mark(context, false);
