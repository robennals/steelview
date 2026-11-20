import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackEmail, feedbackMailer, feedbackSubmission, isSpam } from './feedback';

const valid = { name: ' Ada ', email: ' ada@example.com ', message: ' The 2024 figure looks wrong. ', page: 'https://steelview.org/topics/uk-asylum' };

test('a submission needs a valid email and a message, and is trimmed', () => {
  const parsed = feedbackSubmission.parse(valid);
  assert.equal(parsed.email, 'ada@example.com');
  assert.equal(parsed.message, 'The 2024 figure looks wrong.');
  assert.equal(parsed.name, 'Ada');

  const noEmail = feedbackSubmission.safeParse({ ...valid, email: 'not-an-email' });
  assert.equal(noEmail.success, false);
  assert.equal(noEmail.error?.issues[0]?.message, 'Please give a valid email, so we can reply.');
  assert.equal(feedbackSubmission.safeParse({ ...valid, message: '   ' }).success, false);
  assert.equal(feedbackSubmission.safeParse({ ...valid, message: 'x'.repeat(5001) }).success, false);
  assert.equal(feedbackSubmission.safeParse(null).success, false);
});

test('only a filled honeypot marks a submission as spam', () => {
  assert.equal(isSpam(feedbackSubmission.parse(valid)), false);
  assert.equal(isSpam(feedbackSubmission.parse({ ...valid, hp_referrer: '  ' })), false);
  assert.equal(isSpam(feedbackSubmission.parse({ ...valid, hp_referrer: 'http://spam' })), true);
});

test('the email replies to the reader and says who sent it from which page', () => {
  const email = feedbackEmail(feedbackSubmission.parse(valid));
  assert.equal(email.replyTo, 'ada@example.com');
  assert.equal(email.subject, 'Steelview feedback: The 2024 figure looks wrong.');
  assert.match(email.text, /^The 2024 figure looks wrong\.\n\n---\nFrom: Ada <ada@example\.com>\nPage: https:\/\/steelview\.org\/topics\/uk-asylum\n$/);

  const long = feedbackEmail(feedbackSubmission.parse({ email: 'a@b.co', message: `${'word '.repeat(20)}\n\nmore` }));
  assert.equal(long.subject, `Steelview feedback: ${'word '.repeat(12)}…`);
  assert.match(long.text, /From: \(no name given\) <a@b\.co>\nPage: \(not known\)/);
});

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

/** Replaces fetch with one that records each request and answers 200. */
function recordRequests() {
  const requests: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return new Response('{}', { status: 200 });
  };
  return requests;
}

test('no mailer is configured until the recipient and a provider are both set', () => {
  assert.equal(feedbackMailer({}), null);
  assert.equal(feedbackMailer({ RESEND_API_KEY: 'k', RESEND_FROM: 'f@steelview.org' }), null);
  assert.equal(feedbackMailer({ FEEDBACK_TO: 'rob@example.com', RESEND_API_KEY: 'k' }), null);
  assert.equal(feedbackMailer({ FEEDBACK_TO: 'rob@example.com', EMAIL_PROVIDER: 'postmark', RESEND_API_KEY: 'k', RESEND_FROM: 'f' }), null);
});

test('Resend is the default provider, and the reader is CC’d and replied to', async () => {
  const requests = recordRequests();
  const mailer = feedbackMailer({ FEEDBACK_TO: 'rob@example.com', RESEND_API_KEY: 'key', RESEND_FROM: 'f@steelview.org' });
  assert.ok(mailer);
  await mailer.send(feedbackEmail(feedbackSubmission.parse(valid)), mailer.to);
  assert.equal(requests[0].url, 'https://api.resend.com/emails');
  assert.deepEqual(new Headers(requests[0].init?.headers).get('authorization'), 'Bearer key');
  const body = JSON.parse(String(requests[0].init?.body));
  assert.deepEqual([body.from, body.to, body.cc, body.reply_to], ['f@steelview.org', ['rob@example.com'], ['ada@example.com'], ['ada@example.com']]);
});

test('EMAIL_PROVIDER=postmark sends through Postmark instead', async () => {
  const requests = recordRequests();
  const mailer = feedbackMailer({ FEEDBACK_TO: 'rob@example.com', EMAIL_PROVIDER: 'postmark', POSTMARK_TOKEN: 'tok', POSTMARK_FROM: 'f@steelview.org' });
  assert.ok(mailer);
  await mailer.send(feedbackEmail(feedbackSubmission.parse(valid)), mailer.to);
  assert.equal(requests[0].url, 'https://api.postmarkapp.com/email');
  assert.equal(new Headers(requests[0].init?.headers).get('X-Postmark-Server-Token'), 'tok');
  const body = JSON.parse(String(requests[0].init?.body));
  assert.deepEqual([body.From, body.To, body.Cc, body.ReplyTo], ['f@steelview.org', 'rob@example.com', 'ada@example.com', 'ada@example.com']);
});
