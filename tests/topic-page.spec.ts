import type { Locator } from '@playwright/test';
import { test, expect } from './hydrated-test';
import { expectChartAlone, headCorner, openChart, openViewpoint } from './topic-rows';

// These assertions depend on authored content: the topic title "UK
// immigration", its viewpoints `open-and-build` and `blame-underinvestment`,
// and which charts the uk-asylum viewpoints' cards are made with. Editing any
// of that content's wording or cards will turn this suite red.

const TOPIC = '/topics/uk-immigration';
/** Its viewpoints' content has settled, so tests of how a viewpoint behaves use it. */
const ASYLUM = '/topics/uk-asylum';

/** How far `below` starts under `above`, measured at one moment as a row still opening moves both. */
async function gapBetween(within: Locator, above: string, below: string) {
  return within.evaluate(
    (el, [upper, lower]) => el.querySelector(lower)!.getBoundingClientRect().top - el.querySelector(upper)!.getBoundingClientRect().bottom,
    [above, below],
  );
}

// There are no tabs: the viewpoints, then the cruxes, each under its heading.
test('the topic page shows its viewpoints and then its cruxes, with no tabs', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  const viewpoints = page.getByRole('heading', { name: 'Viewpoints', level: 2 });
  const cruxes = page.getByRole('heading', { name: 'Cruxes', level: 2 });
  await expect(viewpoints).toBeVisible();
  await expect(cruxes).toBeVisible();
  await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
  await expect(page.locator('.sv-row--crux').first()).toBeVisible();
  // The last viewpoint, and its section's heading, come before the cruxes' heading.
  const precedes = async (first: Locator) => cruxes.evaluate((el, other) => Boolean(other!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING), await first.elementHandle());
  expect(await precedes(viewpoints)).toBe(true);
  expect(await precedes(page.locator('.sv-row--viewpoint').last())).toBe(true);
});

// No viewpoint is put first: they come in a random order, and Shuffle deals them again.
test('the viewpoints are in random order, and Shuffle reorders them', async ({ page, browser }) => {
  const idsOn = (on: typeof page) => on.locator('.sv-row--viewpoint').evaluateAll(rows => rows.map(row => row.id));
  // Without JavaScript, the order the page was built in, and nothing to shuffle it with.
  const unscripted = await browser.newContext({ javaScriptEnabled: false });
  const builtPage = await unscripted.newPage();
  await builtPage.goto(ASYLUM);
  const built = await idsOn(builtPage);
  await expect(builtPage.getByRole('button', { name: 'Shuffle' })).toHaveCount(0);
  await unscripted.close();

  // The button appears with the shuffled order. Chance can deal the built order, so load until it doesn't.
  const shuffle = page.getByRole('button', { name: 'Shuffle' });
  await expect.poll(async () => {
    await page.goto(ASYLUM);
    await expect(shuffle).toBeVisible();
    return idsOn(page);
  }, { timeout: 20_000 }).not.toEqual(built);

  // An open row stays open at the card being read, wherever it moves to.
  const row = await openViewpoint(page, 'refuge');
  const strip = row.locator('.sv-deck__strip');
  const card = () => strip.evaluate(el => Math.round(el.scrollLeft / el.clientWidth));
  await row.locator('.sv-deck__outline-item').nth(2).click();
  await expect.poll(card).toBe(2);
  // Several times over, as a shuffle need not move this row.
  for (let i = 0; i < 6; i++) {
    const before = await idsOn(page);
    await shuffle.click();
    await expect.poll(() => idsOn(page)).not.toEqual(before);
    expect([...(await idsOn(page))].sort()).toEqual([...built].sort());
    await expect(row).toHaveAttribute('data-open', 'true');
    expect(await card()).toBe(2);
  }
});

test('a crux is plain text: it links to nothing', async ({ page }) => {
  await page.goto(TOPIC);
  const crux = page.locator('.sv-row--crux').first();
  await crux.locator('.sv-row__toggle').click(headCorner);
  await expect(crux.locator('.sv-position dt').first()).toBeVisible();
  await expect(crux.locator('.sv-positions a')).toHaveCount(0);
});

test('a link to a viewpoint loaded cold brings up the viewpoint, opened', async ({ page }) => {
  await page.goto(`${TOPIC}#viewpoint-open-and-build`);
  const viewpoint = page.locator('#viewpoint-open-and-build');
  await expect(viewpoint).toHaveAttribute('data-open', 'true');
  await expect(viewpoint).toBeInViewport();
});

test('a link to a crux loaded cold brings up the crux, opened', async ({ page }) => {
  await page.goto(TOPIC);
  const id = await page.locator('.sv-row--crux').first().getAttribute('id');
  await page.goto(`${TOPIC}#${id}`);
  const crux = page.locator(`[id="${id}"]`);
  await expect(crux).toHaveAttribute('data-open', 'true');
  await expect(crux).toBeInViewport();
});

// The sheet opens over the viewpoint, which is still there, open, once it closes.
test('a card\'s chart opens in a sheet over its viewpoint', async ({ page }) => {
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'refuge');
  const card = viewpoint.locator('.sv-deck__card').first();
  await card.locator('.sv-graph-heading').click();
  await expect(page.locator('dialog[open] .sv-walk[data-alone] .sv-chart').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(viewpoint).toBeVisible();
});

// A reader can arrive on an observation's own address (a shared link, or a
// chart on the home page). Its sheet opens over the report, and Close leaves
// it onto the report, not off the page.
test('arriving at an observation\'s address opens its chart\'s sheet, which closes onto the topic', async ({ page }) => {
  await page.goto(ASYLUM);
  const first = await openViewpoint(page, 'refuge');
  const href = await first.locator('.sv-deck__card').first().getByRole('link', { name: 'Explore this data' }).getAttribute('href');
  // The observation's own address on the topic page, not a report page.
  expect(href).toMatch(/^#asylum-claims-and-decisions--[a-z0-9-]+$/);
  // A new tab, as a shared link opens in: on this page it would be a jump within it.
  const arrived = await page.context().newPage();
  await arrived.goto(`${ASYLUM}${new URL(href!, 'http://x').hash}`);
  await expect(arrived.locator('dialog[open]')).toHaveCount(1);
  // A reload keeps the sheet, with the report still beneath it.
  await arrived.reload();
  await expect(arrived.locator('dialog[open]')).toHaveCount(1);
  await arrived.locator('dialog[open] .sv-modal__close').click();
  await expect(arrived.locator('dialog[open]')).toHaveCount(0);
  await expect(arrived).toHaveURL(new RegExp(`${ASYLUM}$`));
});

// The whole head of a row toggles it, not just its title: a click at the
// bottom edge, away from any text, must open it.
test('the whole row head opens the row, not just the title', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('.sv-row--crux').first();
  await row.scrollIntoViewIfNeeded();
  const box = await row.locator('.sv-row__head').boundingBox();
  if (!box) throw new Error('row head has no layout box');

  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 2);

  await expect(row.locator('.sv-row__toggle')).toHaveAttribute('aria-expanded', 'true');
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('every section is on the page, under its own heading', async ({ page }) => {
    await page.goto(TOPIC);
    for (const section of ['Viewpoints', 'Cruxes']) {
      await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
    }
    await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
    await expect(page.locator('.sv-row--crux').first()).toBeVisible();
  });
});

// A closed row is a title and an overview: its cards' charts load only when it opens.
test('a viewpoint loads its cards\' charts only when its row opens', async ({ page }) => {
  await page.goto(ASYLUM);
  const row = page.locator('#viewpoint-refuge');
  await expect(row.locator('.sv-row__title')).toBeVisible();
  await expect(row.locator('.sv-row__body')).toHaveAttribute('inert', '');
  await expect(row.locator('.sv-deck__card .sv-chart')).toHaveCount(0);
  await row.locator('.sv-row__toggle').click(headCorner);
  await expect(row.locator('.sv-row__body')).not.toHaveAttribute('inert', '');
  await expect(row.locator('.sv-deck__card .sv-chart').first()).toBeAttached();
});

test('a card\'s "Explore this data" opens its chart alone, at the observation it cites', async ({ page }) => {
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'bar-and-remove');
  await viewpoint.locator('.sv-deck__outline-item').nth(3).click();
  const card = viewpoint.locator('.sv-deck__card').nth(3);
  await expect(card).toBeInViewport();
  await expect(card.locator('.sv-chart').first()).toBeVisible();
  // On a card the link shows only to the keyboard; a pointer clicks the chart.
  const explore = card.getByRole('link', { name: 'Explore this data' });
  await explore.focus();
  await page.keyboard.press('Enter');

  const sheet = page.locator('dialog[open]');
  // Titled with the chart it opened, not its collection.
  await expect(sheet.locator('.sv-modal__title')).toHaveText(await card.locator('.sv-graph-heading').first().innerText());
  await expectChartAlone(sheet);
  await expect(page).toHaveURL(new RegExp(`${ASYLUM}#removals-and-what-stops-them--[a-z0-9-]+$`));

  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${ASYLUM}$`));
  await expect(viewpoint).toHaveAttribute('data-open', 'true');
  await expect(explore).toBeFocused();
});


// `sixty-percent-growth` is on a chart the `nuclear` viewpoint's first card
// is made with; `sixty-is-not-ninety` is on a chart no card shows.
test('an observation\'s address opens the chart it is about, alone, if a card shows that chart', async ({ page }) => {
  await page.goto('/topics/us-iran-war#iran-nuclear-programme--sixty-percent-growth');
  const sheet = page.locator('dialog[open]');
  await expectChartAlone(sheet);
  await expect(sheet.locator('.sv-modal__title')).toHaveText("Iran's uranium enriched to 60%");

  await page.goto('/topics/us-iran-war#iran-nuclear-programme--sixty-is-not-ninety');
  await expect(page.getByRole('heading', { name: 'Viewpoints', level: 2 })).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

test('clicking a card\'s chart opens the panel too, title included', async ({ page }) => {
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'refuge');
  const card = viewpoint.locator('.sv-deck__card').first();
  const heading = card.locator('.sv-graph-heading');
  await expect(heading.locator('a')).toHaveCount(0);
  // Pointing at the chart shows it can be clicked: its title is underlined.
  await expect(heading).not.toHaveCSS('text-decoration-line', 'underline');
  await card.locator('.sv-walk__chart--explorable').hover();
  await expect(heading).toHaveCSS('text-decoration-line', 'underline');
  await heading.click();
  await expectChartAlone(page.locator('dialog[open]'));
});

test('a pop-up first shows at its final size, not growing as its chart arrives', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'refuge');
  // The height of the sheet on every frame it can be seen, from the click until the chart is in it.
  await page.evaluate(() => {
    const heights: number[] = [];
    const record = () => {
      const panel = document.querySelector('dialog[open] .sv-modal__panel');
      if (panel && getComputedStyle(panel).opacity !== '0') {
        heights.push(Math.round(panel.getBoundingClientRect().height));
        document.documentElement.dataset.shownHeights = heights.join(' ');
      }
      requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });
  await viewpoint.locator('.sv-deck__card').first().locator('.sv-graph-heading').click();
  await expectChartAlone(page.locator('dialog[open]'));
  await page.waitForTimeout(300);
  const heights = (await page.locator('html').getAttribute('data-shown-heights'))!.split(' ');
  expect(heights.length).toBeGreaterThan(0);
  expect(new Set(heights).size).toBe(1);
});

test('on a phone, a viewpoint fits the card showing, with no empty space', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'bar-and-remove');
  await expect(viewpoint.locator('.sv-chart').first()).toBeAttached();
  const slides = viewpoint.locator('.sv-deck__slide');
  const heights = new Set<number>();
  for (let i = 0; i < await slides.count(); i++) {
    if (i > 0) await viewpoint.locator('.sv-deck__next').click();
    // A card can grow as its chart draws, so the strip and the slide are measured together.
    const gap = () => viewpoint.evaluate((el, n) => {
      const height = (box: Element) => Math.round(box.getBoundingClientRect().height);
      return height(el.querySelector('.sv-deck__strip')!) - height(el.querySelectorAll('.sv-deck__slide')[n]);
    }, i);
    await expect.poll(gap, { message: `card ${i + 1}` }).toBe(0);
    heights.add(await slides.nth(i).evaluate(el => Math.round(el.getBoundingClientRect().height)));
  }
  expect(heights.size).toBeGreaterThan(1);
});

test('on a phone, a short bar chart takes the height it needs, neither clipped nor padded', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'open-and-build');
  await expect(viewpoint.locator('.sv-comparison__rows').first()).toBeAttached();
  const slides = viewpoint.locator('.sv-walk__chart:has(.sv-comparison__rows)');
  expect(await slides.count()).toBeGreaterThan(0);
  for (const slide of await slides.all()) {
    const clipped = await slide.locator('.sv-slide').evaluate(el => el.scrollHeight > el.clientHeight);
    expect(clipped).toBe(false);
    expect(await gapBetween(slide, '.sv-comparison__rows', '.sv-walk__explore')).toBeLessThan(60);
  }
});

// `immigration-against-the-long-run/series` is the `economic-cost` viewpoint's first card.
test('a chart\'s sheet is the data: its chart opens nothing more, and has its controls', async ({ page }) => {
  const chart = await openChart(page, 'immigration-against-the-long-run', 'series');
  const sheet = page.locator('dialog[open]');
  await expect(chart).toBeVisible();
  await expect(sheet.locator('.sv-walk__explore')).toHaveCount(0);

  await sheet.locator('.sv-modal__title').click();
  await chart.locator('.sv-chart__svg:visible').first().click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);

  await chart.getByRole('button', { name: 'Table' }).first().click();
  await expect(chart.locator('table').first()).toBeVisible();
});

// `work-and-study-routes/sponsor-revocations` has two readings, and is the
// `blame-underinvestment` viewpoint's third card.
test('a card\'s chart with several readings opens in full with its "Show as" switch', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'blame-underinvestment');
  await viewpoint.locator('.sv-deck__outline-item').nth(4).click();
  const card = viewpoint.locator('.sv-deck__card').nth(4);
  await expect(card).toBeInViewport();
  // A card draws the one reading its point is about, with no switch.
  await expect(card.getByRole('button', { name: /^Show as:/ }).filter({ visible: true })).toHaveCount(0);
  await card.locator('.sv-graph-heading').first().click();

  const sheet = page.locator('dialog[open]');
  await expectChartAlone(sheet);
  await expect(page).toHaveURL(/#work-and-study-routes--/);
  // Its "Show as" dropdown offers every reading.
  await sheet.getByRole('button', { name: /^Show as:/ }).filter({ visible: true }).click();
  const showAs = sheet.getByRole('group', { name: 'Show as' }).filter({ visible: true });
  await expect(showAs.getByRole('button')).toHaveText(['Licences revoked and revocation rate', 'Registered sponsors']);
  await showAs.getByRole('button', { name: 'Registered sponsors' }).click();
  await expect(sheet.locator('[id="work-and-study-routes--chart-sponsors"]')).toBeVisible();
  await expect(sheet.locator('[id="work-and-study-routes--chart-revocations"]')).toBeHidden();
  // Its sources and its "About this chart" come with it.
  await expect(sheet.locator('.sv-chart__about').filter({ visible: true }).first()).toBeVisible();
});

test('a pop-up closes around its chart, a graph keeping a wide shape, in the middle of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(`${ASYLUM}#asylum-claims-and-decisions--chart-series`);
  const sheet = page.locator('dialog[open] .sv-modal__panel');
  const bottom = async (locator: Locator) => { const box = (await locator.boundingBox())!; return box.y + box.height; };
  // A sheet is shown only once its chart has arrived, and so has its final size.
  const settled = () => expect(sheet).toHaveCSS('opacity', '1');
  await settled();
  // The Graph/Table switch stands apart from the legend under it.
  const legend = (await sheet.locator('.sv-chart__legend').filter({ visible: true }).first().boundingBox())!;
  expect(legend.y - await bottom(sheet.locator('.sv-chart__view-controls').filter({ visible: true }).first())).toBeGreaterThanOrEqual(8);
  // The graph keeps a wide shape, as steeper lines read worse, and the sheet ends just under it.
  const graph = (await sheet.locator('.sv-chart__svg:visible').first().boundingBox())!;
  expect(graph.width / graph.height).toBeGreaterThan(2.3);
  expect(graph.width).toBeGreaterThan(1000);
  expect(await bottom(sheet) - (graph.y + graph.height)).toBeLessThan(80);
  // A sheet shorter than the screen stays in the middle of it.
  const box = (await sheet.boundingBox())!;
  expect(Math.abs(box.y - (900 - (box.y + box.height)))).toBeLessThan(4);

  // Rows of bars keep their own height, and the sheet closes around them too.
  // A fresh load each time, so the sheet measured is the one just opened.
  await page.goto('/');
  await page.goto(`${ASYLUM}#removals-and-what-stops-them--chart-detention-issues`);
  await settled();
  const bars = sheet.locator('.sv-comparison');
  expect(await bottom(sheet) - await bottom(bars.locator('.sv-comparison__scale'))).toBeLessThan(80);
  // The rows are not spread apart: each is only as tall as its label and bar.
  const spare = await bars.locator('.sv-comparison__rows > li').evaluateAll(items => items.map(item =>
    item.getBoundingClientRect().height - Math.max(...[...item.querySelectorAll('*')].map(child => child.getBoundingClientRect().height))));
  expect(spare.length).toBeGreaterThan(1);
  for (const extra of spare) expect(extra).toBeLessThan(2);

  // Rows that open fit whole too: the last row's tap target does not reach past the chart and make it scroll.
  await page.goto('/');
  await page.goto('/topics/us-iran-war#human-and-financial-costs-of-the-war--deaths-in-the-thousands');
  await settled();
  await expect(sheet.locator('.sv-row-detail').first()).toBeVisible();
  expect(await sheet.locator('.sv-slide').evaluate(slide => slide.scrollHeight - slide.clientHeight)).toBe(0);
});

test('a chart\'s subtitle line in its sheet opens its More panel', async ({ page }) => {
  const chart = await openChart(page, 'immigration-against-the-long-run', 'series');
  const about = chart.locator('.sv-chart__about').first();
  await expect(about).toBeVisible();
  await expect(about).not.toHaveAttribute('open');
  // The sheet is still settling as it opens, which can swallow the first click.
  await expect(async () => {
    await about.locator('> summary').click();
    await expect(about).toHaveAttribute('open', '', { timeout: 500 });
  }).toPass();
});

test('a thumbnail still moves the row after it was closed on another card', async ({ page }) => {
  await page.goto(ASYLUM);
  const row = page.locator('#viewpoint-refuge');
  const thumb = row.locator('.sv-walk__thumb').nth(2);
  await thumb.click();
  await row.locator('.sv-deck__outline-item').first().click();
  await row.locator('.sv-row__toggle').click(headCorner);
  await thumb.click();
  await expect(row.locator('.sv-deck__outline-item').nth(2)).toHaveAttribute('aria-current', 'step');
});

test('a keyboard reader keeps their place when a thumbnail opens the row', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  const thumb = row.locator('.sv-walk__thumb').nth(1);
  await thumb.focus();
  await page.keyboard.press('Enter');
  await expect(row.locator('.sv-row__toggle')).toBeFocused();
});

// The trial slideshow layout (components/viewpoints/viewpoint-slides.tsx).
const SLIDES_TOPIC = '/topics/uk-asylum';
const SLIDES_VIEWPOINT = '#viewpoint-refuge';

// A source quote can run long, so the passages the claim rests on are picked out.
test('a source\'s quote picks out the passage the claim rests on', async ({ page }) => {
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'bar-and-remove');
  await viewpoint.locator('.sv-deck__card').nth(2).locator('.sv-deck__reasoning a.sv-source-marker').first().click();
  const popup = page.locator('dialog[open]');
  await expect(popup.locator('blockquote mark').filter({ hasText: 'more small boats leaving from Belgium' })).toBeVisible();
  // The highlight ends at its words, not the space after them.
  for (const text of await popup.locator('blockquote mark').allTextContents()) expect(text).toBe(text.trim());
});

test.describe('a slideshow viewpoint on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('each card makes its point, completes it in one line with nothing behind it, and shows the graph that line cites', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    await page.locator(`${SLIDES_VIEWPOINT} .sv-row__toggle`).click(headCorner);
    const deck = page.locator(`${SLIDES_VIEWPOINT} .sv-deck`);
    await expect(deck.locator('.sv-deck__outline')).toBeHidden();
    const card = deck.locator('.sv-deck__card').first();
    await expect(card.locator('.sv-deck__heading')).toContainText('fleeing real danger');
    await expect(card.locator('.sv-deck__reasoning')).toContainText('would face danger if sent back');
    // One graph a card: a phone has room for no more.
    await expect(card.locator('.sv-chart')).toHaveCount(1);
    await expect(card.locator('.sv-chart__caption')).toContainText('Initial decisions on small-boat arrivals');
    // The line is the card's only text: nothing opens under it.
    await expect(card.locator(':scope > details, .sv-deck__prose')).toHaveCount(0);

    await deck.getByRole('button', { name: /Next/ }).click();
    const line = deck.locator('.sv-deck__card').nth(1);
    await expect(line).toBeInViewport();
    // A line graph on a phone is drawn at its portrait shape.
    await expect(line.locator('.sv-chart__variant[data-variant="preview-portrait"]')).toBeVisible();

    // A numbered circle per point goes to it, and the one showing is marked.
    await expect(deck.getByRole('button', { name: /^Point 3:/ })).toHaveText('3');
    await deck.getByRole('button', { name: /^Point 3:/ }).click();
    await expect(deck.locator('.sv-deck__card').nth(2)).toBeInViewport();
    await expect(deck.getByRole('button', { name: /^Point 3:/ })).toHaveAttribute('aria-current', 'step');
  });

  test('open, a viewpoint runs to the screen\'s edges, its arrow on the title\'s line', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    const row = page.locator(SLIDES_VIEWPOINT);
    // The arrow sits on the head's first line: the title's, or an "AI draft" tag's above it, as on a crux.
    const tag = row.locator('.sv-row__meta');
    const firstLine = (await tag.count()) > 0 ? await tag.boundingBox() : await row.locator('.sv-row__title').boundingBox();
    const chevron = await row.locator('.sv-row__chevron').boundingBox();
    expect(Math.abs(chevron!.y + chevron!.height / 2 - (firstLine!.y + 14))).toBeLessThan(16);
    await row.locator('.sv-row__toggle').click(headCorner);
    await expect(row).toHaveAttribute('data-open', 'true');
    await expect.poll(async () => (await row.boundingBox())!.width).toBe(390);
  });

  test('open, a crux also runs to the screen\'s edges', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    const row = page.locator('.sv-row--crux').first();
    await row.locator('.sv-row__toggle').click(headCorner);
    await expect(row).toHaveAttribute('data-open', 'true');
    await expect.poll(async () => (await row.boundingBox())!.width).toBe(390);
  });

  test('open, a topic on the home page also runs to the screen\'s edges, growing from its card', async ({ page }) => {
    await page.goto('/');
    const row = page.locator('.sv-row').nth(1);
    expect((await row.boundingBox())!.width).toBeLessThan(390);
    await row.locator('.sv-row__toggle').click(headCorner);
    await expect(row).toHaveAttribute('data-open', 'true');
    // The width is a transition, not a jump.
    expect(await row.evaluate(el => getComputedStyle(el).transitionProperty)).toMatch(/margin/);
    await expect.poll(async () => (await row.boundingBox())!.width).toBe(390);
  });

  // The card's words and its graph make the point. A claim is plain text with a
  // footnote marker, which opens its sources' own words, never text of ours.
  test('a claim\'s footnote marker opens the quotes from its sources', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    await page.locator(`${SLIDES_VIEWPOINT} .sv-row__toggle`).click(headCorner);
    const line = page.locator(`${SLIDES_VIEWPOINT} .sv-deck__card`).first().locator('.sv-deck__reasoning');
    await expect(line.locator('a.sv-cite')).toHaveCount(0);
    const marker = line.locator('a.sv-source-marker').first();
    await expect(marker).toHaveText('1');
    await marker.click();
    const popup = page.locator('dialog[open]');
    await expect(popup.locator('.sv-modal__eyebrow')).toHaveText(/^Sources?$/);
    await expect(popup.locator('blockquote').first()).not.toBeEmpty();
    await expect(popup.locator('figcaption a').first()).toHaveAttribute('href', /^https?:/);
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(marker).toBeFocused();
  });


  test('a card\'s point about a trend is drawn as a line over every year', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    const row = page.locator('#viewpoint-bar-and-remove');
    await row.locator('.sv-row__toggle').click(headCorner);
    await row.getByRole('button', { name: /^Point 4:/ }).click();
    const card = row.locator('.sv-deck__card').nth(3);
    await expect(card.locator('.sv-deck__heading')).toContainText('Claiming asylum');
    await expect(card.locator('.sv-chart__caption')).toContainText('Asylum claims and later returns');
    // The share each year, as lines, from the first year of claims to the last.
    const graph = card.locator('.sv-chart__variant[data-variant="preview-portrait"]');
    await expect(graph).toBeVisible();
    await expect(card.locator('.sv-chart__legend')).toContainText('Returns as a share of refused and withdrawn');
    // Of everyone who claims, not only those refused.
    await expect(card.locator('.sv-chart__legend')).toContainText('Returns as a share of all claims');
    await expect(graph.locator('text', { hasText: /^2007$/ })).toHaveCount(1);
    await expect(graph.locator('text', { hasText: /^2025$/ })).toHaveCount(1);
  });
});

test('a slideshow viewpoint on a wide screen lists its points down the left, a point whose line cites no graph giving its evidence in full', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(SLIDES_TOPIC);
  await page.locator(`${SLIDES_VIEWPOINT} .sv-row__toggle`).click(headCorner);
  const outline = page.locator(`${SLIDES_VIEWPOINT} .sv-deck__outline`);
  await expect(outline).toBeVisible();
  // With the list showing, the numbered circles would only repeat it.
  await expect(page.locator(`${SLIDES_VIEWPOINT} .sv-deck__points`)).toBeHidden();
  // One card per step of the argument, the last its conclusion. Readers' suggestions are outside that list.
  await expect(outline.locator('li')).toHaveCount(7);
  await expect(outline.locator('li').last()).toContainText('So Britain should open safe routes, decide claims fairly, and let people work');
  await expect(outline.locator('.sv-deck__afterword')).toHaveText('Readers’ suggestions');
  const conclusion = outline.getByRole('button', { name: /So Britain should open safe routes/ });
  await conclusion.click();
  await expect(conclusion).toHaveAttribute('aria-current', 'step');
  // Its line cites a table, which reads as more text, so the card gives its evidence in full.
  const card = page.locator(`${SLIDES_VIEWPOINT} .sv-deck__card`).nth(6);
  await expect(card).toBeInViewport();
  await expect(card.locator('.sv-chart')).toHaveCount(0);
  await expect(card.locator('.sv-deck__reasoning')).toContainText('set resettlement numbers');
  await expect(card.locator('.sv-deck__prose')).toContainText('would still apply');
});

// The browser tests run with no database (playwright.config.ts), so feedback
// shows its empty state and says posting is switched off.
test('a viewpoint ends with a slide for suggestions, which opens the box to make one', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(TOPIC);
  const row = await openViewpoint(page, 'keep-our-word');
  // The argument ends at its conclusion: the count stops there, and the way on says it leads out.
  const points = await row.locator('.sv-deck__outline-item').count();
  await row.locator('.sv-deck__outline-item').last().click();
  await expect(row.locator('.sv-deck__count')).toHaveText(`${points} / ${points}`);
  await expect(row.locator('.sv-deck__next')).toHaveText('Suggestions ›');
  await row.locator('.sv-deck__next').click();
  const slide = row.locator('.sv-feedback');
  await expect(slide).toBeInViewport();
  // Past it, no point is current and nothing is counted.
  await expect(row.locator('.sv-deck__outline-item[aria-current]')).toHaveCount(0);
  await expect(row.locator('.sv-deck__outline .sv-deck__afterword')).toHaveAttribute('aria-current', 'true');
  await expect(row.locator('.sv-deck__count')).toBeEmpty();
  await expect(slide).toContainText('Not part of the argument.');
  await expect(slide.locator('.sv-deck__heading')).toHaveCount(0);
  await expect(slide).toContainText('Readers’ suggestions');
  await expect(slide).toContainText('No one has suggested anything yet. Be the first to make this argument stronger.');
  await expect(slide.locator('textarea')).toHaveCount(0);

  await slide.getByRole('button', { name: 'Add a suggestion' }).click();
  const sheet = page.locator('dialog.sv-modal');
  await expect(sheet.getByRole('heading', { name: 'Make “Keep our word” stronger' })).toBeVisible();
  await expect(sheet).toContainText('Strengthen an opposing viewpoint, or debate a crux.');
  await expect(sheet.getByPlaceholder('What would make this argument stronger?')).toBeVisible();
  await expect(sheet.getByRole('combobox')).toContainText('Card 6: So change the terms only for people who have not yet come');
  await expect(sheet).toContainText('Posting isn’t switched on here.');
  // With posting off there is nothing to sign in for.
  await expect(sheet.getByRole('button', { name: /Sign in/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(slide.getByRole('button', { name: 'Add a suggestion' })).toBeFocused();
});

test('an open crux ends with its discussion, which opens the box to join it', async ({ page }) => {
  await page.goto(TOPIC);
  const crux = page.locator('#crux-will-recent-arrivals-integrate');
  await crux.locator('.sv-row__toggle').click(headCorner);
  const discussion = crux.locator('.sv-discussion');
  await expect(discussion).toContainText('No one has commented yet.');
  await discussion.getByRole('button', { name: 'Start the discussion' }).click();
  const sheet = page.locator('dialog.sv-modal');
  await expect(sheet.getByPlaceholder('What would change your mind on this?')).toBeVisible();
  await expect(sheet).toContainText('Posting isn’t switched on here.');
  await expect(sheet.getByRole('button', { name: /Sign in/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(discussion.getByRole('button', { name: 'Start the discussion' })).toBeFocused();
});

test('the viewpoints end with a way to suggest one the page is missing', async ({ page }) => {
  await page.goto(TOPIC);
  const suggest = page.getByRole('button', { name: /Suggest a viewpoint/ });
  await suggest.click();
  const sheet = page.locator('dialog.sv-modal');
  await expect(sheet.getByRole('heading', { name: 'Suggest a viewpoint this page is missing' })).toBeVisible();
  await expect(sheet).toContainText('Posting isn’t switched on here.');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(suggest).toBeFocused();
});

test('the arrow keys step through a viewpoint\'s slides', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(SLIDES_TOPIC);
  const row = await openViewpoint(page, SLIDES_VIEWPOINT.slice('#viewpoint-'.length));
  const count = row.locator('.sv-deck__count');
  await expect(count).toHaveText(/^1 \/ \d+$/);
  const strip = row.locator('.sv-deck__strip');
  await strip.press('ArrowRight');
  await expect(count).toHaveText(/^2 \/ \d+$/);
  await strip.press('ArrowLeft');
  await expect(count).toHaveText(/^1 \/ \d+$/);
});

test('a closed slideshow viewpoint previews its graphs, and a graph opens the row at its card', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(SLIDES_TOPIC);
  const row = page.locator(SLIDES_VIEWPOINT);
  // A graph on each of its first six cards; its conclusion is a card of text.
  const thumbs = row.locator('.sv-walk__thumb');
  await expect(thumbs).toHaveCount(6);
  await expect(thumbs.nth(3)).toContainText('4. A safe route lets Britain choose who comes');
  await thumbs.nth(3).click();
  await expect(row.locator('.sv-deck__outline-item[aria-current]')).toContainText('A safe route lets Britain choose who comes');
  await expect(row.locator('.sv-deck__card').nth(3)).toBeInViewport();
});

test('a slideshow card can be made with a map of where the boats leave from', async ({ page }) => {
  await page.goto(SLIDES_TOPIC);
  const row = page.locator('#viewpoint-bar-and-remove');
  await row.locator('.sv-row__toggle').click(headCorner);
  await row.locator('.sv-deck__outline-item').nth(2).click();
  const card = row.locator('.sv-deck__card').nth(2);
  await expect(card.locator('.sv-deck__heading')).toContainText('already reached a safe country');
  await expect(card.locator('.sv-chart__caption')).toContainText('Where the small boats leave from');
  // An arrow from each coast the boats leave from, each named, to Kent.
  await expect(card.locator('.sv-geo-map__flow')).toHaveCount(2);
  await expect(card.locator('.sv-geo-map__flow-label')).toHaveText(['Northern French beaches', 'Belgian coast', 'Kent']);
  // Clicking the map opens its data, and nothing else: not also a pop-up for a claim behind it.
  await card.locator('.sv-geo-map__svg').locator('visible=true').first().click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await expect(page.locator('dialog[open] .sv-factpanel')).toHaveCount(1);
});

test('a slideshow card can be made with quotes: those its point rests on, and the whole collection a click away', async ({ page }) => {
  await page.goto(SLIDES_TOPIC);
  const row = page.locator('#viewpoint-bar-and-remove');
  await row.locator('.sv-row__toggle').click(headCorner);
  await row.locator('.sv-deck__outline-item').nth(4).click();
  const card = row.locator('.sv-deck__card').nth(4);
  await expect(card.locator('.sv-deck__heading')).toContainText('Human-rights law stops removals');
  const quotes = card.locator('.sv-card-quotes');
  await expect(quotes.locator('.sv-chart__caption')).toContainText('What do the Home Office and others say human-rights law does to removals?');
  // The Home Office's two quotes, stacked, and no slideshow within the slideshow.
  await expect(quotes.locator('.sv-card-quotes__item')).toHaveCount(2);
  await expect(quotes.locator('.sv-card-quotes__item').first()).toContainText('Home Office');
  await expect(quotes.locator('.sv-carousel__dot')).toHaveCount(0);
  await expect(quotes.locator('.sv-card-quotes__more')).toHaveText('2 of 6 quotes · See all');
  // See all opens the whole collection, which a reader can filter.
  await quotes.locator('.sv-card-quotes__all').click();
  // The data, and only the data: not also a pop-up for the link that opens it.
  const sheet = page.locator('dialog[open]');
  await expect(sheet).toHaveCount(1);
  await expect(sheet.locator('.sv-quote-browser .sv-control__status')).toHaveText('Showing 6 of 6 quotes');
  await expect(sheet.locator('.sv-quote-browser').getByRole('button', { name: 'Search quotes and speakers' })).toHaveCount(1);
  // Opened from See all, the card's two quotes come first, outlined, in the card's order.
  const items = sheet.locator('.sv-quote-browser__item');
  const cardQuote = (n: number) => quotes.locator('.sv-card-quotes__text').nth(n).innerText();
  const first = (await cardQuote(0)).replace(/^“|”$/g, '');
  const second = (await cardQuote(1)).replace(/^“|”$/g, '');
  await expect(sheet.getByRole('button', { name: /Order: Highlighted first/ })).toHaveCount(1);
  await expect(items.nth(0)).toContainText(first);
  await expect(items.nth(1)).toContainText(second);
  await expect(sheet.locator('.sv-quote-browser__item[data-highlighted]')).toHaveCount(2);
  // Clicking one quote on the card puts that one first, and outlines it alone.
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await quotes.locator('.sv-card-quotes__item').nth(1).click();
  await expect(items.nth(0)).toContainText(second);
  await expect(sheet.locator('.sv-quote-browser__item[data-highlighted]')).toHaveCount(1);
});

// us-vote-by-mail quotes in two reports: the Supreme Court in Watson v. RNC, and
// research on whether rule changes move trust in results. The Watson quotes
// are the `election-day-receipt` viewpoint's first card.
test('a quotes chart opened in full lists every quote on its topic, which a reader can narrow to one question', async ({ page }) => {
  await openChart(page, 'ballot-deadlines-and-counting-speed', 'watson', '/topics/us-vote-by-mail');
  const quotes = page.locator('dialog[open] .sv-quote-browser');
  await expect(quotes.locator('.sv-graph-heading')).toHaveText('Every quote on this topic');
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 5 of 5 quotes');
  // Each question is a line of the Question dropdown.
  await quotes.getByRole('button', { name: 'Question: All' }).click();
  await quotes.locator('.sv-bar__pop:popover-open').getByRole('button', { name: /Watson v\. RNC/ }).click();
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 3 of 5 quotes');
});
