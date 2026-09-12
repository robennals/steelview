import { test, expect } from '@playwright/test';
const topic = '/topics/uk-immigration';
const viewpoint = '#viewpoint-the-right-kind-of-immigration-not-less-of-it';

test('a summary pill opens its exact finding without toggling the viewpoint', async ({ page }) => {
  await page.goto(topic);
  const view = page.locator(viewpoint);
  const pill = view.locator('summary .sv-cite').first();
  await pill.click();
  await expect(view).not.toHaveAttribute('open', '');
  const target = page.locator('dialog .sv-target');
  await expect(target).toContainText('72%');
  await expect(target).toBeInViewport();
  await expect(page.locator('.sv-modal__expand')).toHaveAttribute('href', /#skilled-worker-fiscal/);
  await page.keyboard.press('Escape');
  await expect(pill).toBeFocused();
});

test('a supporting finding opens inside its parent, including an uncached article', async ({ page }) => {
  await page.route('**/api/topics/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto(topic);
  await page.locator(`${viewpoint} > summary .sv-item__claim`).click();
  const pill = page.locator(`${viewpoint} .prose-body a[data-fact-id="what-happens-to-students-after-they-graduate"]`).nth(1);
  await pill.click();
  await expect(page).toHaveURL(/facts\/how-people-actually-arrive#what-happens-to-students/);
  await expect(page.locator('dialog .sv-target')).toContainText('41%');
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
  await expect(page.locator('dialog #evidence-what-happens-to-students-after-they-graduate')).not.toHaveAttribute('open', '');
  const source = page.locator('dialog .sv-target .sv-chart__credit a').first();
  await source.click();
  await expect(page.locator('dialog .sv-target')).toHaveClass(/sv-source/);
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(topic);
  await expect(pill).toBeFocused();
});

test('the same sheet can target another section and expand at that position', async ({ page }) => {
  await page.goto(topic);
  await page.locator(`${viewpoint} > summary .sv-item__claim`).click();
  await page.locator(`${viewpoint} a[data-fact-id="care-worker-route-fiscally-negative"]`).first().click();
  const expand = page.locator('.sv-modal__expand');
  const href = await expand.getAttribute('href');
  await expand.click();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(href!);
  await expect(page.locator('.sv-target')).toContainText('£36,000');
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
    await expect(graph.locator('h2')).toHaveCount(1);
    await expect(graph.locator('.sv-observations-group')).not.toHaveAttribute('open', '');
    await expect(graph.locator('.sv-observation').first()).not.toHaveAttribute('open', '');
  }
  await credits.first().click();
  await expect(page.locator('.sv-target')).toHaveClass(/sv-source/);
});

test('mobile pills wrap without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(topic);
  await page.locator(`${viewpoint} > summary .sv-item__claim`).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(`${viewpoint} a[data-fact-id="care-worker-route-fiscally-negative"]`).first().click();
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
  expect(await page.locator('.sv-modal__scroll').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('a pill remains an ordinary link to its evidence section', async ({ page }) => {
    await page.goto(topic);
    await page.locator(`${viewpoint} > summary .sv-item__claim`).click();
    const pill = page.locator(`${viewpoint} a[data-fact-id="care-worker-route-fiscally-negative"]`).first();
    const href = await pill.getAttribute('href');
    await pill.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(page.locator('#care-worker-route-fiscally-negative--finding')).toBeVisible();
  });
});


test('one collapsed Sources disclosure includes parent and supporting citations', async ({ page }) => {
  await page.goto(topic);
  await page.locator('a.sv-factrow[href$="/immigration-against-the-long-run"]').click();
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
  await page.goto(`${topic}/facts/asylum-claims-in-historical-and-european-context`);
  const charts = page.locator('.sv-factpage__body > .sv-comparison');
  await expect(charts).toHaveCount(2);
  await expect(charts.first().locator('li')).toHaveCount(32);
  await expect(charts.last().locator('li')).toHaveCount(32);
  await expect(charts.first().locator('li').nth(16)).toContainText('United Kingdom');
  await expect(charts.last().locator('li').nth(4)).toContainText('United Kingdom');
  await expect(page.getByRole('heading', { name: 'Context', exact: true })).toHaveCount(0);
  await expect(page.locator('.sv-observation[open]')).toHaveCount(0);
  const subtlety = page.locator('#asylum-claims-in-historical-and-european-context--applications-and-people-are-different-counts');
  await expect(subtlety).toHaveJSProperty('tagName', 'DETAILS');
  await subtlety.locator('summary').click();
  await expect(subtlety).toHaveAttribute('open', '');
});

test('glossary popup closes before its containing fact and restores keyboard focus', async ({ page }) => {
  await page.goto(topic);
  await page.locator('a[data-fact-id="immigration-against-the-long-run"]').first().click();
  const fact = page.locator('dialog.sv-modal');
  await fact.locator('#immigration-against-the-long-run--observations-international-immigration > summary').click();
  await fact.locator('#immigration-against-the-long-run--international-differences > summary').click();
  const term = fact.getByRole('button', { name: 'gross arrivals', exact: true }).first();
  await term.focus();
  await page.keyboard.press('Enter');
  const popup = fact.getByRole('dialog', { name: 'Gross Arrivals', exact: true });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Close definition' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).not.toBeVisible();
  await expect(fact).toBeVisible();
  await expect(term).toBeFocused();
  await term.click();
  await popup.getByRole('button', { name: 'Close definition' }).click();
  await expect(popup).not.toBeVisible();
  await expect(fact).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(fact).toHaveCount(0);
});

test('international migration comparison follows population share and includes all available EU/EFTA countries', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const chart = page.locator('#immigration-against-the-long-run--chart-international-immigration');
  await expect(chart.locator('.sv-comparison__rows > li')).toHaveCount(31);
  await expect(chart).toContainText('United Kingdom');
  await expect(chart.locator('.sv-comparison__rows')).toContainText('1.13%');
  await chart.getByRole('button', { name: 'All arrivals', exact: true }).click();
  await expect(chart.locator('.sv-comparison__rows')).toContainText('1.46%');
  expect(await chart.evaluate(el => Boolean(el.previousElementSibling?.classList.contains('sv-chart')))).toBe(true);
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
  await page.locator('a.sv-factrow[href$="/immigration-against-the-long-run"]').click();
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
  await expect(series.locator('.sv-chart__legend').first()).toContainText('627,000');
  await series.locator('.sv-observations-group > summary').click();
  const surge = series.locator('#immigration-against-the-long-run--non-eu-arrivals-surge');
  await surge.locator(':scope > summary').click();
  await expect(surge.locator('.sv-observation__body')).toContainText('care workers became eligible');
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
    await expect(method.locator('a')).toHaveAttribute('href', '#source-immigration-against-the-long-run-22');
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
  await expect(page.locator('.sv-supporting')).toHaveCount(0);
  await expect(page.locator('.sv-subfact')).toHaveCount(0);
});


test('nationality findings are linked observations, including the old fact URL', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-shifted-from-eu-to-non-eu`);
  await expect(page).toHaveURL(/immigration-against-the-long-run#immigration-against-the-long-run--nationality-shift$/);
  await expect(page.locator('.sv-target')).toHaveAttribute('open', '');
  await expect(page.locator('.sv-target')).toContainText('627,000');
  await expect(page.locator('.sv-target')).toBeInViewport();
  await expect(page.locator('.sv-subfact')).toHaveCount(0);
  await page.goto(topic);
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary .sv-item__claim').first().click();
  await viewpoint.getByRole('link', { name: 'EU+ net migration turned negative while non-EU migration became the larger source of arrivals', exact: true }).click();
  await expect(page.locator('dialog .sv-target')).toHaveAttribute('id', 'immigration-against-the-long-run--nationality-shift');
  await expect(page.locator('dialog .sv-target')).toHaveAttribute('open', '');
  await expect(page.locator('dialog .sv-target')).toBeInViewport();
});

test('Ukraine is separated from remaining non-EU arrivals without double counting', async ({ page }) => {
  await page.goto(`${topic}/facts/immigration-against-the-long-run`);
  const graph = page.locator('#immigration-against-the-long-run--chart-ukraine');
  await expect(graph.getByRole('heading', { name: 'Non-EU Arrivals: Ukraine and the Rest', exact: true })).toBeVisible();
  await expect(graph.locator('.sv-chart__legend')).toContainText('Ukrainian nationals');
  await expect(graph.locator('.sv-chart__legend')).toContainText('Remaining non-EU+ arrivals');
  await graph.locator('.sv-chart__data > summary').click();
  const rows = graph.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  const row = rows.filter({ hasText: '2022' });
  await expect(row).toContainText('1,091,000');
  await expect(row).toContainText('956,000');
  await expect(row).toContainText('135,000');
  for (const row of await rows.all()) {
    const cells = await row.locator('td').allTextContents();
    const values = cells.map(v => Number(v.replaceAll(',', '')));
    expect(values[1] + values[2]).toBe(values[0]);
  }
  await graph.locator('.sv-observations-group > summary').click();
  await graph.locator('.sv-observation > summary').click();
  await expect(graph.locator('.sv-observation__body')).toContainText('continued rising in 2023');
  await graph.locator('.sv-observation__body a').first().click();
  await expect(page.locator('#source-immigration-against-the-long-run-25')).toHaveClass(/sv-target/);
});
