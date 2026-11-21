'use client';

import { useId, useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';

type Step = 'choose' | 'email' | 'pin';

/** The error the PIN request came back with, in words a reader can act on. */
function pinRequestError(data: { error?: string; retryAfterMs?: number }): string {
  if (data.error === 'cooldown' && data.retryAfterMs) return `Please wait ${Math.ceil(data.retryAfterMs / 1000)} seconds before asking for another code.`;
  if (data.error === 'rate_limited') {
    const minutes = Math.max(1, Math.ceil((data.retryAfterMs ?? 0) / 60_000));
    return `Too many sign-in attempts. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
  if (data.error === 'invalid_email') return 'Please enter a valid email address.';
  return 'Couldn’t send a code. Please try again.';
}

type SignInProps = {
  /** Called once the reader is signed in by email, without leaving the page. */
  onSignedIn: () => void;
};

/**
 * Signing in, where a reader is about to post: Google, or a six-digit code
 * sent by email, as on ACX Reviews. Google leaves the page and comes back to
 * it; what the reader had written is kept for their return.
 */
export function SignIn({ onSignedIn }: SignInProps) {
  const id = useId();
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestPin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/auth/pin/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
      if (res.ok) setStep('pin');
      else setError(pinRequestError(await res.json().catch(() => ({}))));
    } catch {
      setError('Couldn’t reach Steelview. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const verifyPin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signIn('pin', { email, pin, redirect: false });
      if (result?.error) setError('That code is wrong or has expired.');
      else onSignedIn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sv-signin">
      <p className="sv-signin__lead">Sign in to post. What you’ve written stays here.</p>
      {step === 'choose' && (
        <div className="sv-signin__choices">
          <button type="button" className="sv-signin__choice" onClick={() => signIn('google', { callbackUrl: location.href })}>Continue with Google</button>
          <button type="button" className="sv-signin__choice" onClick={() => setStep('email')}>Sign in with email</button>
        </div>
      )}
      {step === 'email' && (
        <form className="sv-signin__form" onSubmit={requestPin}>
          <label htmlFor={`${id}-email`}>Email address</label>
          <input id={`${id}-email`} className="sv-compose__text" type="email" required autoFocus autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          {error && <p className="sv-signin__error" role="alert">{error}</p>}
          <div className="sv-compose__row">
            <button type="button" className="sv-feedback__more" onClick={() => setStep('choose')}>Back</button>
            <button type="submit" className="sv-compose__submit" disabled={busy || !email}>{busy ? 'Sending…' : 'Send code'}</button>
          </div>
        </form>
      )}
      {step === 'pin' && (
        <form className="sv-signin__form" onSubmit={verifyPin}>
          <label htmlFor={`${id}-pin`}>The six-digit code we sent to {email}</label>
          <input id={`${id}-pin`} className="sv-compose__text sv-signin__pin" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus
            value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
          {error && <p className="sv-signin__error" role="alert">{error}</p>}
          <div className="sv-compose__row">
            <button type="button" className="sv-feedback__more" onClick={() => { setStep('email'); setPin(''); setError(null); }}>Use a different email</button>
            <button type="submit" className="sv-compose__submit" disabled={busy || pin.length !== 6}>{busy ? 'Checking…' : 'Sign in'}</button>
          </div>
        </form>
      )}
    </div>
  );
}
