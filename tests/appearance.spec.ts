import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the supporting
// facts `net-migration-peak-and-fall` (status well-supported) and
// `public-opinion-on-immigration` (status complicated), and the headline facts
// they support. Narrowing either fact's status, or re-parenting it, will turn
// this suite red.
test('the topic page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/uk-immigration');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test('every fact status is announced in text, not colour alone', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  // Both facts are supporting facts, so each is reached by opening the
  // headline fact it is evidence for; the second of those headline facts also
  // sits past the third, so it is behind the Facts collapse.
  await page.locator('#fact-immigration-against-the-long-run > summary').click();
  await expect(
    page.locator('#fact-net-migration-peak-and-fall').getByText('Well supported', { exact: true })
  ).toBeVisible();

  await page.locator('details.sv-more > summary').click();
  await page
    .locator('#fact-immigration-is-salient-and-objection-varies-by-route > summary')
    .click();
  await expect(
    page.locator('#fact-public-opinion-on-immigration').getByText('Complicated', { exact: true })
  ).toBeVisible();
});
