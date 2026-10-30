import { test, expect } from './hydrated-test';

const rows = (page: import('@playwright/test').Page) => page.locator('.sv-row');
const toggle = (page: import('@playwright/test').Page, n: number) => rows(page).nth(n).locator('.sv-row__toggle');

test('the home page links to each topic', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'UK immigration', exact: true });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/topics\/uk-immigration$/);
});

test('the masthead shows the full stop but names the site without it', async ({ page }) => {
  await page.goto('/');
  const wordmark = page.getByRole('link', { name: 'Steelview', exact: true });
  await expect(wordmark).toHaveText('Steelview.');
});

test('the page declares a favicon that can be fetched', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
  expect((await request.get(href ?? '')).status()).toBe(200);
});

test('the tagline links to the About page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every side of the argument, at its strongest.');
  await page.getByRole('link', { name: /What is Steelview\?/ }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test('the first topic starts open and its carousel steps through the charts', async ({ page }) => {
  await page.goto('/');
  await expect(rows(page).first()).toHaveAttribute('data-open', 'true');
  await expect(rows(page).nth(1)).not.toHaveAttribute('data-open', 'true');
  const carousel = rows(page).first().locator('.sv-carousel');
  await expect(carousel.locator('.sv-carousel__count')).toContainText('1 / 4');
  await carousel.getByRole('button', { name: 'Next chart' }).click();
  await expect(carousel.locator('.sv-carousel__count')).toContainText('2 / 4');
  await carousel.locator('.sv-carousel__strip').press('ArrowLeft');
  await expect(carousel.locator('.sv-carousel__count')).toContainText('1 / 4');
});

test('every row shows its tags', async ({ page }) => {
  await page.goto('/');
  for (const n of [0, 1, 2, 3]) await expect(rows(page).nth(n).locator('.sv-tag').first()).toBeVisible();
});

test('opening a row closes the open one, and clicking it again closes it', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await expect(rows(page).nth(1)).toHaveAttribute('data-open', 'true');
  await expect(rows(page).first()).not.toHaveAttribute('data-open', 'true');
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await expect(page.locator('.sv-row[data-open]')).toHaveCount(0);
});

test('rapid clicks on two rows leave only the last one open', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await toggle(page, 2).click({ position: { x: 400, y: 12 } });
  await expect(page.locator('.sv-row[data-open]')).toHaveCount(1);
  await expect(rows(page).nth(2)).toHaveAttribute('data-open', 'true');
});

test('the clicked row stays where it was while the row above it closes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  // Put the second row's head about 120px down the screen, with the open first
  // row above it.
  await page.evaluate(() => {
    const row = document.querySelectorAll('.sv-row')[1];
    window.scrollTo(0, row.getBoundingClientRect().top + window.scrollY - 120);
  });
  const before = (await rows(page).nth(1).boundingBox())!.y;
  // On screen, below the top, so the click itself scrolls nothing.
  expect(before).toBeGreaterThan(20);
  expect(before).toBeLessThan(600);
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await page.waitForTimeout(900);
  const after = (await rows(page).nth(1).boundingBox())!.y;
  expect(Math.abs(after - before)).toBeLessThan(4);
});

test('a row opens from the keyboard', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 1).focus();
  await page.keyboard.press('Enter');
  await expect(rows(page).nth(1)).toHaveAttribute('data-open', 'true');
  await expect(toggle(page, 1)).toHaveAttribute('aria-expanded', 'true');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a topic title still leads to its report', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'The US war with Iran', exact: true }).click();
    await expect(page).toHaveURL(/\/topics\/us-iran-war$/);
  });
});
