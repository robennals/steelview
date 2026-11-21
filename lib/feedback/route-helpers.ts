import type { z } from 'zod';
import { currentUserId, isAuthConfigured } from '@/auth';
import { db } from '@/lib/db/client';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { makeDbRateLimitStore } from '@/lib/auth/rate-limit-store-db';
import { moderate, type Post } from './moderate';
import { readReader, type ModerationResult } from './store';
import { feedbackTargets, type FeedbackTargets } from './targets';

/*
 * The steps every feedback write shares: there is a topic, a signed-in reader
 * with a name to post under, a body of the right shape, and the reader has
 * not written too much in the last hour. Each returns either what it found or
 * the response to send instead.
 */

const WRITES_PER_READER_PER_HOUR = 60;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const failure = (error: string, status: number) => Response.json({ error }, { status });

/** The topic's feedback targets, or a 404 if there is no such topic, or a 503 if feedback is switched off. */
export async function topicTargets(slug: string): Promise<FeedbackTargets | Response> {
  if (!isAuthConfigured) return failure('not_configured', 503);
  return (await feedbackTargets(slug)) ?? failure('unknown_topic', 404);
}

/**
 * The id of the signed-in reader allowed to write now, or the response
 * refusing them. Posting text shows the reader's name, so it needs one;
 * backing a suggestion or marking a comment useful does not.
 */
export async function writer({ named }: { named: boolean }): Promise<string | Response> {
  const userId = await currentUserId();
  if (!userId) return failure('unauthorized', 401);
  const reader = await readReader(db, userId);
  if (!reader) return failure('unauthorized', 401);
  if (named && !reader.name) return failure('name_required', 403);
  const limit = await checkRateLimit(makeDbRateLimitStore(db), { key: `feedback:${userId}`, max: WRITES_PER_READER_PER_HOUR, windowMs: ONE_HOUR_MS });
  if (!limit.allowed) return Response.json({ error: 'rate_limited', retryAfterMs: limit.retryAfterMs }, { status: 429 });
  return userId;
}

/** The request's JSON body, if it has the shape `schema` describes, or a 400. */
export async function body<T>(req: Request, schema: z.ZodType<T>): Promise<T | Response> {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  return parsed.success ? parsed.data : failure('invalid_body', 400);
}

/**
 * The moderation check's result for a post that may go up, or a 422 carrying
 * the reason it may not, which the writer sees.
 */
export async function checkPost(post: Post): Promise<ModerationResult | Response> {
  const result = await moderate(post);
  if (result.verdict === 'blocked') return Response.json({ error: 'blocked', reason: result.reason }, { status: 422 });
  return result.verdict;
}
