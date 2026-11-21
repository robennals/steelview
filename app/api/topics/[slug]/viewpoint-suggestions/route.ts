import { z } from 'zod';
import { db } from '@/lib/db/client';
import { addViewpointSuggestion, MAX_TEXT } from '@/lib/feedback/store';
import { body, topicTargets, writer } from '@/lib/feedback/route-helpers';

const schema = z.object({
  title: z.string().trim().min(1).max(300),
  steps: z.string().trim().min(1).max(MAX_TEXT),
  holders: z.string().trim().max(300).transform(holders => holders || null),
});

/** Suggests a viewpoint the topic is missing. Editors read these; the page does not show them. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  const input = await body(req, schema);
  if (input instanceof Response) return input;
  const userId = await writer({ named: true });
  if (userId instanceof Response) return userId;
  return Response.json(await addViewpointSuggestion(db, { userId, topicSlug: slug, ...input }), { status: 201 });
}
