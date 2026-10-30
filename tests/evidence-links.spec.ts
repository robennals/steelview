import { test, expect } from '@playwright/test';
import { cruxCitation, openCollection } from './topic-rows';
const topic = '/topics/uk-immigration';
const fact = 'immigration-economy-and-public-finances';
const longRun = 'immigration-against-the-long-run';

test('a supporting finding opens inside its parent, including an uncached article', async ({ page }) => {
  await page.route(url => url.pathname.includes('/facts/'), async route => {
    if (route.request().headers()['rsc'] === '1') await new Promise(resolve => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto(topic);
  const link = await cruxCitation(page, fact);
  const href = (await link.getAttribute('href'))!;
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator('dialog .sv-target')).toHaveAttribute('id', href.split('#')[1]);
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
  await page.locator('dialog [data-viz-active] .sv-chart__credit a').first().click();
  await expect(page.locator('dialog .sv-target')).toHaveClass(/sv-source/);
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(topic);
  await expect(link).toBeFocused();
});

test('the same sheet can target another section and expand at that position', async ({ page }) => {
  await page.goto(topic);
  await (await cruxCitation(page, fact)).click();
  const expand = page.locator('.sv-modal__expand');
  // The sheet points Expand at the cited section once it has revealed it.
  await expect(expand).toHaveAttribute('href', /#/);
  const href = (await expand.getAttribute('href'))!;
  await expand.click();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(href);
  await expect(page.locator('.sv-target')).toHaveAttribute('id', href.split('#')[1]);
  await expect(page.locator('.sv-target')).toBeInViewport();
});

test('charts have their own observations, with references last', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const credits = page.locator('#immigration-against-the-long-run--chart-series .sv-chart__credit a');
  await expect(credits).toHaveCount(2);
  await expect(credits.first()).toContainText('Office for National Statistics');
  const order = await page.locator('article').evaluate(article => {
    const chart = article.querySelector('.sv-chart')!;

    const refs = article.querySelector('.sv-references')!;
    return Boolean(chart.compareDocumentPosition(refs) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  await expect(page.getByRole('heading', { name: 'Subtleties', exact: true })).toHaveCount(0);
  for (const id of ['people', 'share-of-population', 'international-immigration']) {
    const graph = page.locator(`#immigration-against-the-long-run--chart-${id}`);
    await expect(graph.locator('.sv-graph-heading, .sv-chart__reading-head')).toHaveCount(1);
    await expect(graph.locator('.sv-observations-group')).not.toHaveAttribute('open', '');
    await expect(graph.locator('.sv-observation').first()).not.toHaveAttribute('open', '');
  }
  await credits.first().click();
  await expect(page.locator('.sv-target')).toHaveClass(/sv-source/);
});

test('mobile pills wrap without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(topic);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await (await cruxCitation(page, fact)).click();
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
  expect(await page.locator('.sv-modal__scroll').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('a pill remains an ordinary link to its evidence section', async ({ page }) => {
    await page.goto(topic);
    const link = await cruxCitation(page, fact);
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(page.locator(`#${href!.split('#')[1]}`)).toBeVisible();
  });
});


test('one collapsed Sources disclosure includes parent and supporting citations', async ({ page }) => {
  await page.goto(topic);
  await openCollection(page, longRun);
  await page.getByRole('button', { name: 'Whole report', exact: true }).click();
  const sources = page.locator('dialog .sv-references');
  await expect(sources).toHaveCount(1);
  await expect(sources).not.toHaveAttribute('open', '');
  await expect(sources.locator('#source-immigration-against-the-long-run-13')).toBeHidden();
  await page.locator('dialog .sv-finding .sv-footnote').first().click();
  await expect(sources).toHaveAttribute('open', '');
  await expect(sources.locator('.sv-target')).toBeInViewport();
  await sources.locator(':scope > summary').click();
  await expect(sources).not.toHaveAttribute('open', '');
  await page.goto(`${topic}/facts/immigration-against-the-long-run#source-immigration-against-the-long-run-13`);
  await expect(page.locator('.sv-references')).toHaveAttribute('open', '');
  await expect(page.locator('#source-immigration-against-the-long-run-13')).toHaveClass(/sv-target/);
  await expect(page.locator('#source-immigration-against-the-long-run-13')).toBeInViewport();
});

test('opening graphs include all asylum comparators and details remain collapsed', async ({ page }) => {
  await page.goto('/topics/uk-asylum/facts/asylum-claims-and-decisions');
  const chart = page.locator('#asylum-claims-and-decisions--chart-per-head-2025');
  await expect(chart.locator('.sv-comparison__rows > li')).toHaveCount(32);
  await expect(chart).toContainText('United Kingdom');
  await expect(page.getByRole('heading', { name: 'Context', exact: true })).toHaveCount(0);
  await expect(page.locator('.sv-observation[open]')).toHaveCount(0);
});

test('glossary popup closes before its containing fact and restores keyboard focus', async ({ page }) => {
  await page.goto(topic);
  await openCollection(page, longRun);
  await page.getByRole('button', { name: 'Whole report', exact: true }).click();
  const dialog = page.locator('dialog.sv-modal');
  await dialog.locator('#immigration-against-the-long-run--observations-international-immigration > summary').click();
  await dialog.locator('#immigration-against-the-long-run--international-differences > summary').click();
  const term = dialog.getByRole('button', { name: 'gross arrivals', exact: true }).first();
  await term.focus();
  await page.keyboard.press('Enter');
  const popup = dialog.getByRole('dialog', { name: 'Gross Arrivals', exact: true });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Close definition' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(term).toBeFocused();
  await term.click();
  await popup.getByRole('button', { name: 'Close definition' }).click();
  await expect(popup).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('international migration comparison follows population share and includes all available EU/EFTA countries', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const chart = page.locator('#immigration-against-the-long-run--chart-international-immigration');
  await expect(chart.locator('.sv-comparison__rows > li')).toHaveCount(31);
  await expect(chart).toContainText('United Kingdom');
  await expect(chart.locator('.sv-comparison__rows')).toContainText('1.13%');
  await chart.getByRole('button', { name: 'All arrivals', exact: true }).click();
  await expect(chart.locator('.sv-comparison__rows')).toContainText('1.46%');
  expect(await chart.evaluate(el => Boolean(el.closest('.sv-viz')?.previousElementSibling?.querySelector('.sv-chart')))).toBe(true);
});

test('glossary works without JavaScript on narrow screens and dismisses outside', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  await page.locator('#immigration-against-the-long-run--observations-international-immigration > summary').click();
  await page.locator('#immigration-against-the-long-run--international-differences > summary').click();
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


test('graphs have no observation markers and observations remain expandable', async ({ page }) => {
  await page.goto(topic);
  await openCollection(page, longRun);
  const dialog = page.locator('dialog.sv-modal');
  await expect(dialog.locator('.sv-chart-marker, .sv-bar-marker, .sv-method-marker')).toHaveCount(0);
  await dialog.locator('#immigration-against-the-long-run--observations-people > summary').click();
  const observation = dialog.locator('#immigration-against-the-long-run--late-1990s-rise');
  await expect(observation.locator('.sv-observation-number')).toHaveCount(0);
  await observation.locator(':scope > summary').click();
  await expect(observation.locator('.sv-observation__body')).toBeVisible();
  await dialog.locator('.sv-method-changes-group > summary').first().click();
  const method = dialog.locator('.sv-method-observation').first();
  await method.locator(':scope > summary').click();
  await expect(method.locator('.sv-observation__body')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(topic);
});

test('nationality comparisons change the country bars and show all components', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const chart = page.locator('#immigration-against-the-long-run--chart-international-immigration');
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
  const series = page.locator('#immigration-against-the-long-run--chart-nationality');
  await expect(series).toBeVisible();
  await expect(series.locator('.sv-chart__reading')).toHaveCount(1);
  await expect(page.locator('#immigration-shifted-from-eu-to-non-eu--chart-net')).toHaveCount(0);
  await series.locator('.sv-observations-group > summary').click();
  const surge = series.locator('#immigration-against-the-long-run--non-eu-arrivals-surge');
  await surge.locator(':scope > summary').click();
  await expect(surge.locator('.sv-observation__body')).toContainText('work-visa eligibility for care workers');
  await expect(surge.locator('a').first()).toHaveAttribute('href', '#source-immigration-against-the-long-run-6');
  const observation = series.locator('#immigration-against-the-long-run--nationality-shift');
  await observation.locator(':scope > summary').click();
  await expect(observation.locator('.sv-observation__body')).toContainText('627,000');
  await expect(observation.locator('.sv-observation__body')).toBeVisible();
});


test('measurement lines retain linked explanations without observation circles', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const graph = page.locator('#immigration-against-the-long-run--chart-people');
  await expect(graph.locator('.sv-method-marker')).toHaveCount(0);
  await expect(graph.locator('.sv-chart__svg:visible .sv-chart__break')).toHaveCount(3);
  await expect(graph.locator('.sv-observations-group .sv-method-observation')).toHaveCount(0);
  await graph.locator('.sv-method-changes-group > summary').click();
  const methods = graph.locator('.sv-method-observation');
  await expect(methods).toHaveCount(3);
  for (const method of await methods.all()) {
    await expect(method.locator('.sv-observation-number')).toHaveCount(0);
    await method.locator(':scope > summary').click();
    await expect(method.locator('.sv-observation__body')).toBeVisible();
    await expect(method.locator('a')).toHaveAttribute('href', '#source-immigration-against-the-long-run-46');
  }
  await page.goto(`${topic}/facts/immigration-against-the-long-run#immigration-against-the-long-run--people-method-1991`);
  await expect(page.locator('.sv-method-changes-group[open]')).toHaveCount(1);
  await expect(page.locator('.sv-target')).toHaveClass(/sv-method-observation/);
  await expect(page.locator('.sv-target')).toHaveAttribute('open', '');
  await expect(page.locator('.sv-target')).toBeInViewport();
});

test('net-migration peak is a graph observation, with its old URL redirected', async ({ page }) => {
  await page.goto(`${topic}/facts/net-migration-peak-and-fall`);
  await expect(page).toHaveURL(/immigration-against-the-long-run#immigration-against-the-long-run--net-migration-is-not-unusual-at-all$/);
  await expect(page.locator('.sv-target')).toContainText('944,000');
  await expect(page.locator('.sv-target')).toHaveAttribute('open', '');
  await expect(page.locator('.sv-chart__title')).toHaveCount(0);
});


test('nationality findings are linked observations, including the old fact URL', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-shifted-from-eu-to-non-eu`);
  await expect(page).toHaveURL(/immigration-against-the-long-run#immigration-against-the-long-run--nationality-shift$/);
  await expect(page.locator('.sv-target')).toHaveAttribute('open', '');
  await expect(page.locator('.sv-target')).toContainText('627,000');
  await expect(page.locator('.sv-target')).toBeInViewport();
});

test('Ukraine is a separate line in net migration by route, with its own observation', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const graph = page.locator('#immigration-against-the-long-run--chart-net-by-route');
  await expect(graph.locator('.sv-chart__legend')).toContainText('Ukraine scheme');
  await graph.locator('.sv-observations-group > summary').click();
  const observation = graph.locator('#immigration-against-the-long-run--ukraine-spike');
  await observation.locator(':scope > summary').click();
  await expect(observation.locator('.sv-observation__body')).toContainText('peaked in 2022');
  await observation.locator('.sv-observation__body a').first().click();
  await expect(page.locator('#source-immigration-against-the-long-run-48')).toHaveClass(/sv-target/);
});
