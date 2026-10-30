import { defineConfig } from '@playwright/test';

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
  use: { channel: process.env.PLAYWRIGHT_CHANNEL, actionTimeout: 3_000 },
  // Every run tests the server it started, never one already listening: other
  // worktrees serve their own builds on 3000 and up. `pnpm start` takes the
  // first free port (or PORT, if set), and the address it prints becomes the
  // suite's base URL, because Playwright copies a named group from `wait` into
  // the environment variable of that name. It is built from a string because
  // tsconfig's ES2017 target rejects a named group in a regex literal.
  webServer: {
    command: 'pnpm build && pnpm start',
    wait: { stdout: new RegExp(String.raw`(?<PLAYWRIGHT_TEST_BASE_URL>http://localhost:\d+)[\s\S]*Ready in`) },
    timeout: 180_000,
  },
});
