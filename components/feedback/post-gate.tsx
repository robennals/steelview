'use client';

import { useId, useState, type FormEvent } from 'react';
import { signOut } from 'next-auth/react';
import { useFeedback, writeErrorMessage, type WriteResult } from './feedback-context';
import { SignIn } from './sign-in';

/**
 * Text a reader is writing, kept in the tab's session storage under `key` as
 * they type: signing in with Google leaves the page, and they should find
 * their words when they come back. Only for components that render after a
 * click, never on the server.
 */
export function useDraft(key: string): [string, (value: string) => void] {
  const storageKey = `sv-draft:${key}`;
  const [value, setValue] = useState(() => sessionStorage.getItem(storageKey) ?? '');
  const update = (next: string) => {
    setValue(next);
    if (next) sessionStorage.setItem(storageKey, next);
    else sessionStorage.removeItem(storageKey);
  };
  return [value, update];
}

type PostGateProps = {
  /** The button's label: "Suggest", "Post", "Reply". */
  label: string;
  /** Whether there is anything to post. */
  ready: boolean;
  /** Sends what the reader wrote. On success the gate's form clears itself through the caller. */
  onPost: () => Promise<WriteResult>;
};

/**
 * The foot of every form a reader writes in: the button that posts, once they
 * may. A reader writes first and is asked to sign in only when they post, and
 * then for the name to show with it if they have none; what they wrote waits.
 * Where feedback is switched off, the gate says so and posts nothing.
 */
export function PostGate({ label, ready, onPost }: PostGateProps) {
  const id = useId();
  const { state, refresh, write } = useFeedback();
  const [signingIn, setSigningIn] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.status === 'off') return <p className="sv-compose__note">Posting isn’t switched on here.</p>;
  if (state.status === 'failed') return <p className="sv-compose__note">Couldn’t reach Steelview to post. Please reload and try again.</p>;
  const reader = state.status === 'ready' ? state.feedback.reader : null;

  const post = async () => {
    setBusy(true);
    setError(null);
    const result = await onPost();
    setBusy(false);
    if (!result.ok) setError(writeErrorMessage(result.error));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reader) {
      setSigningIn(true);
      return;
    }
    if (!reader.name) {
      setBusy(true);
      const named = await write('PUT', '/api/account/name', { name });
      setBusy(false);
      if (!named.ok) {
        setError(writeErrorMessage(named.error));
        return;
      }
    }
    await post();
  };

  if (!reader && signingIn) {
    return <SignIn onSignedIn={() => { setSigningIn(false); void refresh(); }} />;
  }

  return (
    <form className="sv-postgate" onSubmit={submit}>
      {reader && !reader.name && (
        <div className="sv-postgate__name">
          <label htmlFor={`${id}-name`}>Your name, shown with what you post</label>
          <input id={`${id}-name`} className="sv-compose__text" required maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
        </div>
      )}
      <div className="sv-compose__row">
        {reader?.name ? (
          <span className="sv-postgate__who">
            Posting as {reader.name} · <button type="button" className="sv-postgate__signout" onClick={() => signOut({ redirect: false }).then(refresh)}>Sign out</button>
          </span>
        ) : <span />}
        <button type="submit" className="sv-compose__submit" disabled={!ready || busy || state.status === 'loading' || (!!reader && !reader.name && !name.trim())}>
          {busy ? 'Posting…' : reader ? label : `Sign in to ${label.toLowerCase()}`}
        </button>
      </div>
      {error && <p className="sv-signin__error" role="alert">{error}</p>}
    </form>
  );
}
