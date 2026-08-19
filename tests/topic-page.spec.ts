import { test, expect } from '@playwright/test';

test('the topic page shows all four sections', async ({ page }) => {
  await page.goto('/topics/example');
  await expect(page.getByRole('heading', { name: 'Example', level: 1 })).toBeVisible();
  for (const section of ['Facts', 'Viewpoints', 'Principles', 'Cruxes']) {
    await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
  }
});

test('a fact is collapsed until it is expanded', async ({ page }) => {
  await page.goto('/topics/example');
  const alpha = page.locator('#fact-alpha');
  await expect(alpha).toBeVisible();
  await expect(alpha.getByText('A study of alpha')).toBeHidden();
  await alpha.locator('summary').click();
  await expect(alpha.getByText('A study of alpha')).toBeVisible();
});

test('a viewpoint lists the facts it builds on and accepts', async ({ page }) => {
  await page.goto('/topics/example');
  const one = page.locator('#viewpoint-one');
  await one.getByText('The first viewpoint, in a line.').click();
  await expect(one.getByRole('link', { name: 'Alpha is established' })).toBeVisible();
  await expect(one.getByRole('link', { name: 'Gamma is established' })).toBeVisible();
});
