import { currentUserId, isAuthConfigured } from '@/auth';
import { db, type DB } from '@/lib/db/client';
import { moderate, type Moderation, type Post } from './moderate';

/**
 * What the feedback routes need from outside: the database, who is signed
 * in, and the moderation check. The routes use `feedbackDeps`; tests pass
 * their own, so they run without next-auth, Neon or the Anthropic API.
 */
export type FeedbackDeps = {
  db: DB;
  /** False where sign-in, and so feedback, is switched off. */
  isAuthConfigured: boolean;
  currentUserId: () => Promise<string | null>;
  moderate: (post: Post) => Promise<Moderation>;
};

export const feedbackDeps: FeedbackDeps = {
  db,
  isAuthConfigured,
  currentUserId,
  moderate,
};
