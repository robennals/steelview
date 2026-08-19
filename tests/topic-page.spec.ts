import { test, expect } from '@playwright/test';

test('the topic page shows all four sections', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  for (const section of ['Facts', 'Viewpoints', 'Principles', 'Cruxes']) {
    await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
  }
});

test('a fact is collapsed until it is expanded', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const fact = page.locator('#fact-net-migration-peak-and-fall');
  await expect(fact).toBeVisible();
  const quote = fact.getByText('Net migration in YE December 2025 was 171,000');
  await expect(quote).toBeHidden();
  await fact.locator('summary').click();
  await expect(quote).toBeVisible();
});

test('a viewpoint lists the facts it builds on and accepts', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const viewpoint = page.locator('#viewpoint-restore-control');
  await viewpoint.locator('summary').click();
  await expect(
    viewpoint.getByRole('link', {
      name: 'Net migration to the UK peaked at 944,000 in the year to March 2023',
    })
  ).toBeVisible();
  await expect(
    viewpoint.getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    })
  ).toBeVisible();
});
