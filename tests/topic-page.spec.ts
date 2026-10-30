import { test, expect } from '@playwright/test';
import { exploreLink, headCorner, openViewpoint } from './topic-rows';

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
  await row.locator('.sv-row__toggle').click(headCorner);
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

// A closed row's thumbnails are a way in: each opens the row at its own step.
test('a thumbnail opens a data row at that chart', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-walk__thumb').nth(2).click();
  await expect(row).toHaveAttribute('data-open', 'true');
  await expect(row.locator('.sv-walk__tab').nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(row.locator('.sv-walk__slide').nth(2)).toBeInViewport({ ratio: 0.5 });
});

test('the "more" tile opens a data row at the first chart it stands for', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-walk__thumb', { hasText: 'more' }).click();
  await expect(row.locator('.sv-walk__tab').nth(6)).toHaveAttribute('aria-current', 'step');
});

test('a thumbnail opens a viewpoint at that step', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  await row.locator('.sv-walk__thumb').nth(3).click();
  await expect(row.locator('.sv-walk__outline-step').nth(3)).toHaveAttribute('aria-current', 'step');
  await expect(row.locator('.sv-walk__slide').nth(3)).toBeInViewport({ ratio: 0.5 });
});

test('a thumbnail still moves the row after it was closed on another step', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  const thumb = row.locator('.sv-walk__thumb').nth(3);
  await thumb.click();
  await row.locator('.sv-walk__outline-step').first().click();
  await row.locator('.sv-row__toggle').click(headCorner);
  await thumb.click();
  await expect(row.locator('.sv-walk__outline-step').nth(3)).toHaveAttribute('aria-current', 'step');
});

test('a keyboard reader keeps their place when a thumbnail opens the row', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  const thumb = row.locator('.sv-walk__thumb').nth(1);
  await thumb.focus();
  await page.keyboard.press('Enter');
  await expect(row.locator('.sv-row__toggle')).toBeFocused();
});
