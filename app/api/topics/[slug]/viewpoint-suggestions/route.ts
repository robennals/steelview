import { z } from 'zod';
import { db } from '@/lib/db/client';
import { addViewpointSuggestion, MAX_TEXT } from '@/lib/feedback/store';
import { body, checkPost, topicTargets, writer } from '@/lib/feedback/route-helpers';

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
  const moderation = await checkPost({
    kind: 'a viewpoint the page is missing',
    topic: targets.title,
    about: input.title,
    text: [input.steps, input.holders && `Held by: ${input.holders}`].filter(Boolean).join('\n'),
  });
  if (moderation instanceof Response) return moderation;
  return Response.json(await addViewpointSuggestion(db, { userId, topicSlug: slug, ...input, moderation }), { status: 201 });
}
