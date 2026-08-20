import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the headline
// fact `non-citizens-share-of-convictions-and-prisons`, the supporting fact
// `net-migration-peak-and-fall` (body text "Net migration in YE December
// 2025 was 171,000.") and the headline fact
// `immigration-against-the-long-run` it supports, the fact
// `public-opinion-on-immigration`, the
// viewpoint `a-country-should-decide-who-joins-it`, and the fact
// `health-and-care-relies-on-migrant-workers` (claim "Health and care is the
// sector most dependent on migrant labour") that that viewpoint cites. Editing any of that content's wording, ids, or
// cross-references will turn this suite red. The malformed-hash test also
// names `immigration-against-the-long-run`, which is the first fact in the
// derived diversity ranking (two viewpoints rank it first) and so renders
// outside the Facts collapse.

// A fact anchor now opens the shared fact panel (components/topic/fact-modal.tsx)
// rather than expanding the row in place: the fact element is moved into the
// dialog, so it is still the one element carrying that anchor. The collapsed
// Facts group no longer has to be revealed to show a fact behind it — the
// panel is above the whole page.
test('loading a fact anchor opens that fact in the panel', async ({ page }) => {
  const anchor = '#fact-non-citizens-share-of-convictions-and-prisons';
  await page.goto(`/topics/uk-immigration${anchor}`);
  await expect(page.locator(`dialog.sv-modal ${anchor}`)).toBeVisible();
  await expect(page.locator(anchor)).toHaveAttribute('open', '');
  await expect(
    page.locator(anchor).getByText('It is not a measurement of offending', { exact: false })
  ).toBeVisible();
});

// A supporting fact's `#fact-<id>` anchor is a permanent address, and it sits
// inside the headline fact it supports — so the anchor opens that parent's
// panel with the supporting fact expanded inside it.
test('loading a supporting fact anchor opens the headline fact holding it', async ({ page }) => {
  await page.goto('/topics/uk-immigration#fact-net-migration-peak-and-fall');
  await expect(
    page.locator('dialog.sv-modal #fact-immigration-against-the-long-run')
  ).toHaveAttribute('open', '');
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
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
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
  await expect(
    page.locator('dialog.sv-modal #fact-health-and-care-relies-on-migrant-workers')
  ).toBeVisible();
});

test('other items stay closed', async ({ page }) => {
  await page.goto('/topics/uk-immigration#fact-net-migration-peak-and-fall');
  await expect(page.locator('#fact-public-opinion-on-immigration')).not.toHaveAttribute('open', '');
});

// Anchors are permanent addresses and must keep working with no JavaScript to
// interpret them: the fact is still an element with that id, in the document,
// and the browser's own fragment navigation takes the reader to it.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a fact anchor still resolves to the fact in the list', async ({ page }) => {
    const anchor = '#fact-immigration-against-the-long-run';
    await page.goto(`/topics/uk-immigration${anchor}`);
    await expect(page.locator(anchor)).toHaveCount(1);
    await expect(page.locator(anchor)).toBeVisible();
    await expect(page.locator('dialog.sv-modal')).toBeHidden();
    // And it opens where it stands, with a click on its summary.
    await page.locator(`${anchor} > summary`).click();
    await expect(page.locator(anchor)).toHaveAttribute('open', '');
  });
});

// A page that works without JavaScript must not be destroyed by its
// JavaScript: `decodeURIComponent` throws on a malformed escape like `%zz`,
// and an uncaught throw in a mount effect would otherwise replace the
// already-delivered static HTML with Next's default error boundary.
test('a malformed hash does not break the page', async ({ page }) => {
  await page.goto('/topics/uk-immigration#%zz');
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  await expect(page.locator('#fact-immigration-against-the-long-run')).toBeVisible();
});
