import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// `vercel env pull` writes the Neon connection strings here.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  // Migrations run over a direct connection, not the pooled one the site uses.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '' },
});
