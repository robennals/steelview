import { test, expect } from './hydrated-test';
import { headCorner, openTab } from './topic-rows';

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

// Depends on authored us-voter-id content: the proof-of-citizenship map, whose
// long category key does not fit a phone slide's 18rem with a readable map.
test('at phone width a figure too long for its slide grows, and draws its map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/us-voter-id');
  await openTab(page, 'Data');
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-row__toggle').click(headCorner);
  await row.locator('.sv-walk__tab', { hasText: 'proof-of-citizenship' }).click();
  const slide = row.locator('.sv-walk__slide[aria-label*="proof-of-citizenship"]');
  const chart = slide.locator('.sv-slide');
  await expect(slide.locator('.sv-tile-map__grid')).toBeVisible();
  const { overflow, height } = await chart.evaluate(el => ({ overflow: el.scrollHeight - el.clientHeight, height: el.clientHeight }));
  expect(overflow).toBeLessThanOrEqual(8);
  expect(height).toBeGreaterThan(288);
  const grid = await slide.locator('.sv-tile-map__grid').boundingBox();
  expect(grid!.width).toBeGreaterThan(200);
});

test('a fact page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(factUrl('immigration-against-the-long-run'));
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

// A row's charts load when it opens, so a load of the page alone never sees them.
// us-voter-id is the widest case: a row of many charts, each with a text description.
test('opening every row of a topic at phone width does not widen the page', async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/us-voter-id');
  for (const [tab, rows] of [['Viewpoints', '.sv-row--viewpoint'], ['Data', '.sv-row--data']] as const) {
    await openTab(page, tab);
    for (const row of await page.locator(rows).all()) {
      await row.locator('.sv-row__toggle').click(headCorner);
      await expect(row.locator('.sv-walk__chart-loading')).toHaveCount(0);
      // While a row's walkthrough slides in, its transform holds everything inside it.
      await row.evaluate(el => Promise.allSettled(el.getAnimations({ subtree: true }).map(a => a.finished)));
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflows).toBe(false);
    }
  }
});

// Depends on authored uk-immigration content: the fact
// `crime-terrorism-and-group-exploitation` has a seven-column markdown table.
test('a prose table sits in its own box, not the page, and its headers do not run together', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/us-voter-id/facts/voter-roll-maintenance#voter-roll-maintenance--mostly-moves-deaths-nonresponse');
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);

  const wrapper = page.locator('.sv-observe__item:not([hidden]) .prose-body .sv-prose-table').first();
  await expect(wrapper).toHaveAttribute('role', 'region');
  await expect(wrapper).toHaveAttribute('tabindex', '0');
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
