import { currentUserId } from '@/auth';
import { db } from '@/lib/db/client';
import { readReader, readTopicFeedback } from '@/lib/feedback/store';
import { topicTargets } from '@/lib/feedback/route-helpers';
import type { TopicFeedbackResponse } from '@/lib/feedback/types';

/** Every suggestion and comment on a topic, and who is reading them. Topic pages are static, so they fetch this. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const targets = await topicTargets(slug);
  if (targets instanceof Response) return targets;
  const userId = await currentUserId();
  const response: TopicFeedbackResponse = {
    ...(await readTopicFeedback(db, slug, userId)),
    reader: userId ? await readReader(db, userId) : null,
  };
  return Response.json(response, { headers: { 'Cache-Control': 'private, no-store' } });
}
