import { test, expect } from '@playwright/test';

// Depends on authored uk-immigration content: the headline fact
// `immigration-against-the-long-run` carries the ONS 1964–2025 series, with
// two readings (people, share of population) and three annotated breaks, and
// holds the supporting fact `net-migration-peak-and-fall`.

const HEADLINE = '#fact-immigration-against-the-long-run';
const SUPPORTING = '#fact-net-migration-peak-and-fall';
const dialog = 'dialog.sv-modal';

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  // The whole point of server-rendered SVG: the chart is markup, so it is
  // there for a reader with no JavaScript, and so is every number behind it.
  test('the chart and its numbers are in the page without any script', async ({ page }) => {
    await page.goto('/topics/uk-immigration');
    const fact = page.locator(HEADLINE);
    await fact.locator('> summary').click();

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
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
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

test('a deep link to a supporting fact keeps the headline claim in view and marks the fact asked for', async ({
  page,
}) => {
  await page.goto(`/topics/uk-immigration#${SUPPORTING.slice(1)}`);

  const child = page.locator(`${dialog} ${SUPPORTING}`);
  await expect(child).toBeVisible();
  // Which item the reader asked for, for a screen reader and for the eye.
  await expect(child).toHaveAttribute('aria-current', 'location');

  const claim = page.locator(`${dialog} .sv-modal__body > .sv-item > summary`);
  const scroller = page.locator(`${dialog} .sv-modal__scroll`);

  const claimBox = await claim.boundingBox();
  const childBox = await child.boundingBox();
  const scrollBox = await scroller.boundingBox();
  if (!claimBox || !childBox || !scrollBox) throw new Error('expected all three to be laid out');

  // The headline claim the supporting fact is evidence for has not scrolled
  // away above the panel — that was the bug: the fact arrived above the fold
  // with its context off-screen.
  expect(claimBox.y).toBeGreaterThanOrEqual(scrollBox.y - 1);
  expect(claimBox.y + claimBox.height).toBeLessThanOrEqual(scrollBox.y + scrollBox.height);
  // …and the fact that was asked for is in the panel's viewport, below the
  // claim rather than scrolled off the top of it.
  expect(childBox.y).toBeGreaterThanOrEqual(claimBox.y);
  expect(childBox.y).toBeLessThan(scrollBox.y + scrollBox.height);
});

test('closing the panel takes the requested marker off with it', async ({ page }) => {
  await page.goto(`/topics/uk-immigration#${SUPPORTING.slice(1)}`);
  await expect(page.locator(`${dialog} ${SUPPORTING}`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(SUPPORTING)).not.toHaveAttribute('aria-current');
});
