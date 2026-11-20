'use client';

import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { HONEYPOT_FIELD } from '@/lib/feedback';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

const errorResponse = z.object({ error: z.string() });

/** The /feedback page's form: posts to /api/feedback, which emails Rob and CCs the reader. */
export function FeedbackForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? '');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: field('name'),
          email: field('email'),
          message: field('message'),
          // The page the reader followed the Feedback link from.
          page: document.referrer,
          [HONEYPOT_FIELD]: field(HONEYPOT_FIELD),
        }),
      });
      if (!res.ok) {
        const body = errorResponse.safeParse(await res.json().catch(() => null));
        throw new Error(body.success ? body.data.error : `Request failed (${res.status})`);
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'sent') {
    return (
      <p className="sv-form__sent" role="status">
        Thank you — your message is on its way, and a copy has been sent to your email.
      </p>
    );
  }

  return (
    <form className="sv-form" onSubmit={handleSubmit}>
      {/* Spam honeypot: hidden from people, but bots fill every field. See HONEYPOT_FIELD for its name. */}
      <input className="sv-form__honeypot" type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="sv-form__field">
        <span>Your name <span className="sv-form__hint">(optional)</span></span>
        <input type="text" name="name" maxLength={100} autoComplete="name" />
      </label>
      <label className="sv-form__field">
        <span>Your email <span className="sv-form__hint">(so we can reply)</span></span>
        <input type="email" name="email" required maxLength={200} autoComplete="email" />
      </label>
      <label className="sv-form__field">
        <span>Message</span>
        <textarea name="message" required maxLength={5000} rows={7} />
      </label>
      {status === 'error' && error && <p className="sv-form__error" role="alert">{error}</p>}
      <div>
        <button className="sv-form__submit" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
