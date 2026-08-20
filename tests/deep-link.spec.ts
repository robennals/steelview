import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the fact
// `net-migration-peak-and-fall` (body text "Net migration in YE December
// 2025 was 171,000."), the fact `public-opinion-on-immigration`, the
// viewpoint `restore-control`, and the fact `health-and-care-relies-on-migrant-workers`
// (claim "Health and care is the sector most dependent on migrant labour")
// that restore-control cites. Editing any of that content's wording, ids, or
// cross-references will turn this suite red. The malformed-hash test also
// names `asylum-accommodation-cost-overrun`, which is one of the first three
// facts and so renders outside the Facts collapse.

// `net-migration-peak-and-fall` sits past the third fact, so it is inside the
// collapsed group: the anchor has to reveal the group as well as open the
// fact, or the link scrolls to something the reader cannot see.
test('loading a fact anchor opens that fact, and the group hiding it', async ({ page }) => {
  await page.goto('/topics/uk-immigration#fact-net-migration-peak-and-fall');
  await expect(page.locator('details.sv-more')).toHaveAttribute('open', '');
  await expect(page.locator('#fact-net-migration-peak-and-fall')).toHaveAttribute('open', '');
  await expect(page.locator('#fact-net-migration-peak-and-fall')).toBeVisible();
  await expect(
    page
      .locator('#fact-net-migration-peak-and-fall')
      .getByText('Net migration in YE December 2025 was 171,000.', { exact: false })
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
  // The cited fact is also inside the collapsed group, so following the chip
  // has to reveal the group too.
  await expect(page.locator('#fact-health-and-care-relies-on-migrant-workers')).toBeVisible();
});

test('other items stay closed', async ({ page }) => {
  await page.goto('/topics/uk-immigration#fact-net-migration-peak-and-fall');
  await expect(page.locator('#fact-public-opinion-on-immigration')).not.toHaveAttribute('open', '');
});

// A page that works without JavaScript must not be destroyed by its
// JavaScript: `decodeURIComponent` throws on a malformed escape like `%zz`,
// and an uncaught throw in hash-sync's mount effect would otherwise replace
// the already-delivered static HTML with Next's default error boundary.
test('a malformed hash does not break the page', async ({ page }) => {
  await page.goto('/topics/uk-immigration#%zz');
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  await expect(page.locator('#fact-asylum-accommodation-cost-overrun')).toBeVisible();
});
