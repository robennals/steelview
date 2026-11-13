import { test, expect } from './hydrated-test';

// These assertions depend on authored uk-immigration content: the reports
// `crime-terrorism-and-group-exploitation`, `immigration-economy-and-public-finances`
// and `work-and-study-routes`, the viewpoint `open-and-build`, and the link
// text it uses for `work-and-study-routes`. Editing any of that content's
// wording, ids, or cross-references will turn this suite red.

// A fact is addressed by its own URL now, not by an anchor on the topic page:
// a cold load of that URL is the report's own page, showing the data panel a
// topic page opens in a row, and a click from within the topic is the same
// route intercepted into a sheet over it.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;

const LONG_RUN = 'immigration-against-the-long-run';

test('a fact URL loaded cold shows the data panel, with a way back to the topic', async ({ page }) => {
  await page.goto(factUrl('crime-terrorism-and-group-exploitation'));
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
  await expect(page.locator('h1.sv-factpage__claim')).toContainText(
    'Crime, Terrorism and Group-Based Child Sexual Exploitation'
  );
  await expect(page.locator('.sv-walk__tab').first()).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('.sv-walk__slide .sv-chart').first()).toBeVisible();
  await page.locator('.sv-walk__tab').nth(1).click();
  await expect(page.locator('.sv-walk__tab').nth(1)).toHaveAttribute('aria-current', 'step');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('the way back lands on the report\'s row, open', async ({ page }) => {
  await page.goto(factUrl(LONG_RUN));
  await page.getByRole('link', { name: 'UK immigration' }).click();
  await expect(page).toHaveURL(new RegExp(`${TOPIC}#fact-${LONG_RUN}$`));
  await expect(page.locator('.sv-topic-tabs a[aria-current]')).toHaveText('Data');
  await expect(page.locator(`#fact-${LONG_RUN}`)).toHaveAttribute('data-open', 'true');
  await expect(page.locator(`#fact-${LONG_RUN} .sv-slide .sv-chart`).first()).toBeVisible();
});

test('a report\'s own page shows an observation in its chart, picking out what it says', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--uk-mid-table-per-head`);
  const item = page.locator(`[data-observation="${LONG_RUN}--uk-mid-table-per-head"]`);
  await expect(item).toBeVisible();
  const chart = page.locator('.sv-walk__step').filter({ has: item });
  await expect(chart.locator('[data-row="United Kingdom"]')).toHaveAttribute('data-mark-picked', '');
  await expect(chart.locator('[data-row][data-mark-dimmed]').first()).toBeAttached();
});

test('a chart\'s address opens the data panel at that chart', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--chart-nationality`);
  const tab = page.locator('.sv-walk__tab[aria-current]');
  await expect(tab).toContainText('UK migration by nationality');
  await expect(page.locator('.sv-walk')).toBeInViewport();
  // The selected tab says where the link landed, so the chart itself is not tinted.
  await expect(page.locator(`[id="${LONG_RUN}--chart-nationality"]`)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator(`[id="${LONG_RUN}--chart-nationality"]`)).toHaveCSS('outline-style', 'none');
});

test('an observation\'s address opens that chart at that observation', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--nationality-shift`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('UK migration by nationality');
  const observation = page.locator(`[data-observation="${LONG_RUN}--nationality-shift"]`);
  await expect(observation).toBeVisible();
  await expect(observation).toHaveClass(/sv-target/);
  await expect(observation).toBeInViewport();
  // Its footnote opens the sources row of the chart it is on, at that source.
  await observation.locator('a[href^="#source-"]').first().click();
  const source = page.locator('.sv-walk__slide:has(.sv-walk__tab) .sv-target, .sv-chart__sources .sv-target');
  await expect(source).toBeVisible();
  await expect(source).toHaveClass(/sv-source/);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('UK migration by nationality');
});

test('a Subtlety\'s address opens its chart at that Subtlety, marked as one', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--international-differences`);
  const observation = page.locator(`[data-observation="${LONG_RUN}--international-differences"]`);
  await expect(observation).toBeVisible();
  await expect(observation.locator('.sv-observe__count')).toContainText('Subtlety');
  await expect(observation.locator('.sv-observe__body')).toBeVisible();
});

test('More lists a chart\'s observations and Subtleties, and one goes straight to it, with focus', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--chart-nationality-arrivals`);
  const slide = page.locator('.sv-walk__slide:has(.sv-walk__tab), .sv-walk__slide').filter({ has: page.locator(`[data-chart-anchor="${LONG_RUN}--chart-nationality-arrivals"]`) });
  const about = slide.locator('.sv-chart__about').first();
  await about.locator('> summary').click();
  const links = about.locator('.sv-chart__about-list a');
  const last = links.last();
  const name = await last.innerText();
  await last.click();
  await expect(about).not.toHaveAttribute('open', '');
  const toggle = slide.locator('.sv-observe__item:not([hidden]) .sv-observe__toggle');
  await expect(toggle).toContainText(name);
  await expect(toggle).toBeFocused();
  await expect(slide.locator('.sv-observe__item:not([hidden]) .sv-observe__body')).toBeVisible();
});

test('a sources row is one line, and opens to each source in full', async ({ page }) => {
  await page.goto(factUrl(LONG_RUN));
  const row = page.locator('.sv-walk__slide').first().locator('.sv-chart__sources');
  await expect(row.locator('> summary')).toContainText(/^Sources?:/);
  expect((await row.locator('> summary').boundingBox())!.height).toBeLessThan(28);
  await row.locator('> summary').click();
  const source = row.locator('.sv-source').first();
  await expect(source.locator('a')).toHaveAttribute('href', /^https?:/);
  await expect(source.locator('blockquote')).toBeVisible();
});

test('a report\'s last slide says what is not known yet, and has its old address', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--data-still-needed`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText("What we don't know yet");
  await expect(page.locator('.sv-walk__tabs li').last().locator('.sv-walk__tab')).toHaveAttribute('aria-current', 'step');
});

test('a section that moved to a chart keeps its address', async ({ page }) => {
  await page.goto(`/topics/us-iran-war/facts/oil-shipping-and-prices#oil-shipping-and-prices--tanker-war`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('Ships passing through the Strait of Hormuz');
  await page.goto(`/topics/us-iran-war/facts/oil-shipping-and-prices#oil-shipping-and-prices--about`);
  await expect(page.locator('[id="oil-shipping-and-prices--about"]')).toBeVisible();
});

test('a table that became a slide keeps its address', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--pledges`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('Pledges on net migration');
});

test('the address a sheet expands to opens the same chart', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--viz-nationality`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('UK migration by nationality');
});

// Addresses are permanent: a fact merged into a report keeps working, and
// lands on the report that now holds it.
test('the address of a merged fact redirects to its report', async ({ page }) => {
  await page.goto(factUrl('care-worker-route-fiscally-negative'));
  await expect(page).toHaveURL(new RegExp(`${factUrl('immigration-economy-and-public-finances')}$`));
  await expect(page.locator('h1.sv-factpage__claim')).toContainText('Immigration, the Economy and the Public Finances');
});

test('a related report opens as a page of its own, not over the one you are on', async ({ page }) => {
  await page.goto(factUrl(LONG_RUN));
  await page.locator('.sv-related a').first().click();
  await expect(page).not.toHaveURL(new RegExp(`${factUrl(LONG_RUN)}$`));
  await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
  await expect(page.locator('dialog')).toHaveCount(0);
});

// A viewpoint's "Explore this data" is a real link, for a new tab or a crawler.
test('a viewpoint step links to the collection it cites', async ({ page }) => {
  await page.goto(TOPIC);
  const hrefs = await page.locator('.sv-row--viewpoint .sv-walk__explore a').evaluateAll(
    links => links.map(link => link.getAttribute('href') ?? '')
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/topics\/uk-immigration\/facts\/[a-z0-9-]+#/);
  // So is a claim in a step's prose, which opens a panel when clicked.
  await expect(page.locator('.sv-row--viewpoint .sv-walk__prose a[data-panel-link]').first()).toHaveAttribute('href', /^\/topics\/uk-immigration\/facts\/[a-z0-9-]+#/);
});

// Addresses are permanent and must keep working with no JavaScript to
// interpret them: the fact URL is a real, statically generated page.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a fact URL still delivers the whole fact', async ({ page }) => {
    await page.goto(factUrl(LONG_RUN));
    await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
    await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
    await expect(page.locator('.sv-chart__sources blockquote').first()).toBeHidden();
    await page.locator('.sv-chart__sources > summary').first().click();
    await expect(page.locator('.sv-chart__sources blockquote').first()).toBeVisible();
    // Nothing steps through the charts, so they run down the page, and every
    // observation shows. Each has its own address.
    await expect(page.locator('.sv-walk__tabbar')).toBeHidden();
    await expect(page.locator('.sv-walk__slide').last().locator('.sv-data-needed__list li').first()).toBeVisible();
    const steps = await page.locator('.sv-walk__slide:not(:has(.sv-data-needed__list))').all();
    expect(steps.length).toBeGreaterThan(5);
    for (const step of steps) await expect(step.locator('.sv-chart, .sv-report').first()).toBeVisible();
    await expect(page.locator(`#${LONG_RUN}--nationality-shift`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('a chart\'s address lands on that chart', async ({ page }) => {
    await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--viz-nationality`);
    await expect(page.locator(`#${LONG_RUN}--viz-nationality`).locator('..').locator('.sv-chart').first()).toBeInViewport();
  });
});

// A page that works without JavaScript must not be destroyed by its
// JavaScript: `decodeURIComponent` throws on a malformed escape like `%zz`,
// and an uncaught throw in a mount effect would otherwise replace the
// already-delivered static HTML with Next's default error boundary.
test('a malformed hash does not break the page', async ({ page }) => {
  await page.goto(`${TOPIC}#%zz`);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
});
