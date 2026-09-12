import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the supporting
// facts `immigration-shifted-from-eu-to-non-eu` (status well-supported) and
// `public-opinion-on-immigration` (status complicated). Narrowing either
// fact's status will turn this suite red.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;

test('the topic page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(TOPIC);
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test('a fact page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(factUrl('immigration-against-the-long-run'));
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

// Status is announced in text wherever a fact appears: on a headline row in
// the list, and on a supporting fact's own page — the list itself carries
// only headline claims now, so a supporting fact's status is checked where
// it actually renders.
test('every fact status is announced in text, not colour alone', async ({ page }) => {
  await page.goto(factUrl('immigration-shifted-from-eu-to-non-eu'));
  await expect(
    page.locator('.sv-factpage__head').getByText('Well supported', { exact: true })
  ).toBeVisible();

  await page.goto(factUrl('public-opinion-on-immigration'));
  await expect(
    page.locator('.sv-factpage__head').getByText('Complicated', { exact: true })
  ).toBeVisible();
});
