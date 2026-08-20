import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the supporting
// facts `net-migration-peak-and-fall` (status well-supported) and
// `public-opinion-on-immigration` (status complicated). Narrowing either
// fact's status will turn this suite red.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;
const row = (id: string) => `a.sv-factrow[href="${factUrl(id)}"]`;

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

// Status is announced in text wherever a fact appears — now including the
// list itself, where every claim carries its status without anything opened.
test('every fact status is announced in text, not colour alone', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(
    page.locator(row('net-migration-peak-and-fall')).getByText('Well supported', { exact: true })
  ).toBeVisible();

  // Facts past the third sit behind the Facts collapse, group and all.
  await page.locator('details.sv-more > summary').click();
  await expect(
    page.locator(row('public-opinion-on-immigration')).getByText('Complicated', { exact: true })
  ).toBeVisible();

  // And again on the fact's own page.
  await page.goto(factUrl('public-opinion-on-immigration'));
  await expect(
    page.locator('.sv-factpage__head').getByText('Complicated', { exact: true })
  ).toBeVisible();
});
