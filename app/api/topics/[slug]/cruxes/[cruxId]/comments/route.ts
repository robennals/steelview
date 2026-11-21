import { z } from 'zod';
import { db } from '@/lib/db/client';
import { addComment, MAX_TEXT } from '@/lib/feedback/store';
import { body, failure, topicTargets, writer } from '@/lib/feedback/route-helpers';

const schema = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT),
  /** The comment this replies to, for a reply. */
  parentId: z.uuid().nullable(),
});

/** Adds a comment to a crux's discussion, or a reply to one of its comments. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string; cruxId: string }> }) {
  const { slug, cruxId } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  if (!targets.cruxes.has(cruxId)) return failure('unknown_crux', 404);
  const input = await body(req, schema);
  if (input instanceof Response) return input;
  const userId = await writer({ named: true });
  if (userId instanceof Response) return userId;

  const added = await addComment(db, { userId, topicSlug: slug, cruxId, parentId: input.parentId, body: input.text });
  return added ? Response.json(added, { status: 201 }) : failure('unknown_comment', 404);
}
