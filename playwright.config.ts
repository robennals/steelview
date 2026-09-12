import { defineConfig } from '@playwright/test';

// The port is configurable so a stray dev server on 3000 cannot silently
// serve stale content to the suite: `PORT=3111 pnpm test:e2e` starts and
// tests its own build.
const PORT = process.env.PORT ?? '3000';
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
