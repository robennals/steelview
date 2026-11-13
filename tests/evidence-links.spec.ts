import { test, expect } from './hydrated-test';
import { openChart } from './topic-rows';
const topic = '/topics/uk-immigration';
const fact = 'immigration-economy-and-public-finances';
const longRun = 'immigration-against-the-long-run';

test('a topic page on a phone does not overflow sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(topic);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('a pill remains an ordinary link to its evidence section', async ({ page }) => {
    await page.goto(topic);
    const link = page.locator(`.sv-row--viewpoint a[href*="/facts/${fact}#"]`).first();
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator(`#${href!.split('#')[1]}`)).toBeVisible();
  });
});


test('a source\'s address lands on that source', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run#source-immigration-against-the-long-run-13`);
  const source = page.locator('[data-source-id="source-immigration-against-the-long-run-13"].sv-target');
  await expect(source).toBeVisible();
  await expect(source).toBeInViewport();
});

test('a chart\'s sources row links to the source itself on the report\'s own page, as in its row', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  await page.locator('.sv-chart__sources > summary').first().click();
  await expect(page.locator('.sv-chart__sources a').first()).toHaveAttribute('href', /^https?:/);
});

test('opening graphs include all asylum comparators and details remain collapsed', async ({ page }) => {
  await page.goto('/topics/uk-asylum/facts/asylum-claims-and-decisions');
  const chart = page.locator('#asylum-claims-and-decisions--chart-per-head-2025');
  await expect(chart.locator('.sv-comparison__rows > li')).toHaveCount(32);
  await expect(chart).toContainText('United Kingdom');
  await expect(page.getByRole('heading', { name: 'Context', exact: true })).toHaveCount(0);
  await expect(page.locator('.sv-observation[open]')).toHaveCount(0);
});

test('international migration comparison follows population share and includes all available EU/EFTA countries', async ({ page }) => {
  const chart = await openChart(page, longRun, 'international-immigration');
  await expect(chart.locator('.sv-comparison__rows > li')).toHaveCount(31);
  await expect(chart).toContainText('United Kingdom');
  await expect(chart.locator('.sv-comparison__rows')).toContainText('1.13%');
  await chart.getByRole('button', { name: 'All arrivals', exact: true }).click();
  await expect(chart.locator('.sv-comparison__rows')).toContainText('1.46%');
});

test('a glossary popup closes on Escape and gives focus back', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run#immigration-against-the-long-run--international-differences`);
  const term = page.getByRole('button', { name: 'gross arrivals', exact: true }).filter({ visible: true }).first();
  await term.focus();
  await page.keyboard.press('Enter');
  const popup = page.getByRole('dialog', { name: 'Gross Arrivals', exact: true }).filter({ visible: true });
  await expect(popup.getByRole('button', { name: 'Close definition' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(term).toBeFocused();
});

test('glossary works without JavaScript on narrow screens and dismisses outside', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  await page.getByRole('button', { name: 'gross arrivals', exact: true }).first().click();
  const popup = page.getByRole('dialog', { name: 'Gross Arrivals' });
  await expect(popup).toBeVisible();
  const box = await popup.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.mouse.click(5, 5);
  await expect(popup).not.toBeVisible();
  await context.close();
});


test('a chart row opens to its detail by keyboard, and its source links work from there', async ({ page }) => {
  await page.goto('/topics/us-voter-id/facts/burdens-of-id-and-citizenship-rules');
  const chart = page.locator('[id="burdens-of-id-and-citizenship-rules--chart-turnout-overall"]');
  await expect(chart.getByText('Select a row for its details')).toHaveCount(1);
  const row = chart.locator('.sv-row-detail').first();
  const source = row.getByRole('link', { name: /National Bureau of Economic Research/ });
  await expect(source).toBeHidden();
  await row.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(row).toHaveAttribute('open', '');
  await expect(source).toBeVisible();
  await expect(row).toContainText('2008–2018');
  await page.keyboard.press('Enter');
  await expect(source).toBeHidden();
});

test('nationality comparisons change the country bars and show all components', async ({ page }) => {
  const chart = await openChart(page, longRun, 'international-immigration');
  const uk = chart.locator('.sv-comparison__rows > li').filter({ hasText: 'United Kingdom' });
  await expect(chart.getByRole('button', { name: 'Non-EU+ nationals', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(uk).toContainText('1.13%');
  await chart.getByRole('button', { name: 'EU+ nationals', exact: true }).click();
  await expect(uk).toContainText('0.13%');
  await chart.getByRole('button', { name: 'Own-country nationals', exact: true }).click();
  await expect(uk).toContainText('0.2%');
  await chart.getByRole('button', { name: 'All arrivals', exact: true }).click();
  await expect(uk.locator('.sv-comparison__bar')).toHaveCount(4);
  await expect(uk).toContainText('1.46%');
  const series = await openChart(page, longRun, 'nationality');
  await expect(series).toBeVisible();
  await expect(series.locator('.sv-chart__reading')).toHaveCount(1);
  await expect(page.locator('#immigration-shifted-from-eu-to-non-eu--chart-net')).toHaveCount(0);
});


test('net-migration peak is a graph observation, with its old URL redirected', async ({ page }) => {
  await page.goto(`${topic}/facts/net-migration-peak-and-fall`);
  await expect(page).toHaveURL(/immigration-against-the-long-run#immigration-against-the-long-run--net-migration-is-not-unusual-at-all$/);
  await expect(page.locator('.sv-target')).toContainText('944,000');
  await expect(page.locator('.sv-target')).toBeVisible();
  await expect(page.locator('.sv-chart__title')).toHaveCount(0);
});


test('nationality findings are linked observations, including the old fact URL', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-shifted-from-eu-to-non-eu`);
  await expect(page).toHaveURL(/immigration-against-the-long-run#immigration-against-the-long-run--nationality-shift$/);
  await expect(page.locator('.sv-target')).toContainText('627,000');
  await expect(page.locator('.sv-target')).toBeInViewport();
});

test('Ukraine is a separate line in net migration by route', async ({ page }) => {
  const graph = await openChart(page, longRun, 'net-by-route');
  await expect(graph.locator('.sv-chart__legend')).toContainText('Ukraine scheme');
});
