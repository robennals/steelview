import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { DB } from './client';
import * as schema from './schema';

/**
 * A fresh in-process Postgres with the checked-in migrations applied, so a
 * test runs against the schema production has. Each call is its own database;
 * tests must not share one.
 */
export async function createTestDb(): Promise<DB> {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'lib/db/migrations') });
  return db;
}
