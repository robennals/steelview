'use client';

import { useId, useState, type ReactNode } from 'react';
import { useFeedback, writeErrorMessage } from './feedback-context';

type OwnPostProps = {
  /** Where the post lives in the topic's feedback API: `suggestions/<id>` or `comments/<id>`. */
  path: string;
  /** What it says now, which editing starts from. */
  text: string;
  /** Whether it may still be changed. A suggestion an editor has dealt with can only be deleted. */
  editable: boolean;
  /** The post's text as shown when it is not being edited. */
  children: ReactNode;
};

/**
 * A post by the reader looking at it, with the ways to change it: Edit, which
 * swaps the text for a box to rewrite it in (checked again on saving), and
 * Delete, which asks once before it goes.
 */
export function OwnPost({ path, text, editable, children }: OwnPostProps) {
  const id = useId();
  const { write } = useFeedback();
  const [mode, setMode] = useState<'reading' | 'editing' | 'confirming'>('reading');
  const [draft, setDraft] = useState(text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (method: 'PATCH' | 'DELETE') => {
    setBusy(true);
    setError(null);
    const result = await write(method, path, method === 'PATCH' ? { text: draft } : undefined);
    setBusy(false);
    if (result.ok) setMode('reading');
    else setError(writeErrorMessage(result));
  };

  if (mode === 'editing') {
    return (
      <div className="sv-compose sv-own-post__edit">
        <label className="sv-visually-hidden" htmlFor={id}>Edit what you wrote</label>
        <textarea id={id} className="sv-compose__text" rows={3} value={draft} onChange={e => setDraft(e.target.value)} autoFocus />
        <div className="sv-compose__row">
          <button type="button" className="sv-feedback__more" onClick={() => { setMode('reading'); setDraft(text); setError(null); }}>Cancel</button>
          <button type="button" className="sv-compose__submit" disabled={busy || !draft.trim() || draft.trim() === text} onClick={() => send('PATCH')}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
        {error && <p className="sv-signin__error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <>
      {children}
      <p className="sv-own-post__actions">
        {mode === 'confirming' ? (
          <>
            <span>Delete this?</span>
            <button type="button" className="sv-own-post__action sv-own-post__action--danger" disabled={busy} onClick={() => send('DELETE')}>{busy ? 'Deleting…' : 'Delete'}</button>
            <button type="button" className="sv-own-post__action" onClick={() => setMode('reading')}>Keep it</button>
          </>
        ) : (
          <>
            {editable && <button type="button" className="sv-own-post__action" onClick={() => setMode('editing')}>Edit</button>}
            <button type="button" className="sv-own-post__action" onClick={() => setMode('confirming')}>Delete</button>
          </>
        )}
      </p>
      {error && <p className="sv-signin__error" role="alert">{error}</p>}
    </>
  );
}
