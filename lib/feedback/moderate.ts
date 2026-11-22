import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

/*
 * A light check on every post before it goes up: Claude Haiku 5.5 blocks
 * abuse, threats, spam and posts with nothing to do with the topic, and
 * nothing else. Being wrong, one-sided or uncomfortable is never a reason:
 * on this site that is the point.
 */

/** The only model this check uses. */
export const MODERATION_MODEL = 'claude-haiku-5-5';

/** A post's fate: up, refused with a reason the writer sees, or up unchecked because the check could not run. */
export type Moderation =
  | { verdict: 'allowed' }
  | { verdict: 'blocked'; reason: string }
  | { verdict: 'unchecked' };

/** What a reader is posting, and where. */
export type Post = {
  kind: 'a suggestion for strengthening a viewpoint' | 'a comment in a discussion' | 'a reply in a discussion' | 'a viewpoint the page is missing';
  /** The topic's title. */
  topic: string;
  /** What the post is about: the viewpoint or the crux. */
  about: string;
  text: string;
};

const RULES = `You moderate reader posts on Steelview, a site that sets out every side of a divisive issue. Decide only whether a post may appear.

Block a post only if it:
- uses slurs, or dehumanizes a group of people;
- attacks or harasses another reader or a named private individual, or reveals someone's personal details;
- threatens or incites violence;
- is spam or advertising;
- is sexual content; or
- has nothing to do with the topic.

Never block a post for being wrong, one-sided, strongly worded, uncomfortable, or for disagreeing with anyone. Criticising public figures, governments and groups' ideas is allowed. When unsure, allow it.

If you block it, give the reason in one plain sentence addressed to the writer, saying what to change.`;

const verdictSchema = z.object({
  allowed: z.boolean(),
  /** Empty when allowed. */
  reason: z.string(),
});

/** One Haiku request, separate so tests can stand in for the API. */
export type ModerationCall = (post: Post) => Promise<{ stopReason: string | null; verdict: z.infer<typeof verdictSchema> | null }>;

let client: Anthropic | null = null;

/** Asks Claude Haiku 5.5 for a verdict on a post. */
const callHaiku: ModerationCall = async (post) => {
  client ??= new Anthropic({ timeout: 10_000, maxRetries: 1 });
  const response = await client.messages.parse({
    model: MODERATION_MODEL,
    max_tokens: 300,
    // A yes-or-no judgement: no thinking, least effort.
    thinking: { type: 'disabled' },
    output_config: { effort: 'low', format: zodOutputFormat(verdictSchema) },
    system: RULES,
    messages: [{
      role: 'user',
      content: `Topic: ${post.topic}\nThis is ${post.kind}, about: ${post.about}\n\n<post>\n${post.text}\n</post>`,
    }],
  });
  return { stopReason: response.stop_reason, verdict: response.parsed_output ?? null };
};

/** Whether posts are checked here: only where there is a key to check them with. */
export const isModerationConfigured = !!process.env.ANTHROPIC_API_KEY;

/**
 * The verdict on a post. If the check cannot run (no key, an error, a
 * timeout, or a reply it cannot read), the post goes up marked unchecked: a
 * reader's writing should not be lost because the check failed.
 */
export async function moderate(post: Post, call: ModerationCall = callHaiku): Promise<Moderation> {
  if (call === callHaiku && !isModerationConfigured) return { verdict: 'unchecked' };
  try {
    const { stopReason, verdict } = await call(post);
    if (stopReason !== 'end_turn' || !verdict) return { verdict: 'unchecked' };
    if (verdict.allowed) return { verdict: 'allowed' };
    return { verdict: 'blocked', reason: verdict.reason.trim() || 'This post breaks the site’s rules for posting.' };
  } catch (error) {
    console.error('[moderation] check failed; posting unchecked:', error);
    return { verdict: 'unchecked' };
  }
}
