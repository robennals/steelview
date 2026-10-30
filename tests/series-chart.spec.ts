import { test, expect } from '@playwright/test';
import { openCollection } from './topic-rows';

// Depends on authored uk-immigration content: the headline fact
// `immigration-against-the-long-run` carries the ONS 1964–2025 series, with
// two readings (people, share of population) and three annotated breaks.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;
const HEADLINE = 'immigration-against-the-long-run';
const HEADLINE_TITLE = 'UK Migration and Population Over the Long Run';
const dialog = 'dialog.sv-modal';

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  // The whole point of server-rendered SVG: the chart is markup, so it is
  // there for a reader with no JavaScript, and so is every number behind it.
  // The fact's own page is exactly where such a reader arrives, having
  // followed an ordinary link from the topic page.
  test('the chart and its numbers are in the page without any script', async ({ page }) => {
    await page.goto(factUrl(HEADLINE));
    const fact = page.locator('article.sv-factpage');

    const charts = fact.locator(`#${HEADLINE}--chart-series .sv-chart__svg[data-variant="wide"]`);
    await expect(charts).toHaveCount(2); // one per reading

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
    const table = fact.locator(`#${HEADLINE}--chart-series .sv-chart__data`).first();
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
  await openCollection(page, HEADLINE);
  const chart = page.locator(`${dialog} .sv-chart`).first();

  await expect(chart.locator('.sv-chart__reading')).toHaveCount(2);
  await expect(
    chart.getByRole('heading', { name: 'As a Share of the UK Population' })
  ).toBeVisible();
  await expect(chart.getByRole('heading', { name: 'UK Migration Over Time' })).toBeVisible();
  await expect(chart.locator('.sv-chart__range')).toContainText('Full published range: 1964–2025');

  // Three definitional breaks, each drawn in the plot and explained below it.
  await expect(chart.locator('.sv-method-observation')).toHaveCount(6);
  const visiblePlot = chart.locator('.sv-chart__svg:visible').first();
  await expect(visiblePlot.locator('.sv-chart__break')).toHaveCount(3);
  // A line crossing a break is cut and bridged, never drawn straight through.
  await expect(visiblePlot.locator('.sv-chart__bridge').first()).toBeAttached();

  // A chart is a factual claim, so it carries its own quoted source.
  await expect(page.locator(`${dialog} #source-${HEADLINE}-5 blockquote`)).toContainText(
    'comparisons between pre-June 2021 and post-June 2021 estimates should be treated with caution'
  );
});

test('closing the panel takes the chart off the page with it', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await expect(page.locator(`${dialog} .sv-chart`).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(`${dialog} .sv-chart`)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
});

// Depends on authored us-voter-id content: the fact
// `voter-id-rules-in-the-us-and-abroad` carries the NCSL 1950–2026 series
// (reading `states-with-id`) with five dated events, each with a note.
const VOTER_ID_FACT = '/topics/us-voter-id/facts/voter-id-rules-in-the-us-and-abroad';
const ID_LAW_KEY = 'sv-event-strip-voter-id-rules-in-the-us-and-abroad--states-with-id-events';

test('an event marker opens its own key item and leaves the others closed', async ({ page }) => {
  await page.goto(VOTER_ID_FACT);
  const strip = page.locator(`#voter-id-rules-in-the-us-and-abroad--states-with-id-events`);
  for (const n of [1, 2, 3, 4, 5]) await expect(page.locator(`#${ID_LAW_KEY}-${n}`)).not.toHaveAttribute('open');

  await strip.locator(`a.sv-event-strip__marker[href="#${ID_LAW_KEY}-3"]`).click();
  await expect(page.locator(`#${ID_LAW_KEY}-3`)).toHaveAttribute('open', '');
  for (const n of [1, 2, 4, 5]) await expect(page.locator(`#${ID_LAW_KEY}-${n}`)).not.toHaveAttribute('open');
});

test('loading the page at an event item opens it', async ({ page }) => {
  await page.goto(`${VOTER_ID_FACT}#${ID_LAW_KEY}-3`);
  await expect(page.locator(`#${ID_LAW_KEY}-3`)).toHaveAttribute('open', '');
});
