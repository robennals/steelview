import type { Locator } from '@playwright/test';
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
  await expect(tab).toContainText('Arrivals by nationality');
  await expect(page.locator('.sv-walk')).toBeInViewport();
  // The selected tab says where the link landed, so the chart itself is not tinted.
  await expect(page.locator(`[id="${LONG_RUN}--chart-nationality"]`)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator(`[id="${LONG_RUN}--chart-nationality"]`)).toHaveCSS('outline-style', 'none');
});

test('an observation\'s address opens that chart at that observation', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--nationality-shift`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('Arrivals by nationality');
  const observation = page.locator(`[data-observation="${LONG_RUN}--nationality-shift"]`);
  await expect(observation).toBeVisible();
  await expect(observation).toHaveClass(/sv-target/);
  await expect(observation).toBeInViewport();
  // Its footnote opens the sources row of the chart it is on, at that source.
  await observation.locator('a[href^="#source-"]').first().click();
  const source = page.locator('.sv-walk__slide:has(.sv-walk__tab) .sv-target, .sv-chart__sources .sv-target');
  await expect(source).toBeVisible();
  await expect(source).toHaveClass(/sv-source/);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('Arrivals by nationality');
});

test('a Subtlety\'s address opens its chart at that Subtlety, marked as one', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--international-differences`);
  const observation = page.locator(`[data-observation="${LONG_RUN}--international-differences"]`);
  await expect(observation).toBeVisible();
  await expect(observation.locator('.sv-observe__count')).toContainText('Subtlety');
  await expect(observation.locator('.sv-observe__body')).toBeVisible();
});

/** The "Show as" dropdown of a series chart: its button names the reading shown. */
const showAsButton = (chart: Locator, reading: string) => chart.getByRole('button', { name: `Show as: ${reading}` }).filter({ visible: true });

/** Choose a reading from a series chart's "Show as" dropdown. */
async function showAs(chart: Locator, from: string, to: string) {
  await showAsButton(chart, from).click();
  await chart.getByRole('group', { name: 'Show as' }).filter({ visible: true }).getByRole('button', { name: to }).click();
}

test('a series\' readings are one chart, whose "Show as" dropdown follows its observations', async ({ page }) => {
  const work = 'work-and-study-routes';
  await page.goto(`${factUrl(work)}#${work}--skilled-sponsors-quadrupled`);
  const chart = page.locator(`[id="${work}--chart-sponsor-revocations"]`);
  // The observation's link opens the view it is about.
  await expect(showAsButton(chart, 'Registered sponsors')).toBeVisible();
  await expect(page.locator(`[id="${work}--chart-sponsors"]`)).toBeVisible();
  await expect(page.locator(`[id="${work}--chart-revocations"]`)).toBeHidden();
  // Stepping back to an observation about the other view shows that view.
  await page.locator(`[data-observation="${work}--skilled-sponsors-quadrupled"]`).getByRole('button', { name: 'Previous observation' }).click();
  await expect(page.locator(`[data-observation="${work}--revocation-rate-not-a-record"]`)).toBeVisible();
  await expect(page.locator(`[id="${work}--chart-revocations"]`)).toBeVisible();
  // Choosing a view moves to its first observation, and closes the dropdown.
  await showAs(chart, 'Licences revoked and revocation rate', 'Registered sponsors');
  await expect(page.locator(`[data-observation="${work}--skilled-sponsors-quadrupled"]`)).toBeVisible();
  await expect(chart.getByRole('group', { name: 'Show as' }).filter({ visible: true })).toHaveCount(0);
  // Graph or Table, and which view, are separate choices: changing one keeps the other.
  const display = chart.getByRole('group', { name: /display$/ }).filter({ visible: true });
  await display.getByRole('button', { name: 'Table' }).click();
  await showAs(chart, 'Registered sponsors', 'Licences revoked and revocation rate');
  await expect(chart.getByRole('group', { name: /display$/ }).filter({ visible: true }).getByRole('button', { name: 'Table' })).toHaveAttribute('aria-pressed', 'true');
  await expect(chart.locator('.sv-chart__table').filter({ visible: true })).toBeVisible();
  await chart.getByRole('group', { name: /display$/ }).filter({ visible: true }).getByRole('button', { name: 'Graph' }).click();
  await expect(showAsButton(chart, 'Licences revoked and revocation rate')).toBeVisible();
});

test('a chart with a "Show as" dropdown still fills its slide', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const work = 'work-and-study-routes';
  await page.goto(`${factUrl(work)}#${work}--chart-sponsor-revocations`);
  const chart = page.locator(`[id="${work}--chart-sponsor-revocations"]`);
  const slide = page.locator('.sv-slide').filter({ has: chart });
  const plot = chart.locator('.sv-chart__plot').filter({ visible: true });
  await expect(plot).toBeVisible();
  // The plot takes the room the slide has, not just its 12rem minimum.
  const [plotBox, slideBox] = [await plot.boundingBox(), await slide.boundingBox()];
  expect(plotBox!.height).toBeGreaterThan(slideBox!.height * 0.4);
});

test('a reading drawn alongside another shares its plot, read against a right-hand axis', async ({ page }) => {
  const economy = 'immigration-economy-and-public-finances';
  await page.goto(`${factUrl(economy)}#${economy}--total-gdp-grew`);
  const chart = page.locator(`[id="${economy}--chart-series"]`);
  // Both readings in one view, with nothing to switch.
  await expect(chart.getByRole('button', { name: /^Show as:/ })).toHaveCount(0);
  await expect(page.locator(`[data-observation="${economy}--total-gdp-grew"]`)).toBeVisible();
  await expect(chart.locator('.sv-chart__key-name').filter({ hasText: 'UK GDP (right axis)' })).toBeVisible();
  const plot = chart.locator('.sv-chart__svg:visible').first();
  await expect(plot.locator('text[data-axis="right"]').first()).toBeAttached();
  // A short title, with its detail under it.
  await expect(chart.locator('.sv-graph-heading')).toHaveText('UK GDP');
  // In a data panel the subtitle is the line More sits on.
  await expect(chart.locator('.sv-chart__about-text').first()).toContainText('1948–2025');
});

test('the old address of a chart merged into another opens the reading it became', async ({ page }) => {
  const work = 'work-and-study-routes';
  await page.goto(`${factUrl(work)}#${work}--chart-registered-sponsors`);
  await expect(showAsButton(page.locator(`[id="${work}--chart-sponsor-revocations"]`), 'Registered sponsors')).toBeVisible();
  // An address for a chart is not one for its first finding, so that stays closed.
  await expect(page.locator(`[data-observation="${work}--skilled-sponsors-quadrupled"] .sv-observe__body`)).toBeHidden();
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

test('a sources row is one line in the chart\'s More panel, and opens to each source in full', async ({ page }) => {
  await page.goto(factUrl(LONG_RUN));
  const slide = page.locator('.sv-walk__slide').first();
  await slide.locator('.sv-chart__about > summary').first().click();
  const row = slide.locator('.sv-chart__sources');
  await expect(row.locator('> summary')).toContainText(/^Sources?:/);
  expect((await row.locator('> summary').boundingBox())!.height).toBeLessThan(28);
  await row.locator('> summary').click();
  const source = row.locator('.sv-source').first();
  await expect(source.locator('a')).toHaveAttribute('href', /^https?:/);
  await expect(source.locator('blockquote')).toBeVisible();
});

test('More shows the subtitle\'s description and sources over the chart, without moving it, and Escape closes it', async ({ page }) => {
  await page.goto(factUrl(LONG_RUN));
  const slide = page.locator('.sv-walk__slide').first();
  const about = slide.locator('.sv-chart__about').first();
  const graph = slide.locator('.sv-observe').first();
  const before = (await graph.boundingBox())!.y;
  await about.locator('> summary').click();
  await expect(about.locator('.sv-chart__about-desc')).toBeVisible();
  await expect(about.locator('.sv-chart__sources')).toBeVisible();
  expect((await graph.boundingBox())!.y).toBe(before);
  await page.keyboard.press('Escape');
  await expect(about).not.toHaveAttribute('open', '');
});

test('in a sheet, Escape closes the More panel first, and only then the sheet', async ({ page }) => {
  await page.goto('/topics/us-iran-war#explore=human-and-financial-costs-of-the-war--chart-us-deaths-earlier-wars');
  const sheet = page.locator('dialog[open]');
  const about = sheet.locator('.sv-walk__slide:has([id="human-and-financial-costs-of-the-war--chart-us-deaths-earlier-wars"]) .sv-chart__about').first();
  await about.locator('> summary').click();
  await page.keyboard.press('Escape');
  await expect(about).not.toHaveAttribute('open', '');
  await expect(sheet).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
});

test('every chart kind leaves the same gap between its title and the line under it', async ({ page }) => {
  await page.goto('/topics/us-voter-id/facts/burdens-of-id-and-citizenship-rules');
  const gaps = new Set<number>();
  const tabs = page.locator('.sv-walk__tab');
  for (let i = 0; i < await tabs.count(); i++) {
    await tabs.nth(i).click();
    const slide = page.locator('.sv-walk__slide').nth(i);
    const heading = slide.locator('.sv-graph-heading').first();
    const line = slide.locator('.sv-chart__about > summary, .sv-chart__subtitle').first();
    if (!(await line.isVisible())) continue;
    gaps.add(Math.round((await line.boundingBox())!.y - ((await heading.boundingBox())!.y + (await heading.boundingBox())!.height)));
  }
  expect([...gaps]).toHaveLength(1);
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
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('Net migration pledges and outcomes');
});

test('the address a sheet expands to opens the same chart', async ({ page }) => {
  await page.goto(`${factUrl(LONG_RUN)}#${LONG_RUN}--viz-nationality`);
  await expect(page.locator('.sv-walk__tab[aria-current]')).toContainText('Arrivals by nationality');
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

// A card's "Explore this data" is a real link, for a new tab or a crawler.
test('a viewpoint card links to the collection it cites', async ({ page }) => {
  await page.goto('/topics/uk-asylum');
  const hrefs = await page.locator('.sv-row--viewpoint .sv-walk__explore a').evaluateAll(
    links => links.map(link => link.getAttribute('href') ?? '')
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/topics\/uk-asylum\/facts\/[a-z0-9-]+#/);
  // So is a claim in a card's prose, which opens its finding in a pop-up when clicked.
  await expect(page.locator('.sv-row--viewpoint .sv-deck__card a.sv-cite').first()).toHaveAttribute('href', /^\/topics\/uk-asylum\/facts\/[a-z0-9-]+#/);
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
    await page.locator('.sv-chart__about > summary').first().click();
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
