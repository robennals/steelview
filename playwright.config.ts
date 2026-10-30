import { defineConfig } from '@playwright/test';

// The port is configurable so a stray dev server on 3000 cannot silently
// serve stale content to the suite: `PORT=3111 pnpm test:e2e` starts and
// tests its own build.
const PORT = process.env.PORT ?? '3000';
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  // The site is prebuilt, so an element that has not appeared within 3s is not
  // coming. Without actionTimeout a click on a missing element waits out the
  // whole test, and without fullyParallel every failure in a spec file waits
  // on one worker. A broken run holds up every other thread on the machine,
  // so it should fail fast. `timeout` only catches a test that genuinely hangs.
  fullyParallel: true,
  timeout: 15_000,
  expect: { timeout: 3_000 },
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL, actionTimeout: 3_000 },
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
