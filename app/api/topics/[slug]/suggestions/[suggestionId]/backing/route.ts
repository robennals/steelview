import { z } from 'zod';
import { db } from '@/lib/db/client';
import { setBacking } from '@/lib/feedback/store';
import { failure, topicTargets, writer } from '@/lib/feedback/route-helpers';

type Context = { params: Promise<{ slug: string; suggestionId: string }> };

/** The reader backing a suggestion (PUT), or withdrawing it (DELETE). */
async function back(context: Context, backed: boolean) {
  const { slug, suggestionId } = await context.params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!z.uuid().safeParse(suggestionId).success) return failure('unknown_suggestion', 404);
  const userId = await writer({ named: false });
  if (userId instanceof Response) return userId;
  const done = await setBacking(db, { userId, topicSlug: slug, suggestionId, backed });
  return done ? new Response(null, { status: 204 }) : failure('unknown_suggestion', 404);
}

export const PUT = (_req: Request, context: Context) => back(context, true);
export const DELETE = (_req: Request, context: Context) => back(context, false);
