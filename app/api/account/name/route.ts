import { z } from 'zod';
import { currentUserId, isAuthConfigured } from '@/auth';
import { db } from '@/lib/db/client';
import { setReaderName } from '@/lib/feedback/store';
import { body, failure } from '@/lib/feedback/route-helpers';

const schema = z.object({ name: z.string().trim().min(1).max(80) });

/** Sets the name shown with what the signed-in reader writes. */
export async function PUT(req: Request) {
  if (!isAuthConfigured) return failure('not_configured', 503);
  const userId = await currentUserId();
  if (!userId) return failure('unauthorized', 401);
  const input = await body(req, schema);
  if (input instanceof Response) return input;
  await setReaderName(db, userId, input.name);
  return new Response(null, { status: 204 });
}
