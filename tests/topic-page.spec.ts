import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the headline fact
// `non-citizens-share-of-convictions-and-prisons`, the supporting fact
// `immigration-shifted-from-eu-to-non-eu` and the headline fact
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
  for (const section of ['Data', 'Viewpoints', 'Principles', 'Cruxes']) {
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

// Regression pin: the Facts list used to render each headline fact's
// supporting facts inline — claim, status and a "Supporting fact" label —
// before the reader had opened anything. That content was not clickable (the
// row's link only covered the headline claim above it), so a reader clicking
// what looked like part of a fact got nothing, and a crawler indexed
// "supporting fact" text no link on the page actually led to. A row in the
// list is the claim and its status, nothing else: the supporting fact and its
// own address live on the parent fact's own reading, not in this list.
test('the Facts list shows no supporting fact before anything is opened', async ({ page }) => {
  await page.goto(TOPIC);
  const factsSection = page.locator('.sv-section', {
    has: page.getByRole('heading', { name: 'Data', level: 2 }),
  });

  // The supporting fact's own claim text is nowhere in the section...
  await expect(
    factsSection.getByText('Net migration in YE December 2025 was 171,000', { exact: false })
  ).toHaveCount(0);
  // ...and neither is any trace of the label that used to introduce it.
  await expect(factsSection.getByText('Supporting fact', { exact: false })).toHaveCount(0);
  await expect(factsSection.locator('.sv-subfact')).toHaveCount(0);
  // The headline fact it supports is still there, as an ordinary row.
  await expect(
    factsSection.locator(`a.sv-factrow[href="${factUrl('immigration-against-the-long-run')}"]`)
  ).toBeVisible();
});

test('a viewpoint lists the facts it builds on and accepts', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary .sv-item__claim').first().click();
  await viewpoint.locator('.sv-evidence-index > summary').click();
  await expect(
    viewpoint.getByRole('link', {
      name: 'UK Immigration Trends', exact: true,
    })
  ).toBeVisible();
  await expect(
    viewpoint.getByRole('link', {
      name: 'Immigration and the Health and Care Workforce', exact: true,
    })
  ).toBeVisible();
});
