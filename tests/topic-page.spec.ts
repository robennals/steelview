import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the headline fact
// `non-citizens-share-of-convictions-and-prisons`, the supporting fact
// `net-migration-peak-and-fall` (body text "Net migration in YE December 2025
// was 171,000") and the headline fact `immigration-against-the-long-run` it
// supports, the viewpoint
// `a-country-should-decide-who-joins-it`, and the facts it
// cites/acknowledges — claims "Net
// migration to the UK peaked at 944,000 in the year to March 2023" and
// "Health and care is the sector most dependent on migrant labour". Editing
// any of that content's wording or cross-references will turn this suite red.
test('the topic page shows all four sections', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  for (const section of ['Facts', 'Viewpoints', 'Principles', 'Cruxes']) {
    await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
  }
});

test('a fact is collapsed until it is expanded', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  // This headline fact sits past the third, so it is behind the Facts collapse.
  await page.locator('details.sv-more > summary').click();
  const fact = page.locator('#fact-non-citizens-share-of-convictions-and-prisons');
  await expect(fact).toBeVisible();
  const body = fact.getByText('It is not a measurement of offending', { exact: false });
  await expect(body).toBeHidden();
  await fact.locator('summary').first().click();
  await expect(body).toBeVisible();
});

// Facts are two levels: headline claims in the list, and the facts that are
// evidence for them inside. A supporting fact must not appear as a top-level
// row, and must be reachable by opening the claim it supports.
test('a supporting fact is reached through the headline fact it supports', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const parent = page.locator('#fact-immigration-against-the-long-run');
  const child = page.locator('#fact-net-migration-peak-and-fall');
  await expect(child).toBeHidden();

  await parent.locator('summary').first().click();
  await expect(child).toBeVisible();
  await expect(child).toHaveClass(/sv-subfact/);

  const quote = child.getByText('Net migration in YE December 2025 was 171,000', { exact: false });
  await expect(quote).toBeHidden();
  await child.locator('summary').click();
  await expect(quote).toBeVisible();
});

test('a viewpoint lists the facts it builds on and accepts', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
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
