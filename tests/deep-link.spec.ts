import type { Locator } from '@playwright/test';
import { test, expect } from './hydrated-test';
import { expectChartAlone, openChart, openViewpoint } from './topic-rows';

// These assertions depend on authored uk-immigration content: the charts
// viewpoint cards are made with from `immigration-against-the-long-run`,
// `immigration-economy-and-public-finances` and `work-and-study-routes`, and
// the observations on them. Editing any of that content's ids, or which
// charts the viewpoints use, will turn this suite red.

// A data collection has no page of its own. The only charts are the ones
// viewpoint cards are made with, and each has an address on its topic page:
// arriving at it opens that chart alone, in full, in a sheet over the page.

const TOPIC = '/topics/uk-immigration';

const LONG_RUN = 'immigration-against-the-long-run';
const WORK = 'work-and-study-routes';
const ECONOMY = 'immigration-economy-and-public-finances';

// Addresses are permanent: an old link to a data collection's page lands on
// its topic, and one to a chart a viewpoint still uses opens that chart.
test('an old data collection address lands on its topic', async ({ page }) => {
  await page.goto(`${TOPIC}/facts/${LONG_RUN}`);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
  // So does a collection merged into another, and one that moved topic.
  await page.goto(`${TOPIC}/facts/care-worker-route-fiscally-negative`);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  await page.goto(`${TOPIC}/facts/asylum-grant-rate-fell`);
  await expect(page).toHaveURL(/\/topics\/uk-asylum$/);
});

test('an old address of a chart a viewpoint uses opens that chart over its topic', async ({ page }) => {
  await page.goto(`${TOPIC}/facts/${WORK}#${WORK}--chart-sponsor-revocations`);
  const sheet = page.locator('dialog.sv-modal');
  await expect(sheet.locator(`[id="${WORK}--chart-sponsor-revocations"]`)).toBeVisible();
  await expectChartAlone(sheet);
});

test('a chart\'s address opens that chart alone in a sheet, which Back closes onto the topic', async ({ page }) => {
  const chart = await openChart(page, LONG_RUN, 'series');
  const sheet = page.locator('dialog.sv-modal');
  await expect(chart).toBeVisible();
  await expect(sheet.locator('.sv-modal__title')).toHaveText('UK migration');
  await expectChartAlone(sheet);
  // The sheet says where the link landed, so the chart itself is not tinted.
  await expect(chart).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(chart).toHaveCSS('outline-style', 'none');
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});

// Only a chart a card is made with is on the page, so an address of any other opens nothing.
test('the address of a chart no viewpoint uses opens nothing', async ({ page }) => {
  await page.goto(`${TOPIC}#${LONG_RUN}--chart-nationality`);
  await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
  await page.goto(`${TOPIC}#${LONG_RUN}--nationality-shift`);
  await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
});

test('an observation\'s address opens the chart it is about, alone', async ({ page }) => {
  await page.goto(`${TOPIC}#${LONG_RUN}--latest-fall`);
  const sheet = page.locator('dialog.sv-modal');
  await expect(sheet.locator(`[id="${LONG_RUN}--chart-series"]`)).toBeVisible();
  await expectChartAlone(sheet);
});

/** The "Show as" dropdown of a series chart: its button names the reading shown. */
const showAsButton = (chart: Locator, reading: string) => chart.getByRole('button', { name: `Show as: ${reading}` }).filter({ visible: true });

/** Choose a reading from a series chart's "Show as" dropdown. */
async function showAs(chart: Locator, from: string, to: string) {
  await showAsButton(chart, from).click();
  await chart.getByRole('group', { name: 'Show as' }).filter({ visible: true }).getByRole('button', { name: to }).click();
}

test('a series\' readings are one chart, whose "Show as" dropdown opens at the reading an address is about', async ({ page }) => {
  await page.goto(`${TOPIC}#${WORK}--skilled-sponsors-quadrupled`);
  const chart = page.locator(`dialog.sv-modal [id="${WORK}--chart-sponsor-revocations"]`);
  // The observation's link opens the view it is about.
  await expect(showAsButton(chart, 'Registered sponsors')).toBeVisible();
  await expect(chart.locator(`[id="${WORK}--chart-sponsors"]`)).toBeVisible();
  await expect(chart.locator(`[id="${WORK}--chart-revocations"]`)).toBeHidden();
  // Graph or Table, and which view, are separate choices: changing one keeps the other.
  const display = chart.getByRole('group', { name: /display$/ }).filter({ visible: true });
  await display.getByRole('button', { name: 'Table' }).click();
  await showAs(chart, 'Registered sponsors', 'Licences revoked and revocation rate');
  await expect(chart.locator(`[id="${WORK}--chart-revocations"]`)).toBeVisible();
  await expect(chart.getByRole('group', { name: /display$/ }).filter({ visible: true }).getByRole('button', { name: 'Table' })).toHaveAttribute('aria-pressed', 'true');
  await expect(chart.locator('.sv-chart__table').filter({ visible: true })).toBeVisible();
  await chart.getByRole('group', { name: /display$/ }).filter({ visible: true }).getByRole('button', { name: 'Graph' }).click();
  await expect(showAsButton(chart, 'Licences revoked and revocation rate')).toBeVisible();
});

test('a chart with a "Show as" dropdown still fills its sheet', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const chart = await openChart(page, WORK, 'sponsor-revocations');
  const slide = page.locator('dialog.sv-modal .sv-slide').filter({ has: page.locator(`[id="${WORK}--chart-sponsor-revocations"]`) });
  const plot = chart.locator('.sv-chart__plot').filter({ visible: true });
  await expect(plot).toBeVisible();
  // The plot takes the room the slide has, not just its 12rem minimum.
  const [plotBox, slideBox] = [await plot.boundingBox(), await slide.boundingBox()];
  expect(plotBox!.height).toBeGreaterThan(slideBox!.height * 0.4);
});

test('a reading drawn alongside another shares its plot, read against a right-hand axis', async ({ page }) => {
  await page.goto(`${TOPIC}#${WORK}--revocation-rate-not-a-record`);
  const chart = page.locator(`dialog.sv-modal [id="${WORK}--chart-sponsor-revocations"]`);
  // The rate is drawn on the revocations plot, so the dropdown names both, and the rate is no view of its own.
  await expect(showAsButton(chart, 'Licences revoked and revocation rate')).toBeVisible();
  await expect(chart.locator(`[id="${WORK}--chart-revocation-rate"]`)).toHaveCount(0);
  await expect(chart.locator('.sv-chart__key-name:visible').filter({ hasText: /Skilled Worker revocation rate.*\(right axis\)/ })).toBeVisible();
  const plot = chart.locator('.sv-chart__svg:visible').first();
  await expect(plot.locator('text[data-axis="right"]').first()).toBeAttached();
  // The rate's axis is in its line's colour, and hovering the line's key lights it up.
  await chart.locator('.sv-chart__key:visible').filter({ hasText: 'Skilled Worker revocation rate' }).hover();
  await expect(plot.locator('.sv-chart__axis-ticks[data-series="Skilled Worker revocation rate"]')).toHaveAttribute('data-highlighted', 'true');
});

test('a total and its per-head figure share one axis as growth, each in pounds a view of its own', async ({ page }) => {
  await page.goto(`${TOPIC}#${ECONOMY}--total-gdp-grew`);
  const sheet = page.locator('dialog.sv-modal');
  const chart = sheet.locator(`[id="${ECONOMY}--chart-series"]`);
  // The observation opens the growth view: both lines in percent, on one axis.
  await expect(showAsButton(chart, 'Growth since 1955')).toBeVisible();
  const growth = chart.locator(`[id="${ECONOMY}--chart-gdp-growth"]`);
  await expect(growth.locator('.sv-chart__key-name:visible')).toHaveText(['UK GDP per head (from 1955)', 'UK GDP (from 1955)']);
  await expect(growth.locator('.sv-chart__svg:visible').first().locator('text[data-axis="right"]')).toHaveCount(0);
  // Each measure in pounds is a view of its own.
  await showAs(chart, 'Growth since 1955', 'Total GDP, £ billion');
  await expect(chart.locator(`[id="${ECONOMY}--chart-gdp-total"]`)).toBeVisible();
  await expect(growth).toBeHidden();
  // A short title, over the sheet, with its detail under it on the line More sits on.
  await expect(sheet.locator('.sv-modal__title')).toHaveText('UK GDP');
  await expect(chart.locator('.sv-chart__about-text').first()).toContainText('Per head and for the whole economy');
});

test('the old address of a chart merged into another opens the reading it became', async ({ page }) => {
  await page.goto(`${TOPIC}#${WORK}--chart-registered-sponsors`);
  await expect(showAsButton(page.locator(`dialog.sv-modal [id="${WORK}--chart-sponsor-revocations"]`), 'Registered sponsors')).toBeVisible();
});

test('a sources row is one line in the chart\'s More panel, and opens to each source in full', async ({ page }) => {
  const chart = await openChart(page, LONG_RUN, 'series');
  await chart.locator('.sv-chart__about > summary').first().click();
  const row = chart.locator('.sv-chart__sources').first();
  await expect(row.locator('> summary')).toContainText(/^Sources?:/);
  expect((await row.locator('> summary').boundingBox())!.height).toBeLessThan(28);
  await row.locator('> summary').click();
  const source = row.locator('.sv-source').first();
  await expect(source.locator('a')).toHaveAttribute('href', /^https?:/);
  await expect(source.locator('blockquote')).toBeVisible();
});

test('More shows the subtitle\'s description and sources over the chart, without moving it, and Escape closes it', async ({ page }) => {
  const chart = await openChart(page, LONG_RUN, 'series');
  const about = chart.locator('.sv-chart__about').first();
  const graph = chart.locator('.sv-chart__plot').filter({ visible: true }).first();
  const before = (await graph.boundingBox())!.y;
  await about.locator('> summary').click();
  await expect(about.locator('.sv-chart__about-desc')).toBeVisible();
  await expect(about.locator('.sv-chart__sources')).toBeVisible();
  expect((await graph.boundingBox())!.y).toBe(before);
  await page.keyboard.press('Escape');
  await expect(about).not.toHaveAttribute('open', '');
  await expect(page.locator('dialog.sv-modal')).toHaveCount(1);
});

test('in a sheet, Escape closes the More panel first, and only then the sheet', async ({ page }) => {
  const chart = await openChart(page, 'decisions-law-and-diplomacy', 'war-powers-reports-1975-2017', '/topics/us-iran-war');
  const sheet = page.locator('dialog[open]');
  const about = chart.locator('.sv-chart__about').first();
  await about.locator('> summary').click();
  await page.keyboard.press('Escape');
  await expect(about).not.toHaveAttribute('open', '');
  await expect(sheet).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
});

// Depends on authored us-voter-id content: the viewpoints `turned-away`,
// `id-plus-access` and `states-decide`, whose cards between them are made with
// bars, a bar chart, a series and a map.
test('every chart kind leaves the same gap between its title and the line under it', async ({ page }) => {
  test.slow();
  await page.goto('/topics/us-voter-id');
  const gaps = new Map<number, string[]>();
  for (const id of ['turned-away', 'id-plus-access', 'states-decide']) {
    const row = await openViewpoint(page, id);
    const cards = row.locator('.sv-deck__card');
    for (let i = 0; i < await cards.count(); i++) {
      await row.locator('.sv-deck__outline-item').nth(i).click();
      const card = cards.nth(i);
      if (!(await card.locator('.sv-slide').count())) continue;
      await expect(card.locator('.sv-graph-heading').first()).toBeVisible();
      // Measured in one go, so a card still sliding in moves both together.
      const gap = await card.evaluate(el => {
        const heading = el.querySelector('.sv-graph-heading')!.getBoundingClientRect();
        const line = [...el.querySelectorAll('.sv-chart__about > summary, .sv-chart__subtitle')].find(found => found.checkVisibility());
        return line ? Math.round(line.getBoundingClientRect().top - heading.bottom) : null;
      });
      if (gap !== null) gaps.set(gap, [...gaps.get(gap) ?? [], `${id} card ${i + 1}`]);
    }
  }
  expect(gaps.size, JSON.stringify(Object.fromEntries(gaps))).toBe(1);
  expect([...gaps.values()].flat().length).toBeGreaterThan(8);
});

test('a section that moved to a chart keeps its address', async ({ page }) => {
  await page.goto('/topics/us-iran-war#oil-shipping-and-prices--tanker-war');
  await expect(page.locator('dialog.sv-modal .sv-modal__title')).toHaveText('Ships passing through the Strait of Hormuz');
});

test('the address a sheet expands to opens the same chart', async ({ page }) => {
  await page.goto(`${TOPIC}#${LONG_RUN}--viz-series`);
  await expect(page.locator(`dialog.sv-modal [id="${LONG_RUN}--chart-series"]`)).toBeVisible();
});

// A card's "Explore this data" is a real link, for a new tab or a crawler.
test('a viewpoint card links to the chart it is made with, by its address on the topic page', async ({ page }) => {
  await page.goto('/topics/uk-asylum');
  const hrefs = await page.locator('.sv-row--viewpoint .sv-walk__explore a').evaluateAll(
    links => links.map(link => link.getAttribute('href') ?? '')
  );
  expect(hrefs.length).toBeGreaterThan(0);
  // An address on the topic page itself, which opens the chart over it.
  for (const href of hrefs) expect(href).toMatch(/^#[a-z0-9-]+--[a-z0-9-]+$/);
});

// Addresses are permanent and must keep working with no JavaScript to
// interpret them: an old collection address is redirected by the server.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('an old data collection address still lands on its topic', async ({ page }) => {
    await page.goto(`${TOPIC}/facts/${LONG_RUN}`);
    await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
    await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
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

// A figure's controls are one line of dropdowns (control-bar.tsx), with a
// search icon first and whatever does not fit in "More".
const removals = 'removals-and-what-stops-them';
const echrQuotes = `/topics/uk-asylum/facts/${removals}#${removals}--chart-said-about-the-echr`;

test('on a phone, a quote list\'s filters are one line of dropdowns, and ticking one keeps every name in its list', async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 800 });
  await page.goto(echrQuotes);
  const quotes = page.locator(`[id="${removals}--chart-said-about-the-echr"]`);
  const row = quotes.locator('.sv-bar__row');
  const buttons = row.locator(':scope > .sv-bar__button');
  // Search, Speaker and Order, side by side: one row.
  await expect(buttons).toHaveCount(3);
  const tops = await buttons.evaluateAll(all => all.map(b => Math.round(b.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await expect(buttons.first()).toHaveAccessibleName('Search quotes and speakers');

  await quotes.getByRole('button', { name: 'Speaker: All' }).click();
  const speakers = quotes.locator('.sv-bar__pop:popover-open');
  await speakers.getByRole('button', { name: /House of Commons Library/ }).click();
  // Ticking a speaker ticks it; the list stays open with every name in it.
  await expect(speakers.getByRole('button', { name: /House of Commons Library/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(speakers.getByRole('button')).toHaveText([/Home Office/, /House of Commons Library/, /Migration Observatory/, 'Show all']);
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 3 of 6 quotes');
  // The button says what is set, cut short rather than pushing Order into "More".
  await expect(quotes.getByRole('button', { name: 'Speaker: House of Commons Library' })).toBeVisible();
  await expect(quotes.getByRole('button', { name: 'Order: Oldest first' })).toBeVisible();
});

test('a quote list\'s search opens as a row of its own, under filters that stay put', async ({ page }) => {
  await page.goto(echrQuotes);
  const quotes = page.locator(`[id="${removals}--chart-said-about-the-echr"]`);
  await expect(quotes.getByRole('searchbox')).toHaveCount(0);
  await quotes.getByRole('button', { name: 'Search quotes and speakers' }).click();
  const search = quotes.getByRole('searchbox', { name: 'Search quotes and speakers' });
  await expect(search).toBeFocused();
  await search.fill('Article 3');
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 1 of 6 quotes');
  const speaker = quotes.getByRole('button', { name: 'Speaker: All' });
  await expect(speaker).toBeVisible();
  expect((await search.boundingBox())!.y).toBeGreaterThan((await speaker.boundingBox())!.y);
  // Closing the search clears it, so no hidden search keeps filtering.
  await quotes.getByRole('button', { name: 'Close search' }).click();
  await expect(quotes.getByRole('searchbox')).toHaveCount(0);
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 6 of 6 quotes');
});

test('dropdowns that do not fit move into "More"', async ({ page }) => {
  await page.setViewportSize({ width: 250, height: 800 });
  await page.goto(echrQuotes);
  const quotes = page.locator(`[id="${removals}--chart-said-about-the-echr"]`);
  await expect(quotes.getByRole('button', { name: /^Speaker:/ })).toHaveCount(0);
  await quotes.getByRole('button', { name: 'More' }).click();
  const more = quotes.locator('.sv-bar__pop:popover-open');
  await expect(more.getByRole('heading')).toHaveText(['Speaker', 'Order']);
  await more.getByRole('button', { name: /Home Office/ }).click();
  await expect(quotes.getByRole('button', { name: 'More: 1 set' })).toBeVisible();
});

test('a ticked timeline category keeps its name readable', async ({ page }) => {
  const nuclear = 'iran-nuclear-programme';
  await page.goto(`/topics/us-iran-war/facts/${nuclear}#${nuclear}--chart-statements`);
  const timeline = page.locator(`[id="${nuclear}--chart-statements"]`);
  await timeline.getByRole('button', { name: 'Category: All' }).click();
  const iaea = timeline.locator('.sv-bar__pop:popover-open').getByRole('button', { name: /IAEA/ });
  await iaea.click();
  await expect(iaea).toHaveAttribute('aria-pressed', 'true');
  // The old chip turned its name paper-coloured on an ink fill; a ticked line stays on paper.
  const text = await iaea.locator('.sv-timeline__chip-text').evaluate(name => getComputedStyle(name).color);
  const ground = await timeline.locator('.sv-bar__pop:popover-open').evaluate(list => getComputedStyle(list).backgroundColor);
  expect(text).not.toBe(ground);
  await expect(timeline.getByRole('button', { name: 'Category: IAEA' })).toBeVisible();
});
