import { test, expect } from './hydrated-test';
import { headCorner, openViewpoint } from './topic-rows';

const TOPIC = '/topics/uk-immigration';

test('the topic page renders at phone width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(TOPIC);
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

// Depends on authored us-voter-id content: the viewpoint `states-decide`, whose
// third card is the map of voter ID rules by state.
test('at phone width a viewpoint card\'s map fits its slide, and draws its map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/us-voter-id');
  const row = await openViewpoint(page, 'states-decide');
  // A phone has no outline of the cards, so step to the third.
  for (let i = 0; i < 2; i++) await row.locator('.sv-deck__next').click();
  const chart = row.locator('.sv-deck__card').nth(2).locator('.sv-slide');
  await expect(chart.locator('.sv-tile-map__grid')).toBeVisible();
  const overflow = await chart.evaluate(el => el.scrollHeight - el.clientHeight);
  expect(overflow).toBeLessThanOrEqual(8);
  const grid = await chart.locator('.sv-tile-map__grid').boundingBox();
  expect(grid!.width).toBeGreaterThan(200);
});

// A row's charts load when it opens, so a load of the page alone never sees them.
// us-voter-id is the widest case: rows of many charts, each with a text description.
test('opening every row of a topic at phone width does not widen the page', async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/topics/us-voter-id');
  for (const row of await page.locator('.sv-row--viewpoint, .sv-row--crux').all()) {
    await row.locator('.sv-row__toggle').click(headCorner);
    await expect(row.locator('.sv-walk__chart-loading')).toHaveCount(0);
    // While a row's slides come in, its transform holds everything inside it.
    // Transitions only: a scrolling box's fade follows its scrolling, so never finishes.
    await row.evaluate(el => Promise.allSettled(el.getAnimations({ subtree: true }).filter(a => a instanceof CSSTransition).map(a => a.finished)));
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflows).toBe(false);
  }
});
