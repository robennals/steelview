import { z } from 'zod';

/**
 * Reader feedback, sent from the /feedback form to /api/feedback and on to
 * Rob as an email, with the reader CC'd and set as Reply-To so answering it is
 * an ordinary reply. Modelled on the Learn AI site's form.
 */

/**
 * The spam honeypot's field name, shared by the form and the route. It must
 * not match a browser autofill token (website, url, email, name, …), or
 * password managers fill it and real readers are silently dropped as bots.
 */
export const HONEYPOT_FIELD = 'hp_referrer';

export const feedbackSubmission = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().max(200).pipe(z.email('Please give a valid email, so we can reply.')),
  message: z.string().trim().min(1, 'Please write a message.').max(5000, 'Please keep the message under 5,000 characters.'),
  /** The page the reader came from, so a correction arrives knowing which report it is about. */
  page: z.string().trim().max(500).optional(),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type FeedbackSubmission = z.infer<typeof feedbackSubmission>;

export type FeedbackEmail = { replyTo: string; subject: string; text: string };

export function isSpam(submission: FeedbackSubmission): boolean {
  return (submission[HONEYPOT_FIELD] ?? '').trim().length > 0;
}

export function feedbackEmail({ name, email, message, page }: FeedbackSubmission): FeedbackEmail {
  const oneLine = message.replace(/\s+/g, ' ');
  const preview = oneLine.length > 60 ? `${oneLine.slice(0, 60)}…` : oneLine;
  return {
    replyTo: email,
    subject: `Steelview feedback: ${preview}`,
    text: `${message}\n\n---\nFrom: ${name || '(no name given)'} <${email}>\nPage: ${page || '(not known)'}\n`,
  };
}

type Mailer = (email: FeedbackEmail, to: string) => Promise<Response>;

const sendWithResend = (apiKey: string, from: string): Mailer => (email, to) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], cc: [email.replyTo], reply_to: [email.replyTo], subject: email.subject, text: email.text }),
  });

const sendWithPostmark = (token: string, from: string): Mailer => (email, to) =>
  fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: { 'X-Postmark-Server-Token': token, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ From: from, To: to, Cc: email.replyTo, ReplyTo: email.replyTo, Subject: email.subject, TextBody: email.text, MessageStream: 'outbound' }),
  });

/**
 * The configured way to send feedback, or null if the environment has not
 * been set up. EMAIL_PROVIDER picks "resend" (the default) or "postmark", as
 * on the Learn AI site. FEEDBACK_TO is the recipient, kept out of the code
 * because the repository is public.
 */
export function feedbackMailer(env: Partial<Record<string, string>>): { send: Mailer; to: string } | null {
  const to = env.FEEDBACK_TO;
  if (!to) return null;
  if (env.EMAIL_PROVIDER === 'postmark') {
    return env.POSTMARK_TOKEN && env.POSTMARK_FROM ? { send: sendWithPostmark(env.POSTMARK_TOKEN, env.POSTMARK_FROM), to } : null;
  }
  return env.RESEND_API_KEY && env.RESEND_FROM ? { send: sendWithResend(env.RESEND_API_KEY, env.RESEND_FROM), to } : null;
}
