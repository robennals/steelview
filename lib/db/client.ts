import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

/** A database with this site's schema: Neon in production, PGlite in tests. */
export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

export class DbNotConfiguredError extends Error {
  constructor() {
    super('DATABASE_URL is not set, so reader accounts and feedback are switched off');
    this.name = 'DbNotConfiguredError';
  }
}

const url = process.env.DATABASE_URL;
const real: DB | null = url ? drizzle({ client: neon(url), schema }) : null;

/**
 * True when the database is wired. Without it the site still renders, with
 * no sign-in and no feedback: content development and the browser tests need
 * no database.
 */
export const isDbConfigured = real !== null;

/** The database. Unconfigured, any use of it throws `DbNotConfiguredError`, so check `isDbConfigured` first. */
export const db: DB = real ?? new Proxy({} as DB, {
  get() {
    throw new DbNotConfiguredError();
  },
});
