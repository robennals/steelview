import { test, expect } from '@playwright/test';

test('the topic page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/example');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test('every fact status is announced in text, not colour alone', async ({ page }) => {
  await page.goto('/topics/example');
  await expect(page.locator('#fact-alpha').getByText('Well supported')).toBeVisible();
  await expect(page.locator('#fact-beta').getByText('Complicated')).toBeVisible();
});
