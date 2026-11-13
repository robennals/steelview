import type { Page } from '@playwright/test';
import { test, expect } from './hydrated-test';
import { openChart } from './topic-rows';

// Depends on authored uk-immigration content: the headline fact
// `immigration-against-the-long-run` carries the ONS 1964–2025 series, with
// two readings (people, share of population) and three annotated breaks.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;
const HEADLINE = 'immigration-against-the-long-run';

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  // The whole point of server-rendered SVG: the chart is markup, so it is
  // there for a reader with no JavaScript, and so is every number behind it.
  // The fact's own page is exactly where such a reader arrives, having
  // followed an ordinary link from the topic page.
  test('the chart and its numbers are in the page without any script', async ({ page }) => {
    await page.goto(factUrl(HEADLINE));
    const fact = page.locator('article.sv-factpage');

    // One step of the data panel per reading, each drawn in place.
    const charts = fact.locator('.sv-walk__slide .sv-chart__reading .sv-chart__svg[data-variant="narrow"]');
    expect(await charts.count()).toBeGreaterThan(2);

    // Each plot is an image with a name and a description, both real elements
    // the SVG points at rather than an attribute a sighted reader cannot check.
    const plot = charts.first();
    await expect(plot).toHaveAttribute('role', 'img');
    await expect(plot).toHaveAttribute(
      'aria-label',
      /UK immigration, emigration and net migration, 1964.2025 . UK Migration Over Time/
    );
    const descId = await plot.getAttribute('aria-describedby');
    await expect(fact.locator(`#${descId}`)).toHaveText(/definitional breaks/);

    // The Graph/Table switch needs script, so each reading's table sits in a
    // collapsed disclosure instead.
    const table = fact.locator(`#${HEADLINE}--chart-people .sv-chart__data`).first();
    await table.locator('> summary').click();
    // Every published year, not a sample: 1964–2025 inclusive.
    await expect(table.locator('tbody tr')).toHaveCount(62);
    await expect(table.locator('tbody tr').first().locator('th')).toHaveText('1964');
    await expect(table.locator('tbody tr').last().locator('th')).toHaveText('2025');
  });
});

test('the chart marks the breaks rather than smoothing them', async ({ page }) => {
  const chart = await openChart(page, HEADLINE, 'people');
  await expect(chart.locator('.sv-chart__range')).toContainText('Full published range: 1964–2025');

  // Three definitional breaks, each marked on the plot as a measurement change.
  const visiblePlot = chart.locator('.sv-chart__svg:visible').first();
  await expect(visiblePlot.locator('.sv-chart__marker-line[data-kind="method"]')).toHaveCount(3);
  // A line crossing a break is cut and bridged, never drawn straight through.
  await expect(visiblePlot.locator('.sv-chart__bridge').first()).toBeAttached();
});

// Depends on authored us-voter-id content: the fact
// `voter-id-rules-in-the-us-and-abroad` carries the NCSL 1950–2026 series
// (reading `states-with-id`) with five dated events, each with a note.
const VOTER_ID_FACT = '/topics/us-voter-id/facts/voter-id-rules-in-the-us-and-abroad';
const markersOn = (page: Page) => page.locator('.sv-markers:visible button.sv-markers__marker');
const openCard = (page: Page) => page.locator('.sv-marker-card:popover-open');

test('events stay out of the way until a number is chosen, and then show one at a time', async ({ page }) => {
  await page.goto(VOTER_ID_FACT);
  await expect(markersOn(page).first()).toBeVisible();
  await expect(openCard(page)).toHaveCount(0);
  await expect(page.locator('.sv-marker-card').first()).toBeHidden();

  await markersOn(page).first().click();
  await expect(openCard(page)).toHaveCount(1);
  await expect(openCard(page)).toContainText('South Carolina asks voters for a document');

  await markersOn(page).nth(3).click();
  await expect(openCard(page)).toHaveCount(1);
  await expect(openCard(page)).not.toContainText('South Carolina');

  await page.keyboard.press('Escape');
  await expect(openCard(page)).toHaveCount(0);
});

test('choosing a number moves nothing on the page', async ({ page }) => {
  await page.goto(VOTER_ID_FACT);
  const marker = markersOn(page).nth(1);
  await marker.scrollIntoViewIfNeeded();
  const scroll = () => page.evaluate(() => [...document.querySelectorAll('*')].map(el => el.scrollTop).filter(Boolean).concat(window.scrollY).join());
  const before = await scroll();
  const box = await marker.boundingBox();
  await marker.click();
  await expect(openCard(page)).toHaveCount(1);
  expect(await scroll()).toBe(before);
  expect(await marker.boundingBox()).toEqual(box);
  expect(new URL(page.url()).hash).toBe('');
});

test('the chosen marker\'s dotted line lights up, and its card stays beside the markers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.goto(VOTER_ID_FACT);
  const single = markersOn(page).filter({ hasNotText: '–' }).nth(1);
  await single.scrollIntoViewIfNeeded();
  await single.click();
  await expect(page.locator('.sv-chart__svg:visible .sv-chart__marker-line[data-marker-shown]')).toHaveCount(1);
  const lane = page.locator('.sv-markers:visible').first();
  const gap = async () => (await openCard(page).boundingBox())!.y - (await lane.boundingBox())!.y;
  const placed = await gap();
  expect(placed).toBeGreaterThanOrEqual((await lane.boundingBox())!.height);
  // The card follows its marker as the page scrolls.
  await page.evaluate(() => window.scrollBy(0, 40));
  await expect.poll(gap).toBeCloseTo(placed, 0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-marker-shown]')).toHaveCount(0);
});

test('every marker sits exactly under its dotted line, or a group\'s between its lines, at both widths', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(VOTER_ID_FACT);
    const misses = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.sv-chart__frame .sv-markers__marker')]
      .filter(el => el.getClientRects().length > 0)
      .map(el => {
        const marker = el.getBoundingClientRect();
        const centre = marker.left + marker.width / 2;
        const lines = el.dataset.markerLine!.split(' ').map(n => el.closest('.sv-chart__frame')!.querySelector(`line[data-marker-line="${n}"]`)!.getBoundingClientRect().left);
        // A wide marker at the chart's edge is moved in until it fits.
        const frame = el.closest('.sv-chart__frame')!.getBoundingClientRect();
        if (marker.left <= frame.left + 1 || marker.right >= frame.right - 1) return 0;
        // How far the marker's centre is outside the span of its lines.
        return Math.max(0, Math.min(...lines) - centre, centre - Math.max(...lines));
      }));
    expect(misses.length).toBeGreaterThan(0);
    expect(Math.max(...misses)).toBeLessThan(1);
  }
});

test('markers that would collide are one marker, offering a choice, in a single row', async ({ page }) => {
  await page.goto(VOTER_ID_FACT);
  const lanes = await page.locator('.sv-markers:visible').evaluateAll(all => all.map(lane => lane.getBoundingClientRect().height));
  expect(new Set(lanes).size).toBe(1);
  const group = markersOn(page).filter({ hasText: '–' }).first();
  await group.scrollIntoViewIfNeeded();
  await group.click();
  const choices = openCard(page).locator('.sv-marker-choice');
  expect(await choices.count()).toBeGreaterThan(1);
  await expect(openCard(page).locator('.sv-marker-choice[open]')).toHaveCount(0);
  const lit = page.locator('.sv-chart__svg:visible .sv-chart__marker-line[data-marker-shown]');
  await expect(lit).toHaveCount(await choices.count());
  await choices.nth(1).locator('summary').click();
  await expect(openCard(page).locator('.sv-marker-choice[open]')).toHaveCount(1);
  await expect(lit).toHaveCount(1);
  await choices.nth(0).locator('summary').click();
  await expect(choices.nth(1)).not.toHaveAttribute('open');
  await expect(lit).toHaveCount(1);
});

test('a focus-window chart keeps its plot, with its markers under it', async ({ page }) => {
  await page.goto('/topics/us-iran-war/facts/oil-shipping-and-prices');
  const frame = page.locator('[data-focus-view="window"] .sv-chart__frame:visible').first();
  await expect(frame).toBeVisible();
  expect((await frame.boundingBox())!.width).toBeGreaterThan(400);
});

test('a measurement change opens the same way, named as what it is', async ({ page }) => {
  await page.goto('/topics/uk-immigration/facts/immigration-against-the-long-run');
  const marker = page.locator('.sv-markers:visible button.sv-markers__marker[data-kind="method"]').first();
  await marker.click();
  await expect(openCard(page)).toHaveAttribute('data-kind', 'method');
  await expect(openCard(page)).toContainText('Measurement change');
  await expect(openCard(page).locator('a').first()).toHaveAttribute('href', /.+/);
});
