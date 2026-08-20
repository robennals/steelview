import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the headline fact
// `non-citizens-share-of-convictions-and-prisons`, the supporting fact
// `net-migration-peak-and-fall` and the headline fact
// `immigration-against-the-long-run` it supports, the viewpoint
// `a-country-should-decide-who-joins-it`, and the facts it
// cites/acknowledges — claims "Net migration to the UK peaked at 944,000 in
// the year to March 2023" and "Health and care is the sector most dependent on
// migrant labour". Editing any of that content's wording or cross-references
// will turn this suite red.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;

test('the topic page shows all four sections', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  for (const section of ['Facts', 'Viewpoints', 'Principles', 'Cruxes']) {
    await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
  }
});

// The list is a set of claims a reader can skim: every row states its claim
// and its status with nothing opened, and no JavaScript involved in either.
test('the Facts list states every claim and status without opening anything', async ({ page }) => {
  await page.goto(TOPIC);
  const first = page.locator('.sv-fact').first();
  await expect(first.locator('.sv-item__claim').first()).toBeVisible();
  await expect(first.locator('.sv-status').first()).toBeVisible();
  await expect(first.locator('.sv-status').first()).toHaveText('Well supported');
  // The context behind a claim is not in the list — it is at the fact's URL.
  await expect(page.getByText('It is not a measurement of offending', { exact: false })).toHaveCount(
    0
  );
});

// Facts are two levels: headline claims, and the facts that are evidence for
// them. A supporting fact must not be a top-level row, and the reader must be
// able to see which detail carries which claim without following a link.
test('a supporting fact is listed under the headline fact it supports', async ({ page }) => {
  await page.goto(TOPIC);
  const parent = page.locator('.sv-fact', {
    has: page.locator(`a.sv-factrow[href="${factUrl('immigration-against-the-long-run')}"]`),
  });
  const child = parent.locator(`a.sv-factrow[href="${factUrl('net-migration-peak-and-fall')}"]`);
  await expect(child).toBeVisible();
  await expect(parent.locator('.sv-factlist__childlabel')).toHaveText('Supporting fact');
  // …and it is not one of the top-level rows.
  await expect(
    page.locator(`.sv-factlist > .sv-fact > a[href="${factUrl('net-migration-peak-and-fall')}"]`)
  ).toHaveCount(0);
});

test('a viewpoint lists the facts it builds on and accepts', async ({ page }) => {
  await page.goto(TOPIC);
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
