import { test, expect } from './hydrated-test';
import { viewpointCitation } from './topic-rows';

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
  // Its footnote leads to the sources, on this page.
  await observation.locator('a[href^="#source-"]').first().click();
  await expect(page.locator('.sv-references')).toHaveAttribute('open', '');
  await expect(page.locator('.sv-target')).toHaveClass(/sv-source/);
});

test('the address a sheet expands to opens the same chart', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--viz-nationality`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('UK migration by nationality');
});

test('a section of the report opens where it is, under the panel', async ({ page }) => {
  await page.goto('/topics/uk-asylum/facts/asylum-claims-and-decisions');
  const subtleties = page.locator('.sv-chart-notes .sv-subtleties-group').first();
  const id = await subtleties.getAttribute('id');
  await expect(subtleties).not.toHaveAttribute('open', '');
  await page.evaluate(hash => { location.hash = hash; }, id ?? '');
  await expect(subtleties).toHaveAttribute('open', '');
  await expect(page.locator('.sv-target')).toBeInViewport();
});

// Addresses are permanent: a fact merged into a report keeps working, and
// lands on the report that now holds it.
test('the address of a merged fact redirects to its report', async ({ page }) => {
  await page.goto(factUrl('care-worker-route-fiscally-negative'));
  await expect(page).toHaveURL(new RegExp(`${factUrl('immigration-economy-and-public-finances')}$`));
  await expect(page.locator('h1.sv-factpage__claim')).toContainText('Immigration, the Economy and the Public Finances');
});

test('clicking a citation opens the fact it points at', async ({ page }) => {
  await page.goto(TOPIC);
  await (await viewpointCitation(page, 'work-and-study-routes')).click();
  await expect(page).toHaveURL(new RegExp(`${factUrl('work-and-study-routes')}#`));
  await expect(page.locator('dialog.sv-modal #sv-modal-title')).toContainText(
    'Work and Study Visas and the Care Workforce'
  );
});

// A viewpoint's "Explore this data" is a real link, for a new tab or a crawler.
test('a viewpoint step links to the collection it cites', async ({ page }) => {
  await page.goto(TOPIC);
  const hrefs = await page.locator('.sv-row--viewpoint .sv-walk__explore a').evaluateAll(
    links => links.map(link => link.getAttribute('href') ?? '')
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/topics\/uk-immigration\/facts\/[a-z0-9-]+#/);
});

// Addresses are permanent and must keep working with no JavaScript to
// interpret them: the fact URL is a real, statically generated page.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a fact URL still delivers the whole fact', async ({ page }) => {
    await page.goto(factUrl(LONG_RUN));
    await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
    await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
    await expect(page.locator('.sv-references blockquote').first()).toBeHidden();
    await page.locator('.sv-references > summary').click();
    await page.locator('.sv-source-quote > summary').first().click();
    await expect(page.locator('.sv-references blockquote').first()).toBeVisible();
    // Nothing steps through the charts, so they run down the page, and every
    // observation shows. Each has its own address.
    await expect(page.locator('.sv-walk__tabbar')).toBeHidden();
    const steps = await page.locator('.sv-walk__slide').all();
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
