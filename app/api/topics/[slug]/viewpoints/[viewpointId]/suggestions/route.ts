import { z } from 'zod';
import { db } from '@/lib/db/client';
import { addSuggestion, MAX_TEXT } from '@/lib/feedback/store';
import { body, checkPost, failure, topicTargets, writer } from '@/lib/feedback/route-helpers';

const schema = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT),
  /** The card it is about, by position; null for the whole case. */
  card: z.number().int().nonnegative().nullable(),
});

/** Adds a suggestion for making a viewpoint stronger. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string; viewpointId: string }> }) {
  const { slug, viewpointId } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  const viewpoint = targets.viewpoints.get(viewpointId);
  if (!viewpoint) return failure('unknown_viewpoint', 404);
  const { headings } = viewpoint;
  const input = await body(req, schema);
  if (input instanceof Response) return input;
  if (input.card !== null && input.card >= headings.length) return failure('unknown_card', 400);
  const userId = await writer({ named: true });
  if (userId instanceof Response) return userId;

  const card = input.card === null ? null : { index: input.card, heading: headings[input.card] };
  const moderation = await checkPost({
    kind: 'a suggestion for strengthening a viewpoint',
    topic: targets.title,
    about: card ? `${viewpoint.name}, the step “${card.heading}”` : viewpoint.name,
    text: input.text,
  });
  if (moderation instanceof Response) return moderation;
  return Response.json(await addSuggestion(db, { userId, topicSlug: slug, viewpointId, card, body: input.text, moderation }), { status: 201 });
}
