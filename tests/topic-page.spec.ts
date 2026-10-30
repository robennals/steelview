import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the report `immigration-against-the-long-run`, and
// the viewpoint `open-and-build` with the link text it uses for
// `work-and-study-routes`. Editing any of that content's wording or
// cross-references will turn this suite red.

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
// with nothing opened and no JavaScript involved.
test('the Facts list states every claim without opening anything', async ({ page }) => {
  await page.goto(TOPIC);
  const first = page.locator('.sv-fact').first();
  await expect(first.locator('.sv-item__claim').first()).toBeVisible();
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

test('a viewpoint makes its supporting data available inline', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-open-and-build');
  await viewpoint.locator('summary .sv-item__claim').first().click();
  const dataLink = viewpoint.getByRole('link', {
    name: 'About a fifth of NHS staff in England are not British, and over a third of doctors',
    exact: true,
  });
  await expect(dataLink).toBeVisible();
  await dataLink.click();
  await expect(page.locator('dialog.sv-modal #sv-modal-title')).toContainText('Work and Study Visas and the Care Workforce');
});
