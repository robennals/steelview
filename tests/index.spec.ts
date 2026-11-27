import { test, expect } from './hydrated-test';
import { expectChartAlone } from './topic-rows';

const rows = (page: import('@playwright/test').Page) => page.locator('.sv-row');
const toggle = (page: import('@playwright/test').Page, n: number) => rows(page).nth(n).locator('.sv-row__toggle');

test('the home page links to each topic', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'UK immigration', exact: true });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/topics\/uk-immigration$/);
});

test('the masthead shows the full stop but names the site without it', async ({ page }) => {
  await page.goto('/');
  const wordmark = page.getByRole('link', { name: 'Steelview', exact: true });
  await expect(wordmark).toHaveText('Steelview.');
});

test('the page declares a favicon that can be fetched', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
  expect((await request.get(href ?? '')).status()).toBe(200);
});

test('the tagline links to the About page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every side of the argument, at its strongest.');
  await page.getByRole('link', { name: /What is Steelview\?/ }).click();
  await expect(page).toHaveURL(/\/about$/);
});

test('a short bar chart preview spreads its rows a little, and a wrapped label keeps its height', async ({ page }) => {
  await page.goto('/');
  const row = rows(page).filter({ hasText: 'Voter ID and citizenship checks' });
  await row.locator('.sv-row__toggle').click({ position: { x: 400, y: 12 } });
  // Five rows at 2.5rem each, against 108px at their own spacing.
  const short = row.locator('.sv-comparison').filter({ hasText: 'Non-citizens found on voter rolls' }).locator('.sv-comparison__rows');
  await expect(short.locator('> li')).toHaveCount(5);
  await expect.poll(() => short.evaluate(list => list.clientHeight)).toBe(200);

  // On a phone the slide is as tall as its chart, so nothing spreads the rows,
  // but labels wrapped onto two or three lines are never cut off.
  await page.setViewportSize({ width: 390, height: 844 });
  const wrapped = row.locator('.sv-comparison').filter({ hasText: "Gaps in adult citizens' ID" }).locator('.sv-comparison__rows');
  const { height, content } = await wrapped.evaluate(list => ({ height: list.clientHeight, content: list.scrollHeight }));
  expect(content).toBeLessThanOrEqual(height);
});

test('the UK topics come after every other topic', async ({ page }) => {
  await page.goto('/');
  const firstTags = await rows(page).locator('.sv-tag:first-child').allTextContents();
  const firstUk = firstTags.indexOf('UK');
  expect(firstUk).toBeGreaterThan(0);
  expect(firstTags.slice(firstUk).every(tag => tag === 'UK')).toBe(true);
});

test('the first topic starts open and its carousel steps through the charts', async ({ page }) => {
  await page.goto('/');
  await expect(rows(page).first()).toHaveAttribute('data-open', 'true');
  await expect(rows(page).nth(1)).not.toHaveAttribute('data-open', 'true');
  const carousel = rows(page).first().locator('.sv-carousel');
  await expect(carousel.locator('.sv-carousel__count')).toContainText('1 / 4');
  await carousel.getByRole('button', { name: 'Next chart' }).click();
  await expect(carousel.locator('.sv-carousel__count')).toContainText('2 / 4');
  await carousel.locator('.sv-carousel__strip').press('ArrowLeft');
  await expect(carousel.locator('.sv-carousel__count')).toContainText('1 / 4');
});

test('on a phone an open row leaves out its viewpoints, and its carousel is only as tall as the chart showing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const row = rows(page).first();
  await expect(row.locator('.sv-row__viewpoints')).toBeHidden();
  await expect(row.locator('.sv-row__cta')).toBeVisible();
  // Counted as the topic page names them: its viewpoints and its cruxes.
  await expect(row.locator('.sv-row__counts')).toHaveText(/^\d+ viewpoints? · \d+ (crux|cruxes)$/);
  const carousel = row.locator('.sv-carousel');
  const strip = carousel.locator('.sv-carousel__strip');
  const heights = new Set<number>();
  for (let n = 1; n <= 4; n++) {
    if (n > 1) await carousel.getByRole('button', { name: 'Next chart' }).click();
    await expect(carousel.locator('.sv-carousel__count')).toContainText(`${n} / 4`);
    const slide = carousel.locator('.sv-carousel__slide').nth(n - 1);
    const height = await slide.evaluate(el => el.getBoundingClientRect().height);
    await expect.poll(() => strip.evaluate(el => el.getBoundingClientRect().height)).toBeCloseTo(height, 0);
    heights.add(Math.round(height));
  }
  // Each slide takes its own chart's height, not one height for all.
  expect(heights.size).toBeGreaterThan(1);
});

test('a preview chart opens its data in a sheet over the home page, which Back closes', async ({ page }) => {
  await page.goto('/');
  const slide = page.locator('[data-preview]#human-and-financial-costs-of-the-war--chart-us-deaths-earlier-wars');
  const row = rows(page).filter({ has: slide });
  if (await row.getAttribute('data-open') !== 'true') await row.locator('.sv-row__toggle').click({ position: { x: 400, y: 12 } });
  await slide.locator('.sv-graph-heading a').click();
  const sheet = page.locator('dialog[open]');
  await expect(sheet.locator('[id="human-and-financial-costs-of-the-war--chart-us-deaths-earlier-wars"]')).toBeInViewport();
  await expectChartAlone(sheet);
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);

  // Clicking anywhere on the chart opens it too, and the close button closes it.
  await slide.click({ position: { x: 200, y: 150 } });
  await expect(sheet).toHaveCount(1);
  await sheet.locator('.sv-modal__close').click();
  await expect(sheet).toHaveCount(0);
});

// A preview is one of the charts its topic's viewpoint cards are made with,
// so its link opens that same chart alone over the topic page.
test('every preview chart links to a chart its topic page opens alone', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('.sv-carousel__slide .sv-graph-heading a').evaluateAll(
    links => links.map(link => link.getAttribute('href') ?? '')
  );
  expect(hrefs.length).toBeGreaterThanOrEqual(4 * await rows(page).count());
  for (const href of hrefs) {
    const [path, address] = href.split('#');
    expect(path).toMatch(/^\/topics\/[a-z0-9-]+$/);
    await page.goto(href);
    const sheet = page.locator('dialog.sv-modal');
    await expect(sheet.locator(`[data-chart-anchor="${address}"], [id="${address}"]`).first(), href).toBeAttached();
    await expectChartAlone(sheet);
  }
});

test('a sheet fills a phone\'s screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const slide = page.locator('[data-preview]#human-and-financial-costs-of-the-war--chart-us-deaths-earlier-wars');
  const row = rows(page).filter({ has: slide });
  if (await row.getAttribute('data-open') !== 'true') await row.locator('.sv-row__toggle').click({ position: { x: 200, y: 12 } });
  await slide.locator('.sv-graph-heading a').click();
  const box = await page.locator('dialog[open] .sv-modal__panel').boundingBox();
  expect(box).toEqual({ x: 0, y: 0, width: 390, height: 844 });
});

test('every row shows its tags', async ({ page }) => {
  await page.goto('/');
  for (const n of [0, 1, 2, 3]) await expect(rows(page).nth(n).locator('.sv-tag').first()).toBeVisible();
});

test('opening a row closes the open one, and clicking it again closes it', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await expect(rows(page).nth(1)).toHaveAttribute('data-open', 'true');
  await expect(rows(page).first()).not.toHaveAttribute('data-open', 'true');
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await expect(page.locator('.sv-row[data-open]')).toHaveCount(0);
});

test('rapid clicks on two rows leave only the last one open', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await toggle(page, 2).click({ position: { x: 400, y: 12 } });
  await expect(page.locator('.sv-row[data-open]')).toHaveCount(1);
  await expect(rows(page).nth(2)).toHaveAttribute('data-open', 'true');
});

test('the clicked row stays where it was while the row above it closes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  // Put the second row's head about 120px down the screen, with the open first
  // row above it.
  await page.evaluate(() => {
    const row = document.querySelectorAll('.sv-row')[1];
    window.scrollTo(0, row.getBoundingClientRect().top + window.scrollY - 120);
  });
  const before = (await rows(page).nth(1).boundingBox())!.y;
  // On screen, below the top, so the click itself scrolls nothing.
  expect(before).toBeGreaterThan(20);
  expect(before).toBeLessThan(600);
  await toggle(page, 1).click({ position: { x: 400, y: 12 } });
  await page.waitForTimeout(900);
  const after = (await rows(page).nth(1).boundingBox())!.y;
  expect(Math.abs(after - before)).toBeLessThan(4);
});

test('a row opens from the keyboard', async ({ page }) => {
  await page.goto('/');
  await toggle(page, 1).focus();
  await page.keyboard.press('Enter');
  await expect(rows(page).nth(1)).toHaveAttribute('data-open', 'true');
  await expect(toggle(page, 1)).toHaveAttribute('aria-expanded', 'true');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a topic title still leads to its report', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'The US war with Iran', exact: true }).click();
    await expect(page).toHaveURL(/\/topics\/us-iran-war$/);
  });
});

// Both pages shuffle their viewpoints, so only the names must match, not their order.
// No viewpoint is always listed first: a row deals its viewpoints again each time it opens.
test('an open row lists its viewpoints in a new order each time it opens', async ({ page }) => {
  await page.goto('/');
  const row = rows(page).first();
  const names = () => row.locator('.sv-row__viewpoints li').allTextContents();
  await expect(row).toHaveAttribute('data-open', 'true');
  const all = [...(await names())].sort();
  expect(all.length).toBeGreaterThan(1);
  for (let i = 0; i < 4; i++) {
    const before = await names();
    await toggle(page, 0).click({ position: { x: 400, y: 12 } });
    await expect(row).not.toHaveAttribute('data-open', 'true');
    await toggle(page, 0).click({ position: { x: 400, y: 12 } });
    await expect(row).toHaveAttribute('data-open', 'true');
    await expect.poll(names).not.toEqual(before);
    expect([...(await names())].sort()).toEqual(all);
  }
});

test('each topic lists its viewpoints as its own page names them', async ({ page }) => {
  await page.goto('/');
  const listed = await page.locator('.sv-row').evaluateAll(rows => rows.map(row => ({
    href: row.querySelector<HTMLAnchorElement>('.sv-row__cta')?.getAttribute('href'),
    names: [...row.querySelectorAll('.sv-row__viewpoints li')].map(li => li.textContent?.trim()),
  })));
  expect(listed.length).toBeGreaterThan(1);
  for (const { href, names } of listed) {
    await page.goto(href!);
    const titles = page.locator('.sv-row--viewpoint .sv-row__title');
    await expect(titles, href!).toHaveCount(names.length);
    expect((await titles.allTextContents()).map(title => title.trim()).sort(), href!).toEqual(names.map(name => name!).sort());
  }
});
