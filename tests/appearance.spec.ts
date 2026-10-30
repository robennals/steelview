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

// Depends on authored uk-immigration content: the fact
// `crime-terrorism-and-group-exploitation` has a seven-column markdown table.
test('a wide prose table scrolls in its own box, not the page, and its headers do not run together', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/uk-immigration/facts/crime-terrorism-and-group-exploitation');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);

  const wrapper = page.locator('.prose-body .sv-prose-table').first();
  await expect(wrapper).toHaveAttribute('role', 'region');
  await expect(wrapper).toHaveAttribute('tabindex', '0');
  expect(await wrapper.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);

  const headers = wrapper.locator('thead th');
  const first = await headers.nth(0).boundingBox();
  const second = await headers.nth(1).boundingBox();
  if (!first || !second) throw new Error('expected header cells to be laid out');
  // The first cell's padding is the only gap between the two texts, so
  // measure from the end of its text box, not its border box.
  const firstTextRight = await headers.nth(0).evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().right;
  });
  expect(second.x - firstTextRight).toBeGreaterThanOrEqual(8);
});
