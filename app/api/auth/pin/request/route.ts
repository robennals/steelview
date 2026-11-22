import { isAuthConfigured } from '@/auth';
import { db } from '@/lib/db/client';
import { requestPin } from '@/lib/auth/pin';
import { makeDbPinStore } from '@/lib/auth/pin-store-db';
import { resendPinSender } from '@/lib/auth/pin-sender-resend';
import { checkRateLimit, getClientIp } from '@/lib/auth/rate-limit';
import { makeDbRateLimitStore } from '@/lib/auth/rate-limit-store-db';

const PIN_REQUESTS_PER_IP_PER_HOUR = 30;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Emails a sign-in PIN. Never returns the PIN itself. */
export async function POST(req: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!isAuthConfigured || !secret) return Response.json({ error: 'not_configured' }, { status: 503 });

  const body: unknown = await req.json().catch(() => null);
  const email = body && typeof body === 'object' && 'email' in body && typeof body.email === 'string' ? body.email : '';
  if (!email) return Response.json({ error: 'invalid_email' }, { status: 400 });

  // Per IP, as well as the per-email cooldown inside requestPin.
  const limit = await checkRateLimit(makeDbRateLimitStore(db), {
    key: `pin_request:${getClientIp(req)}`,
    max: PIN_REQUESTS_PER_IP_PER_HOUR,
    windowMs: ONE_HOUR_MS,
  });
  if (!limit.allowed) return Response.json({ error: 'rate_limited', retryAfterMs: limit.retryAfterMs }, { status: 429 });

  const result = await requestPin(makeDbPinStore(db), resendPinSender, { email, secret });
  if (result.ok) return Response.json({ ok: true });
  if (result.reason === 'cooldown') return Response.json({ error: 'cooldown', retryAfterMs: result.retryAfterMs ?? 0 }, { status: 429 });
  return Response.json({ error: result.reason }, { status: 400 });
}
