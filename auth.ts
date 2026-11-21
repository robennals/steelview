import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { db, isDbConfigured } from '@/lib/db/client';
import { accounts, users, verificationTokens } from '@/lib/db/schema';
import { makeDbPinStore } from '@/lib/auth/pin-store-db';
import { normalizeEmail, verifyPin } from '@/lib/auth/pin';

/*
 * Reader sign-in, as ACX Reviews does it: Google, or a six-digit PIN sent by
 * email. Sessions are JWTs; the database holds users and their linked
 * accounts.
 */

/**
 * Sign-in works only with both AUTH_SECRET and DATABASE_URL set. Without
 * them the site renders as if no one is signed in, and reader feedback is
 * switched off.
 */
export const isAuthConfigured = isDbConfigured && !!process.env.AUTH_SECRET;

async function findOrCreateUserByEmail(email: string) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    if (!existing.emailVerified) await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, existing.id));
    return { id: existing.id, email: existing.email, name: existing.name };
  }
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, email, emailVerified: new Date() });
  return { id, email, name: null };
}

const providers: NextAuthConfig['providers'] = [
  // A reader who first signed in by PIN and later uses Google, or the other
  // way round, is one user, matched by email. Safe because both sides prove
  // the reader owns the address: the PIN by email, Google by its own check.
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
    // The same normalization as the PIN side, so one address is one user.
    profile(profile) {
      return { id: profile.sub, name: profile.name, email: normalizeEmail(profile.email ?? ''), image: profile.picture };
    },
  }),
  Credentials({
    id: 'pin',
    name: 'Email PIN',
    credentials: { email: { label: 'Email', type: 'email' }, pin: { label: 'PIN', type: 'text' } },
    authorize: async (raw) => {
      const secret = process.env.AUTH_SECRET;
      if (!secret) throw new Error('AUTH_SECRET not set');
      const email = normalizeEmail(String(raw?.email ?? ''));
      const result = await verifyPin(makeDbPinStore(db), { email, pin: String(raw?.pin ?? ''), secret });
      return result.ok ? findOrCreateUserByEmail(email) : null;
    },
  }),
];

// Lets the browser tests sign in as anyone without Google or email. Only when
// asked for, and never in a production build.
if (process.env.TEST_AUTH_BYPASS === '1' && process.env.NODE_ENV !== 'production') {
  providers.push(Credentials({
    id: 'test-bypass',
    name: 'Test bypass',
    credentials: { email: { label: 'Email', type: 'email' } },
    authorize: async (raw) => {
      const email = normalizeEmail(String(raw?.email ?? ''));
      return email.includes('@') ? findOrCreateUserByEmail(email) : null;
    },
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Built only when there is a database to adapt: the adapter inspects it.
  adapter: isAuthConfigured ? DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, verificationTokensTable: verificationTokens }) : undefined,
  // A year, so a reader who comes back to a topic months later is still signed in.
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 365 },
  trustHost: true,
  providers,
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** The signed-in reader's user id, or null if no one is signed in or sign-in is switched off. */
export async function currentUserId(): Promise<string | null> {
  if (!isAuthConfigured) return null;
  return (await auth())?.user?.id ?? null;
}
