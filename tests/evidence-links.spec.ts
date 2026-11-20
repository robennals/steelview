import { test, expect } from './hydrated-test';
import { openChart } from './topic-rows';
const topic = '/topics/uk-immigration';
const longRun = 'immigration-against-the-long-run';

test('a topic page on a phone does not overflow sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(topic);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

// A viewpoint's claims are plain text: its only marks are footnote markers,
// which open the sources' own words, never a pop-up of ours.
test('a viewpoint\'s claims are plain text with footnote markers, not links', async ({ page }) => {
  await page.goto(topic);
  await expect(page.locator('.sv-row--viewpoint .sv-deck__card a.sv-cite:not(.sv-walk__explore a)')).toHaveCount(0);
  await expect(page.locator('.sv-row--viewpoint .sv-deck__card a.sv-source-marker')).not.toHaveCount(0);
});

// Data collections have no pages of their own: an old address goes to its topic.
test('an old data-collection address goes to its topic page', async ({ page }) => {
  await page.goto(`${topic}/facts/net-migration-peak-and-fall`);
  await expect(page).toHaveURL(new RegExp(`${topic}$`));
  await page.goto(`${topic}/facts/asylum-grant-rate-fell`);
  await expect(page).toHaveURL(/\/topics\/uk-asylum$/);
});

test('a chart\'s sources row links to the source itself', async ({ page }) => {
  const chart = await openChart(page, longRun, 'series');
  await expect(chart).toBeVisible();
  const sheet = page.locator('dialog.sv-modal[open]');
  await sheet.locator('.sv-chart__about > summary').first().click();
  await sheet.locator('.sv-chart__sources > summary').first().click();
  await expect(sheet.locator('.sv-chart__sources a').first()).toHaveAttribute('href', /^https?:/);
});

// Depends on authored us-vote-by-mail content: mail ballots' share of turnout
// in every state, DC and the national figure.
test('a comparison shows every one of its rows, with details collapsed', async ({ page }) => {
  const chart = await openChart(page, 'mail-voting-use-and-effects', 'state-mail-share', '/topics/us-vote-by-mail');
  await expect(chart.locator('.sv-comparison__rows > li')).toHaveCount(53);
  await expect(chart).toContainText('California');
  await expect(chart.locator('.sv-row-detail[open]')).toHaveCount(0);
});

// Depends on authored us-voter-id content: Georgia's SB 202 poll, whose
// controls pick one answer or all three stacked.
test('a comparison\'s controls change its bars, and "All" shows every component', async ({ page }) => {
  const chart = await openChart(page, 'opinion-and-confidence-in-elections', 'sb202-effect-on-confidence', '/topics/us-voter-id');
  const democrats = chart.locator('.sv-comparison__rows > li').filter({ hasText: 'Democrats' });
  await expect(chart.getByRole('button', { name: 'All answers', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(democrats.locator('.sv-comparison__bar')).toHaveCount(3);
  await chart.getByRole('button', { name: 'Decreased confidence', exact: true }).click();
  await expect(chart.getByRole('button', { name: 'Decreased confidence', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(democrats).toContainText('46.8%');
  await expect(democrats.locator('.sv-comparison__bar')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Don\'t know', exact: true }).click();
  await expect(democrats).toContainText('24.1%');
  await chart.getByRole('button', { name: 'All answers', exact: true }).click();
  await expect(democrats.locator('.sv-comparison__bar')).toHaveCount(3);
});

// A definition opened inside a chart's sheet closes on its own, leaving the sheet open.
test('a glossary popup closes on Escape and gives focus back', async ({ page }) => {
  const chart = await openChart(page, longRun, 'series');
  const term = chart.getByRole('button', { name: 'Immigration', exact: true }).filter({ visible: true }).first();
  await term.focus();
  await page.keyboard.press('Enter');
  const popup = page.getByRole('dialog', { name: 'Gross Arrivals', exact: true }).filter({ visible: true });
  await expect(popup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(term).toBeFocused();
  await expect(chart).toBeVisible();
});

test('a glossary popup fits a narrow screen and closes on a tap outside it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const chart = await openChart(page, longRun, 'series');
  await chart.getByRole('button', { name: 'Immigration', exact: true }).filter({ visible: true }).first().click();
  const popup = page.getByRole('dialog', { name: 'Gross Arrivals' }).filter({ visible: true });
  await expect(popup).toBeVisible();
  const box = await popup.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.locator('dialog.sv-modal .sv-modal__title').click();
  await expect(popup).toHaveCount(0);
  await expect(chart).toBeVisible();
});

// Depends on authored us-vote-by-mail content: estimates of mail-voting
// rules' effects, each row naming the study it comes from.
test('a chart row opens to its detail by keyboard, and its source links work from there', async ({ page }) => {
  const chart = await openChart(page, 'mail-voting-use-and-effects', 'effect-estimates', '/topics/us-vote-by-mail');
  await expect(chart.getByText('Select a row for its details')).toHaveCount(1);
  const row = chart.locator('.sv-row-detail').first();
  const source = row.getByRole('link', { name: /Proceedings of the National Academy of Sciences/ });
  await expect(source).toBeHidden();
  await row.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(row).toHaveAttribute('open', '');
  await expect(source).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(source).toBeHidden();
});

test('Ukraine is a separate line in net migration by route', async ({ page }) => {
  const graph = await openChart(page, longRun, 'routes');
  await expect(graph.locator('.sv-chart__legend')).toContainText('Ukraine scheme');
});
