import { test as base, expect } from '@playwright/test';

// Every test's goto returns once the page can respond. A click or key press
// before hydration is lost, and whatever a test adds to the page is removed.
export const test = base.extend({
  page: async ({ page, javaScriptEnabled }, runTest) => {
    const goto = page.goto.bind(page);
    page.goto = async (...args) => {
      const response = await goto(...args);
      if (javaScriptEnabled !== false) await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
      return response;
    };
    await runTest(page);
  },
});

export { expect };
