'use client';

import { useCallback, useId, useState, type MouseEvent } from 'react';
import type { CruxComment } from '@/lib/feedback/types';
import { InfoSheet } from '@/components/topic/info-sheet';
import { useFeedback } from './feedback-context';
import { count, shortDate } from './format';
import { inOpeningOrder } from './order';
import { PostGate, useDraft } from './post-gate';

/** How many comments the preview shows. */
const PREVIEW = 2;

const PROMPT = 'What would change your mind on this?';

/** Most useful first, then newest. */
function ranked(comments: CruxComment[]): CruxComment[] {
  return [...comments].sort((a, b) => b.useful - a.useful || b.date.localeCompare(a.date));
}

/** A crux's comments, from the topic's feedback: null while it loads, none where feedback is off or unreachable. */
function useComments(cruxId: string): CruxComment[] | null {
  const { state } = useFeedback();
  if (state.status === 'loading') return null;
  return state.status === 'ready' ? state.feedback.discussions[cruxId] ?? [] : [];
}

type CruxDiscussionProps = {
  cruxId: string;
  /** The crux's title, for the full discussion's heading. */
  title: string;
};

/**
 * A crux's discussion, under its positions: the cruxes are where readers on
 * different sides argue it out. The open crux shows the most useful comments;
 * the whole discussion, and the box to join it, open over the page.
 */
export function CruxDiscussion({ cruxId, title }: CruxDiscussionProps) {
  const comments = useComments(cruxId);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setTrigger(null), []);
  const top = ranked(comments ?? []).slice(0, PREVIEW);
  const total = (comments ?? []).reduce((n, c) => n + 1 + c.replies.length, 0);

  const show = (event: MouseEvent<HTMLElement>) => {
    setTrigger(event.currentTarget.closest<HTMLElement>('.sv-discussion')?.querySelector<HTMLElement>('.sv-feedback__more') ?? null);
  };

  return (
    <section className="sv-discussion" aria-label={`Discussion of ${title}`}>
      <div className="sv-discussion__head">
        <h3 className="sv-discussion__title">Discussion</h3>
        {total > 0 && <span className="sv-feedback__count">{count(total, 'comment')}</span>}
      </div>
      <div className="sv-feedback__preview" onClick={show} aria-busy={comments === null}>
        {comments === null ? (
          <p className="sv-feedback__empty sv-feedback__empty--loading">Loading the discussion…</p>
        ) : top.length > 0 ? (
          <ul className="sv-feedback__list">
            {top.map(c => (
              <li key={c.id} className="sv-comment">
                <p className="sv-comment__by"><b>{c.author}</b> · {shortDate(c.date)}</p>
                <p className="sv-comment__text sv-comment__text--clamped">{c.text}</p>
                <p className="sv-comment__foot">Useful · {c.useful}{c.replies.length > 0 && <> · {count(c.replies.length, 'reply', 'replies')}</>}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sv-feedback__empty">No one has commented yet. {PROMPT}</p>
        )}
      </div>
      <div className="sv-feedback__foot">
        <button type="button" className="sv-feedback__more" onClick={show}>
          {top.length > 0 ? 'Join the discussion' : 'Start the discussion'} <span aria-hidden="true">→</span>
        </button>
      </div>
      {trigger && <DiscussionSheet cruxId={cruxId} title={title} trigger={trigger} onClose={close} />}
    </section>
  );
}

type DiscussionSheetProps = CruxDiscussionProps & {
  trigger: HTMLElement | null;
  onClose: () => void;
};

/** The whole of a crux's discussion, with the box to add a comment and a reply under each. */
function DiscussionSheet({ cruxId, title, trigger, onClose }: DiscussionSheetProps) {
  const titleId = useId();
  const { slug, state, write } = useFeedback();
  const comments = useComments(cruxId) ?? [];
  const signedIn = state.status === 'ready' && state.feedback.reader !== null;
  const [text, setText] = useDraft(`${slug}/comment/${cruxId}`);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Ranked once, when the discussion opens, so marking a comment useful does
  // not move it from under the reader's finger. Their own new comments go on top.
  const [openingOrder] = useState(() => ranked(comments).map(c => c.id));
  const shown = inOpeningOrder(ranked(comments), openingOrder);

  const post = async () => {
    const result = await write('POST', `cruxes/${cruxId}/comments`, { text, parentId: null });
    if (result.ok) setText('');
    return result;
  };

  return (
    <InfoSheet eyebrow="Discussion" labelledBy={titleId} trigger={trigger} onClose={onClose}>
      <div className="sv-feedback-sheet">
        <h2 id={titleId} className="sv-feedback-sheet__title">{title}</h2>

        <div className="sv-compose">
          <label className="sv-visually-hidden" htmlFor={`${titleId}-text`}>Your comment</label>
          <textarea id={`${titleId}-text`} className="sv-compose__text" rows={3} value={text} onChange={e => setText(e.target.value)} placeholder={PROMPT} />
          <PostGate label="Post" ready={!!text.trim()} onPost={post} />
        </div>

        {shown.length > 0 ? (
          <ul className="sv-feedback__list">
            {shown.map(c => (
              <li key={c.id} className="sv-comment">
                <p className="sv-comment__by"><b>{c.author}</b> · {shortDate(c.date)}</p>
                <p className="sv-comment__text">{c.text}</p>
                <p className="sv-comment__foot">
                  {signedIn ? (
                    <button type="button" className="sv-back" aria-pressed={c.markedUseful} onClick={() => write(c.markedUseful ? 'DELETE' : 'PUT', `comments/${c.id}/useful`)}>Useful · {c.useful}</button>
                  ) : <span>Useful · {c.useful}</span>}
                  <button type="button" className="sv-back" aria-expanded={replyingTo === c.id} onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}>Reply</button>
                </p>
                {(c.replies.length > 0 || replyingTo === c.id) && (
                  <ul className="sv-comment__replies">
                    {c.replies.map(r => (
                      <li key={r.id} className="sv-comment">
                        <p className="sv-comment__by"><b>{r.author}</b> · {shortDate(r.date)}</p>
                        <p className="sv-comment__text">{r.text}</p>
                      </li>
                    ))}
                    {replyingTo === c.id && <li><ReplyBox cruxId={cruxId} comment={c} onPosted={() => setReplyingTo(null)} /></li>}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="sv-feedback__empty">No one has commented yet.</p>
        )}
      </div>
    </InfoSheet>
  );
}

type ReplyBoxProps = { cruxId: string; comment: CruxComment; onPosted: () => void };

/** The box for replying to one comment, under its replies. */
function ReplyBox({ cruxId, comment, onPosted }: ReplyBoxProps) {
  const id = useId();
  const { slug, write } = useFeedback();
  const [reply, setReply] = useDraft(`${slug}/reply/${comment.id}`);

  const post = async () => {
    const result = await write('POST', `cruxes/${cruxId}/comments`, { text: reply, parentId: comment.id });
    if (result.ok) {
      setReply('');
      onPosted();
    }
    return result;
  };

  return (
    <div className="sv-compose sv-compose--reply">
      <label className="sv-visually-hidden" htmlFor={id}>Your reply to {comment.author}</label>
      <textarea id={id} className="sv-compose__text" rows={2} value={reply} onChange={e => setReply(e.target.value)} autoFocus />
      <PostGate label="Reply" ready={!!reply.trim()} onPost={post} />
    </div>
  );
}
