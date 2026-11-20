import { feedbackEmail, feedbackMailer, feedbackSubmission, isSpam } from '@/lib/feedback';

export async function POST(request: Request) {
  const parsed = feedbackSubmission.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }
  // A bot filled the hidden field: report success so it learns nothing.
  if (isSpam(parsed.data)) return Response.json({ ok: true });

  const mailer = feedbackMailer(process.env);
  if (!mailer) {
    return Response.json({ error: 'Feedback is temporarily unavailable. Please try again later.' }, { status: 503 });
  }

  const sent = await mailer.send(feedbackEmail(parsed.data), mailer.to);
  if (!sent.ok) {
    console.error('feedback email failed', sent.status, await sent.text());
    return Response.json({ error: 'Couldn’t send your message. Please try again.' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
