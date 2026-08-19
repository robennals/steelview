import { test, expect } from '@playwright/test';

test('loading a fact anchor opens that fact', async ({ page }) => {
  await page.goto('/topics/uk-immigration#fact-net-migration-peak-and-fall');
  await expect(page.locator('#fact-net-migration-peak-and-fall')).toHaveAttribute('open', '');
  await expect(
    page
      .locator('#fact-net-migration-peak-and-fall')
      .getByText('Long-term international migration, provisional: year ending December 2025')
      .first()
  ).toBeVisible();
});

test('clicking a cross-reference chip opens the fact it points at', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const viewpoint = page.locator('#viewpoint-restore-control');
  await viewpoint.locator('summary').click();
  await viewpoint
    .getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    })
    .click();
  await expect(page.locator('#fact-health-and-care-relies-on-migrant-workers')).toHaveAttribute(
    'open',
    ''
  );
});

test('other items stay closed', async ({ page }) => {
  await page.goto('/topics/uk-immigration#fact-net-migration-peak-and-fall');
  await expect(page.locator('#fact-public-opinion-on-immigration')).not.toHaveAttribute('open', '');
});
