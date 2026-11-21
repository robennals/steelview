'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { TopicFeedbackResponse } from '@/lib/feedback/types';

/**
 * Where a topic's feedback is: still on its way, switched off (no database
 * here, as in local content work and the browser tests), unreachable, or here.
 */
export type FeedbackState =
  | { status: 'loading' }
  | { status: 'off' }
  | { status: 'failed' }
  | { status: 'ready'; feedback: TopicFeedbackResponse };

/** What a write came back with: done, or the error code the API gave, with the moderation check's reason when it refused the post. */
export type WriteResult = { ok: true } | { ok: false; error: string; reason?: string };

type FeedbackContextValue = {
  slug: string;
  state: FeedbackState;
  /** Fetches the topic's feedback again, after a write or a sign-in. */
  refresh: () => Promise<void>;
  /** Sends a write to the topic's feedback API at `path` (under `/api/topics/<slug>/`, or absolute), then refreshes. */
  write: (method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown) => Promise<WriteResult>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

/** The topic's feedback and the ways to add to it. Only inside a `FeedbackProvider`. */
export function useFeedback(): FeedbackContextValue {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useFeedback outside a FeedbackProvider');
  return value;
}

async function fetchFeedback(slug: string): Promise<FeedbackState> {
  try {
    const res = await fetch(`/api/topics/${slug}/feedback`, { cache: 'no-store' });
    if (res.status === 503) return { status: 'off' };
    if (!res.ok) return { status: 'failed' };
    const feedback: TopicFeedbackResponse = await res.json();
    return { status: 'ready', feedback };
  } catch {
    return { status: 'failed' };
  }
}

/**
 * A topic's reader feedback. The page is static, so the feedback, and who is
 * signed in, are fetched once it has loaded, and again after each write.
 */
export function FeedbackProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [state, setState] = useState<FeedbackState>({ status: 'loading' });

  useEffect(() => {
    let current = true;
    fetchFeedback(slug).then(next => {
      if (current) setState(next);
    });
    return () => {
      current = false;
    };
  }, [slug]);

  const refresh = useCallback(async () => setState(await fetchFeedback(slug)), [slug]);

  const write = useCallback(async (method: 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<WriteResult> => {
    try {
      const res = await fetch(path.startsWith('/') ? path : `/api/topics/${slug}/${path}`, {
        method,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const error = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'failed';
        const reason = data && typeof data === 'object' && 'reason' in data && typeof data.reason === 'string' ? data.reason : undefined;
        return { ok: false, error, reason };
      }
      await refresh();
      return { ok: true };
    } catch {
      return { ok: false, error: 'network' };
    }
  }, [slug, refresh]);

  const value = useMemo(() => ({ slug, state, refresh, write }), [slug, state, refresh, write]);
  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

/** A write's error, in words a reader can act on. */
export function writeErrorMessage(result: Extract<WriteResult, { ok: false }>): string {
  switch (result.error) {
    case 'blocked': return `Not posted. ${result.reason ?? ''} You can edit it and try again.`;
    case 'rate_limited': return 'You’ve posted a lot in the last hour. Please try again later.';
    case 'unauthorized': return 'Your sign-in has run out. Please sign in again.';
    case 'invalid_body': return 'That’s empty or too long.';
    case 'network': return 'Couldn’t reach Steelview. Check your connection and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}
