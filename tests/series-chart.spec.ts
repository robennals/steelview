import { test, expect } from '@playwright/test';

// Depends on authored uk-immigration content: the headline fact
// `immigration-against-the-long-run` carries the ONS 1964–2025 series, with
// two readings (people, share of population) and three annotated breaks, and
// holds the supporting fact `net-migration-peak-and-fall`.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;
const row = (id: string) => `a.sv-factrow[href="${factUrl(id)}"]`;
const HEADLINE = 'immigration-against-the-long-run';
const SUPPORTING = 'net-migration-peak-and-fall';
const dialog = 'dialog.sv-modal';

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  // The whole point of server-rendered SVG: the chart is markup, so it is
  // there for a reader with no JavaScript, and so is every number behind it.
  // The fact's own page is exactly where such a reader arrives, having
  // followed an ordinary link from the list.
  test('the chart and its numbers are in the page without any script', async ({ page }) => {
    await page.goto(TOPIC);
    await page.locator(row(HEADLINE)).click();
    const fact = page.locator('article.sv-factpage');

    const charts = fact.locator('.sv-chart__svg[data-variant="wide"]');
    await expect(charts).toHaveCount(2); // one per reading

    // Each plot is an image with a name and a description, both real elements
    // the SVG points at rather than an attribute a sighted reader cannot check.
    const plot = charts.first();
    await expect(plot).toHaveAttribute('role', 'img');
    await expect(plot).toHaveAttribute(
      'aria-label',
      /UK immigration, emigration and net migration, 1964.2025 . In people/
    );
    const descId = await plot.getAttribute('aria-describedby');
    await expect(fact.locator(`#${descId}`)).toHaveText(/definitional breaks/);

    const table = fact.locator('.sv-chart__data');
    await table.locator('> summary').click();
    // Every published year, not a sample: 1964–2025 inclusive.
    await expect(table.locator('tbody tr')).toHaveCount(62);
    await expect(table.locator('tbody tr').first().locator('th')).toHaveText('1964');
    await expect(table.locator('tbody tr').last().locator('th')).toHaveText('2025');
  });
});

test('the chart draws both readings, and marks the breaks rather than smoothing them', async ({
  page,
}) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  const chart = page.locator(`${dialog} .sv-chart`);

  await expect(chart.locator('.sv-chart__reading')).toHaveCount(2);
  await expect(
    chart.getByRole('heading', { name: 'As a share of the UK population' })
  ).toBeVisible();
  await expect(chart.getByRole('heading', { name: 'In people' })).toBeVisible();
  await expect(chart.locator('.sv-chart__range')).toContainText('Full published range: 1964–2025');

  // Three definitional breaks, each drawn in the plot and explained below it.
  await expect(chart.locator('.sv-chart__breaks .sv-chart__break-item')).toHaveCount(3);
  const visiblePlot = chart.locator('.sv-chart__svg:visible').first();
  await expect(visiblePlot.locator('.sv-chart__break')).toHaveCount(3);
  // A line crossing a break is cut and bridged, never drawn straight through.
  await expect(visiblePlot.locator('.sv-chart__bridge').first()).toBeAttached();

  // A chart is a factual claim, so it carries its own quoted source.
  await expect(chart.locator('.sv-chart__source blockquote')).toContainText(
    'comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution'
  );
});

// The bug this replaced: a supporting fact arriving above the fold with the
// claim it is evidence for scrolled off the top. The fix is structural now —
// the claim it supports is stated *above* it, before any of the detail — so
// the assertion is that it is on screen without any scrolling at all.
test('a supporting fact opens with the claim it supports already in view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(TOPIC);
  await page.locator(row(SUPPORTING)).click();

  const parent = page.locator(`${dialog} .sv-parentnote`);
  const claim = page.locator(`${dialog} #sv-modal-title`);
  const scroller = page.locator(`${dialog} .sv-modal__scroll`);

  const parentBox = await parent.boundingBox();
  const claimBox = await claim.boundingBox();
  const scrollBox = await scroller.boundingBox();
  if (!parentBox || !claimBox || !scrollBox) throw new Error('expected all three to be laid out');

  // Both the claim asked for and the claim it is evidence for are inside the
  // panel's viewport, in that order, with nothing scrolled.
  expect(parentBox.y).toBeGreaterThanOrEqual(scrollBox.y - 1);
  expect(parentBox.y + parentBox.height).toBeLessThan(claimBox.y + claimBox.height);
  expect(claimBox.y + claimBox.height).toBeLessThanOrEqual(scrollBox.y + scrollBox.height);
  expect(await scroller.evaluate((el) => el.scrollTop)).toBe(0);
});

test('closing the panel takes the chart off the page with it', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  await expect(page.locator(`${dialog} .sv-chart`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.sv-chart')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
});
