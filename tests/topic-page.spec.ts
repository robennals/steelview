import { test, expect } from '@playwright/test';
import { exploreLink, openViewpoint } from './topic-rows';

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

// A closed row is a title and an overview: its charts load only when it opens.
test('a data collection loads its charts only when its row opens', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('.sv-row--data').first();
  await expect(row.locator('.sv-row__title')).toBeVisible();
  await expect(row.locator('.sv-row__body')).toHaveAttribute('inert', '');
  await expect(row.locator('.sv-slide .sv-chart')).toHaveCount(0);
  await row.locator('.sv-row__toggle').click();
  await expect(row.locator('.sv-row__body')).not.toHaveAttribute('inert', '');
  await expect(row.locator('.sv-slide .sv-chart').first()).toBeAttached();
});

test('a viewpoint makes its supporting data available inline', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'open-and-build');
  await viewpoint.locator('.sv-walk__outline-step').nth(1).click();
  const dataLink = viewpoint.locator('.sv-walk__explore a[data-fact-id="work-and-study-routes"]').first();
  await expect(dataLink).toBeVisible();
  await dataLink.click();
  await expect(page.locator('dialog.sv-modal #sv-modal-title')).toContainText('Work and Study Visas and the Care Workforce');
  await page.keyboard.press('Escape');
  await expect(exploreLink(viewpoint).locator('xpath=ancestor::article')).toHaveAttribute('data-open', 'true');
});
