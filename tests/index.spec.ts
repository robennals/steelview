import { test, expect } from '@playwright/test';

test('the home page links to each topic', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /Example/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/topics\/example$/);
});
