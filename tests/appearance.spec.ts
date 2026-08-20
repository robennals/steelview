import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the fact ids
// `net-migration-peak-and-fall` (status well-supported) and
// `public-opinion-on-immigration` (status complicated). Narrowing either
// fact's status in content/ will turn this suite red.
test('the topic page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/uk-immigration');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test('every fact status is announced in text, not colour alone', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  // Both facts sit past the third, so they are behind the Facts collapse.
  await page.locator('details.sv-more > summary').click();
  await expect(
    page.locator('#fact-net-migration-peak-and-fall').getByText('Well supported', { exact: true })
  ).toBeVisible();
  await expect(
    page.locator('#fact-public-opinion-on-immigration').getByText('Complicated', { exact: true })
  ).toBeVisible();
});
