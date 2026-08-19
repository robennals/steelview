import { test, expect } from '@playwright/test';

test('loading a fact anchor opens that fact', async ({ page }) => {
  await page.goto('/topics/example#fact-alpha');
  await expect(page.locator('#fact-alpha')).toHaveAttribute('open', '');
  await expect(page.locator('#fact-alpha').getByText('A study of alpha')).toBeVisible();
});

test('clicking a cross-reference chip opens the fact it points at', async ({ page }) => {
  await page.goto('/topics/example');
  const one = page.locator('#viewpoint-one');
  await one.getByText('The first viewpoint, in a line.').click();
  await one.getByRole('link', { name: 'Gamma is established' }).click();
  await expect(page.locator('#fact-gamma')).toHaveAttribute('open', '');
});

test('other items stay closed', async ({ page }) => {
  await page.goto('/topics/example#fact-alpha');
  await expect(page.locator('#fact-beta')).not.toHaveAttribute('open', '');
});
