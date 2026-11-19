import type { Locator, Page } from '@playwright/test';
import { test, expect } from './hydrated-test';
import { expectChartAlone, headCorner, openDataRow, openTab, openViewpoint } from './topic-rows';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the report `immigration-against-the-long-run`, and
// the viewpoint `open-and-build` with the link text it uses for
// `work-and-study-routes`. Editing any of that content's wording or
// cross-references will turn this suite red.

const TOPIC = '/topics/uk-immigration';
const DATA = `${TOPIC}#data`;
/** Its viewpoints' content has settled, so tests of how a viewpoint behaves use it. */
const ASYLUM = '/topics/uk-asylum';
const longRun = 'UK Migration and Population Over the Long Run';

/** Put a scrolling box, at its own top, at the top of the screen, and the mouse over it. */
async function hoverAtTop(page: Page, box: Locator) {
  await expect(box).toBeVisible();
  // Repeated until it holds, as a row opening keeps the page in place until it has opened.
  await expect(async () => {
    await box.evaluate(el => {
      el.scrollTop = 0;
      window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 10, behavior: 'instant' });
    });
    await page.waitForTimeout(200);
    expect(Math.round((await box.boundingBox())!.y)).toBe(10);
  }).toPass();
  const { x, y, width } = (await box.boundingBox())!;
  await page.mouse.move(x + width / 2, y + 40);
}

/** How far `below` starts under `above`, measured at one moment as a row still opening moves both. */
async function gapBetween(within: Locator, above: string, below: string) {
  return within.evaluate(
    (el, [upper, lower]) => el.querySelector(lower)!.getBoundingClientRect().top - el.querySelector(upper)!.getBoundingClientRect().bottom,
    [above, below],
  );
}

/** Wheel up over `table`, already at its top: the page should move instead. */
async function expectWheelMovesPage(page: Page, table: Locator) {
  await hoverAtTop(page, table);
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(0);
  await page.mouse.wheel(0, -100);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before);
}

test('the topic page opens on its viewpoints, and the two tabs show one panel at a time', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  const tabs = page.getByRole('navigation', { name: 'Sections of this topic' }).getByRole('link');
  await expect(tabs).toHaveText(['Viewpoints', 'Data']);
  await expect(tabs.first()).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Principles', level: 2 })).toHaveCount(0);
  await expect(page.locator('.sv-row--data').first()).toBeHidden();

  await openTab(page, 'Data');
  await expect(page).toHaveURL(new RegExp(`${DATA}$`));
  await expect(page.locator('.sv-row--data').first()).toBeVisible();
  await expect(page.locator('.sv-row--viewpoint').first()).toBeHidden();

  await page.goBack();
  await expect(page.locator('.sv-row--viewpoint').first()).toBeVisible();
});

test('the cruxes show below either tab', async ({ page }) => {
  await page.goto(TOPIC);
  const heading = page.getByRole('heading', { name: 'Cruxes', level: 2 });
  await expect(heading).toBeVisible();
  await expect(page.locator('.sv-row--crux').first()).toBeVisible();
  await openTab(page, 'Data');
  await expect(heading).toBeVisible();
  await expect(page.locator('.sv-row--crux').first()).toBeVisible();
});

// The tabs do not reach the cruxes, so their bar must not follow a reader there.
test('the tab bar stays with the tabs, not over the cruxes', async ({ page }) => {
  await page.goto(TOPIC);
  await page.getByRole('heading', { name: 'Cruxes', level: 2 }).evaluate(el => el.scrollIntoView({ block: 'start' }));
  await expect(page.locator('.sv-topic-tabs')).not.toBeInViewport();
});

test('a tab has its own address', async ({ page }) => {
  await page.goto(DATA);
  await expect(page.locator('.sv-row--data').first()).toBeVisible();
  await expect(page.locator('.sv-row--viewpoint').first()).toBeHidden();
});

test('the tabs stay on screen, and a new tab starts at its top', async ({ page }) => {
  await page.goto(TOPIC);
  await page.evaluate(() => window.scrollTo(0, 700));
  await openTab(page, 'Data');
  await expect(page.locator('.sv-row--data').first()).toBeInViewport();
  const tabs = page.locator('.sv-topic-tabs');
  await expect.poll(() => tabs.evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(1);
});

test('a tab keeps its open rows while another is showing', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'open-and-build');
  await openTab(page, 'Data');
  await openTab(page, 'Viewpoints');
  await expect(viewpoint).toHaveAttribute('data-open', 'true');
});

test('a crux is plain text: it links to nothing', async ({ page }) => {
  await page.goto(DATA);
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

// The sheet's data panel sits on the Data tab, closed or not.
test('a viewpoint opens a data panel without leaving its tab', async ({ page }) => {
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
test('arriving at an observation\'s address opens its data panel, which closes onto the report', async ({ page }) => {
  await page.goto(ASYLUM);
  const first = await openViewpoint(page, 'refuge');
  const href = await first.locator('.sv-deck__card').first().getByRole('link', { name: 'Explore this data' }).getAttribute('href');
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
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.scrollIntoViewIfNeeded();
  const box = await row.locator('.sv-row__head').boundingBox();
  if (!box) throw new Error('row head has no layout box');

  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 2);

  await expect(row.locator('.sv-row__toggle')).toHaveAttribute('aria-expanded', 'true');
});

/** Where the page stands on each frame for a moment, once `act` has run. */
async function scrollAfter(page: Page, act: () => Promise<void>): Promise<number[]> {
  const frames = page.evaluate(() => new Promise<number[]>(resolve => {
    const seen: number[] = [];
    const start = performance.now();
    const record = (now: number) => {
      seen.push(scrollY);
      if (now - start < 900) requestAnimationFrame(record);
      else resolve(seen);
    };
    requestAnimationFrame(record);
  }));
  await act();
  return frames;
}

const stops = (frames: number[]) => new Set(frames).size;

test('a tab moves the page up in an animation', async ({ page }) => {
  await page.goto(TOPIC);
  await page.evaluate(() => window.scrollTo(0, 900));
  expect(stops(await scrollAfter(page, () => openTab(page, 'Data')))).toBeGreaterThan(5);
  await expect(page.locator('.sv-row--data').first()).toBeInViewport();
});

test('a reader who asked for less motion is moved at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(TOPIC);
  await page.evaluate(() => window.scrollTo(0, 900));
  expect(stops(await scrollAfter(page, () => openTab(page, 'Data')))).toBeLessThanOrEqual(3);
  await expect(page.locator('.sv-row--data').first()).toBeInViewport();
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('every section is on the page, under its own heading', async ({ page }) => {
    await page.goto(TOPIC);
    await expect(page.locator('.sv-topic-tabs')).toBeHidden();
    for (const section of ['Viewpoints', 'Data', 'Cruxes']) {
      await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
    }
    await expect(page.locator('.sv-row--data').first()).toBeVisible();
    await expect(page.locator('.sv-row--crux').first()).toBeVisible();
  });
});

// A closed row is a title and an overview: its charts load only when it opens.
test('a data collection loads its charts only when its row opens', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await expect(row.locator('.sv-row__title')).toBeVisible();
  await expect(row.locator('.sv-row__body')).toHaveAttribute('inert', '');
  await expect(row.locator('.sv-slide .sv-chart')).toHaveCount(0);
  await row.locator('.sv-row__toggle').click(headCorner);
  await expect(row.locator('.sv-row__body')).not.toHaveAttribute('inert', '');
  await expect(row.locator('.sv-slide .sv-chart').first()).toBeAttached();
});

test('a viewpoint opens the data panel, not a report, at the step it cites', async ({ page }) => {
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'bar-and-remove');
  await viewpoint.locator('.sv-deck__outline-item').nth(1).click();
  const card = viewpoint.locator('.sv-deck__card').nth(1);
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
  await expect(page).toHaveURL(new RegExp(`${ASYLUM}#removals-and-what-stops-them--`));

  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${ASYLUM}$`));
  await expect(viewpoint).toHaveAttribute('data-open', 'true');
  await expect(explore).toBeFocused();
});

test('a claim\'s "See the data" opens the chart behind it alone', async ({ page }) => {
  await page.goto(ASYLUM);
  const viewpoint = await openViewpoint(page, 'bar-and-remove');
  await viewpoint.locator('.sv-deck__outline-item').nth(1).click();
  await viewpoint.locator('.sv-deck__card').nth(1).locator('.sv-deck__reasoning a[href$="--fewer-refused-recorded-leaving"]').first().click();
  await page.locator('dialog[open]').getByRole('link', { name: 'See the data' }).click();

  const sheet = page.locator('dialog[open]');
  await expectChartAlone(sheet);
  // Nothing on the chart is picked out or dimmed: no observation is shown to explain it.
  await expect(sheet.locator('[data-mark-dimmed], [data-mark-picked], [data-mark-shown]')).toHaveCount(0);
});

test('a subtlety\'s address opens the chart it is about, alone', async ({ page }) => {
  await page.goto('/topics/us-iran-war/facts/iran-nuclear-programme');
  const heading = await page.locator('.sv-walk__step:has([data-observation$="--sixty-is-not-ninety"]) .sv-graph-heading').first().innerText();
  await page.goto('/topics/us-iran-war#iran-nuclear-programme--sixty-is-not-ninety');
  const sheet = page.locator('dialog[open]');
  await expectChartAlone(sheet);
  await expect(sheet.locator('.sv-modal__title')).toHaveText(heading);
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

test('scrolling up over a table at its top moves the page', async ({ page }) => {
  await page.setViewportSize({ width: 601, height: 800 });
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-row__toggle').click(headCorner);
  const step = row.locator('.sv-walk__slide').first();
  await step.getByRole('button', { name: 'Table' }).dispatchEvent('click');
  await expectWheelMovesPage(page, step.locator('.sv-chart__table-scroll').first());
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

test('a data panel is the data: its charts open nothing, and have their controls', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-row__toggle').click(headCorner);
  const step = row.locator('.sv-walk__slide').first();
  await expect(step.locator('.sv-chart').first()).toBeVisible();
  await expect(row.locator('.sv-walk__explore')).toHaveCount(0);

  await step.locator('.sv-graph-heading').click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);

  await step.getByRole('button', { name: 'Table' }).click();
  await expect(step.locator('table').first()).toBeVisible();
});

test('a short bar chart spreads its bars a little, with its scale under them, in a tall panel', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, 'Immigration, the Economy and the Public Finances');
  await row.locator('.sv-walk__tab', { hasText: 'Who pays UK universities' }).click();
  const chart = row.locator('.sv-comparison').filter({ hasText: 'Who pays UK universities' });
  const bars = chart.locator('.sv-comparison__rows > li');
  await expect(bars).toHaveCount(2);
  const first = await bars.first().boundingBox();
  const second = await bars.last().boundingBox();
  const scale = await chart.locator('.sv-comparison__scale').boundingBox();
  expect(second!.y - first!.y).toBeGreaterThan(55);
  expect(second!.y - first!.y).toBeLessThan(65);
  expect(scale!.y - (second!.y + second!.height)).toBeLessThan(40);
});

test('a pop-up closes around its chart, a graph keeping a wide shape, in the middle of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(`${ASYLUM}#asylum-claims-and-decisions--uk-per-head-now-at-eu-average`);
  const sheet = page.locator('dialog[open] .sv-modal__panel');
  const bottom = async (locator: Locator) => { const box = (await locator.boundingBox())!; return box.y + box.height; };
  // A sheet is shown only once its chart has arrived, and so has its final size.
  const settled = () => expect(sheet).toHaveCSS('opacity', '1');
  await settled();
  // The Graph/Table switch stands apart from the legend under it.
  const legend = (await sheet.locator('.sv-chart__legend').boundingBox())!;
  expect(legend.y - await bottom(sheet.locator('.sv-chart__view-controls'))).toBeGreaterThanOrEqual(8);
  // The graph keeps a wide shape, as steeper lines read worse, and the sheet ends just under it.
  const graph = (await sheet.locator('.sv-chart__svg:visible').first().boundingBox())!;
  expect(graph.width / graph.height).toBeGreaterThan(2.3);
  expect(graph.width).toBeGreaterThan(1000);
  expect(await bottom(sheet) - (graph.y + graph.height)).toBeLessThan(80);
  // A sheet shorter than the screen stays in the middle of it.
  const box = (await sheet.boundingBox())!;
  expect(Math.abs(box.y - (900 - (box.y + box.height)))).toBeLessThan(4);

  // A fresh load each time, so the sheet measured is the one just opened.
  await page.goto('/');
  await page.goto(`${ASYLUM}#deterrence-and-protection-policies--turnbacks-need-departure-country`);
  await settled();
  const cards = sheet.locator('.sv-walk__slide').first();
  expect(await bottom(sheet) - await bottom(cards)).toBeLessThan(80);
  expect((await sheet.boundingBox())!.height).toBeLessThan(600);

  // Rows of bars keep their own height, and the sheet closes around them too.
  // A fresh load each time, so the sheet measured is the one just opened.
  await page.goto('/');
  await page.goto(`${ASYLUM}#asylum-claims-and-decisions--why-the-grant-rate-fell`);
  await settled();
  const bars = sheet.locator('.sv-comparison');
  expect(await bottom(sheet) - await bottom(bars.locator('.sv-comparison__scale'))).toBeLessThan(80);
  expect((await sheet.boundingBox())!.height).toBeLessThan(600);
});

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`a data panel's observation sits between its title and its graph at ${viewport.width}px wide`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(TOPIC);
    const row = await openDataRow(page, longRun);
    const step = row.locator('.sv-walk__slide').first();
    const title = await step.locator('.sv-graph-heading').first().boundingBox();
    const observation = await step.locator('.sv-observe').boundingBox();
    const graph = await step.locator('.sv-chart__svg:visible').first().boundingBox();
    expect(title!.y + title!.height).toBeLessThanOrEqual(observation!.y);
    expect(observation!.y + observation!.height).toBeLessThanOrEqual(graph!.y);
    const slide = step.locator('.sv-slide');
    await expect.poll(() => slide.evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(0);
  });
}

test('clicking an observation\'s text opens its reasoning', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, longRun);
  const step = row.locator('.sv-walk__slide').first();
  await expect(step.locator('.sv-chart').first()).toBeVisible();
  const observation = step.locator('.sv-observe__item:visible');
  await expect(observation.locator('.sv-walk__prose')).toBeHidden();
  const line = await observation.boundingBox();
  expect(line!.height).toBeLessThan(40);
  const claim = observation.locator('.sv-observe__claim');
  await claim.click();
  await expect(observation.locator('.sv-walk__prose')).toContainText('813,000 people moved to the UK');
  await expect(observation.getByRole('button', { name: 'Gross immigration' })).toHaveAttribute('aria-expanded', 'true');
  await claim.click();
  await expect(observation.locator('.sv-walk__prose')).toBeHidden();
});

test('the whole observation bubble opens and closes, shows it can, and leaves its arrows alone', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, longRun);
  const step = row.locator('.sv-walk__slide').first();
  await expect(step.locator('.sv-chart').first()).toBeVisible();
  const bubble = step.locator('.sv-observe');
  const prose = step.locator('.sv-observe__item:visible .sv-walk__prose');
  const claim = step.locator('.sv-observe__item:visible .sv-observe__claim');

  await expect(bubble).toHaveCSS('cursor', 'pointer');
  await expect(claim).toHaveCSS('cursor', 'pointer');
  const look = () => bubble.evaluate(el => {
    const { backgroundColor, boxShadow } = getComputedStyle(el);
    return { backgroundColor, boxShadow };
  });
  const resting = await look();
  // Hovered again if the row, still settling, moves the bubble from under the mouse.
  await expect(async () => {
    await bubble.hover();
    expect((await look()).boxShadow).not.toBe(resting.boxShadow);
  }).toPass();
  expect((await look()).backgroundColor).toBe(resting.backgroundColor);

  // The chart's scrolling clips at the slide's edges, which must leave the shadow room.
  const clip = await step.locator('.sv-slide').boundingBox();
  const edge = await bubble.boundingBox();
  expect(edge!.x - clip!.x).toBeGreaterThanOrEqual(12);
  expect(clip!.x + clip!.width - (edge!.x + edge!.width)).toBeGreaterThanOrEqual(12);

  // The empty space at the end of the line opens it, and the text it opened closes it.
  const box = await bubble.boundingBox();
  await page.mouse.click(box!.x + box!.width - 4, box!.y + 4);
  await expect(prose).toBeVisible();
  await prose.click();
  await expect(prose).toBeHidden();

  await step.getByRole('button', { name: 'Next observation' }).click();
  await expect(step.locator('.sv-observe__count')).toHaveText(/^2 of/);
  await expect(prose).toBeHidden();
});

test('choosing an observation picks out its part of the graph', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, longRun);
  const step = row.locator('.sv-walk__slide').first();
  const lines = step.locator('svg:visible [data-series]');
  const shownMark = step.locator('.sv-chart__svg:visible [data-mark-shown]');
  const dimmed = (name: string) => step.locator(`svg:visible [data-series="${name}"][data-mark-dimmed]`);

  // Closed, an observation is only a heading: the whole graph stays in view.
  await expect(lines.first()).toBeVisible();
  await expect(step.locator('[data-mark-dimmed], [data-mark-shown]')).toHaveCount(0);

  // Opened, a point: the 2025 value on the immigration line, with the other lines receding.
  const toggle = step.locator('.sv-observe__item:not([hidden]) .sv-observe__toggle');
  await toggle.click();
  // The opened claim is set apart from its reasoning.
  await expect(step.locator('.sv-observe__item:not([hidden]) .sv-observe__claim')).toHaveCSS('font-weight', '600');
  await expect(shownMark.locator('.sv-chart__mark-label')).toHaveText('813,000');
  await expect(dimmed('Net migration')).toHaveCount(1);
  await expect(dimmed('Immigration')).toHaveCount(0);

  // Stepping on from an open observation opens the next, so its mark shows at
  // once: a region, the four years from 2021, with the plot either side veiled.
  await step.getByRole('button', { name: 'Next observation' }).click();
  await expect(step.locator('.sv-observe__item:not([hidden]) .sv-observe__body')).toBeVisible();
  await expect(shownMark.locator('.sv-chart__mark-veil')).toHaveCount(2);
  await expect(dimmed('Emigration')).toHaveCount(1);
  await expect(dimmed('Net migration')).toHaveCount(0);
});

test('an observation on a comparison picks out its rows, and keeps them when the rows change', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, longRun);
  const tab = row.locator('.sv-walk__tab').filter({ hasText: 'Arrivals per head by nationality' }).first();
  await tab.click();
  const step = row.locator('.sv-walk__slide:has(.sv-comparison-controls):has([data-row="Malta"])').first();
  await expect(step.locator('.sv-comparison__rows')).toBeVisible();
  // A far chart is a long slide away, and its controls move until it lands.
  await expect.poll(() => step.evaluate(el => Math.abs(el.getBoundingClientRect().left - el.parentElement!.getBoundingClientRect().left))).toBeLessThan(2);
  await step.locator('.sv-observe__item:not([hidden]) .sv-observe__toggle').click();
  await expect(step.locator('[data-row="Luxembourg"]')).toHaveAttribute('data-mark-picked', '');
  await expect(step.locator('[data-row="Germany"]')).toHaveAttribute('data-mark-dimmed', '');
  await step.locator('.sv-comparison-controls button').first().click();
  await expect(step.locator('[data-row="Luxembourg"]')).toHaveAttribute('data-mark-picked', '');
  await expect(step.locator('[data-row="Germany"]')).toHaveAttribute('data-mark-dimmed', '');
});

test('a chart\'s subtitle line opens its More panel', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-row__toggle').click(headCorner);
  const step = row.locator('.sv-walk__slide').first();
  const about = step.locator('.sv-chart__about').first();
  await expect(about).toBeVisible();
  await expect(about).not.toHaveAttribute('open');
  // The row is still settling as it opens, which can swallow the first click.
  await expect(async () => {
    await about.locator('> summary').click();
    await expect(about).toHaveAttribute('open', '', { timeout: 500 });
  }).toPass();
});

test('the arrows move the chart strip and leave the selected chart alone', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-row__toggle').click(headCorner);
  const selected = row.locator('.sv-walk__tab[aria-current]');
  const before = await selected.innerText();
  await row.getByRole('button', { name: 'Show later charts' }).click();
  await expect.poll(() => row.locator('.sv-walk__tabs').evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await expect(selected).toHaveText(before);
});

// A closed row's thumbnails are a way in: each opens the row at its own step.
test('a thumbnail opens a data row at that chart', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-walk__thumb').nth(2).click();
  await expect(row).toHaveAttribute('data-open', 'true');
  await expect(row.locator('.sv-walk__tab').nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(row.locator('.sv-walk__slide').nth(2)).toBeInViewport({ ratio: 0.5 });
});

test('the "more" tile opens a data row at the first chart it stands for', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-walk__thumb', { hasText: 'more' }).click();
  await expect(row.locator('.sv-walk__tab').nth(6)).toHaveAttribute('aria-current', 'step');
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

test.describe('a slideshow viewpoint on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('each card makes its point, completes it in a line that opens the evidence, and shows the graph that line cites', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    await page.locator(`${SLIDES_VIEWPOINT} .sv-row__toggle`).click(headCorner);
    const deck = page.locator(`${SLIDES_VIEWPOINT} .sv-deck`);
    await expect(deck.locator('.sv-deck__outline')).toBeHidden();
    const card = deck.locator('.sv-deck__card').first();
    await expect(card.locator('.sv-deck__heading')).toHaveText('Most people crossing the Channel are found to need protection');
    await expect(card.locator('.sv-deck__reasoning')).toContainText('most would face danger if sent back');
    // One graph a card: a phone has room for no more.
    await expect(card.locator('.sv-chart')).toHaveCount(1);
    await expect(card.locator('.sv-chart__caption')).toContainText('Initial decisions on small-boat arrivals');
    const evidence = card.locator('.sv-deck__pop');
    await expect(evidence).toBeHidden();
    await card.locator('.sv-deck__more').click();
    await expect(evidence).toContainText('Eritreans and Sudanese are the largest groups now crossing');

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
    const title = await row.locator('.sv-row__title').boundingBox();
    const chevron = await row.locator('.sv-row__chevron').boundingBox();
    expect(Math.abs(chevron!.y + chevron!.height / 2 - (title!.y + 14))).toBeLessThan(16);
    await row.locator('.sv-row__toggle').click(headCorner);
    await expect(row).toHaveAttribute('data-open', 'true');
    await expect.poll(async () => (await row.boundingBox())!.width).toBe(390);
  });

  test('open, a data report or a crux also runs to the screen\'s edges', async ({ page }) => {
    await page.goto(`${SLIDES_TOPIC}#data`);
    for (const row of [page.locator('.sv-row--data').first(), page.locator('.sv-row--crux').first()]) {
      await row.locator('.sv-row__toggle').click(headCorner);
      await expect(row).toHaveAttribute('data-open', 'true');
      await expect.poll(async () => (await row.boundingBox())!.width).toBe(390);
    }
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

  test('a cited claim opens its finding in a pop-up, which leads on to the data', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    await page.locator(`${SLIDES_VIEWPOINT} .sv-row__toggle`).click(headCorner);
    const claim = page.locator(`${SLIDES_VIEWPOINT} .sv-deck__card`).first().locator('.sv-deck__reasoning a.sv-cite').first();
    await claim.click();
    const popup = page.getByRole('dialog', { name: 'Most decided small-boat claims were granted' });
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('79,589');
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(claim).toBeFocused();

    await claim.click();
    await popup.getByRole('link', { name: 'See the data' }).click();
    await expect(popup).toHaveCount(0);
    await expectChartAlone(page.locator('dialog[open]'));
  });

  test('a card\'s point about a trend is drawn as a line over every year', async ({ page }) => {
    await page.goto(SLIDES_TOPIC);
    const row = page.locator('#viewpoint-bar-and-remove');
    await row.locator('.sv-row__toggle').click(headCorner);
    await row.getByRole('button', { name: /^Point 2:/ }).click();
    const card = row.locator('.sv-deck__card').nth(1);
    await expect(card.locator('.sv-deck__heading')).toHaveText('People who claim asylum can expect to stay, even if they are refused');
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
  // One card per step of the argument, the last its conclusion.
  await expect(outline.locator('li')).toHaveCount(6);
  await expect(outline.locator('li').last()).toContainText('So Britain should open safe routes, decide claims fairly, and let people work');
  const deterrence = outline.getByRole('button', { name: /deterrence scheme failed/ });
  await deterrence.click();
  await expect(deterrence).toHaveAttribute('aria-current', 'step');
  // Its line cites a table, which reads as more text, so the card gives its evidence in full.
  const card = page.locator(`${SLIDES_VIEWPOINT} .sv-deck__card`).nth(3);
  await expect(card).toBeInViewport();
  await expect(card.locator('.sv-chart')).toHaveCount(0);
  await expect(card.locator('.sv-deck__reasoning')).toContainText('£715 million');
  await expect(card.locator('.sv-deck__prose')).toContainText("Australia's offshore camps cost billions");
});

test('a closed slideshow viewpoint previews its graphs, and a graph opens the row at its card', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(SLIDES_TOPIC);
  const row = page.locator(SLIDES_VIEWPOINT);
  // A graph on each of its first three cards; the rest are cards of text.
  const thumbs = row.locator('.sv-walk__thumb');
  await expect(thumbs).toHaveCount(3);
  await expect(thumbs.nth(2)).toContainText('3. Where a safe route existed, people could come without a boat');
  await thumbs.nth(2).click();
  await expect(row.locator('.sv-deck__outline-item[aria-current]')).toContainText('Where a safe route existed, people could come without a boat');
  await expect(row.locator('.sv-deck__card').nth(2)).toBeInViewport();
});

test('a slideshow card can be made with a map of where the boats leave from', async ({ page }) => {
  await page.goto(SLIDES_TOPIC);
  const row = page.locator('#viewpoint-bar-and-remove');
  await row.locator('.sv-row__toggle').click(headCorner);
  const card = row.locator('.sv-deck__card').first();
  await expect(card.locator('.sv-deck__heading')).toHaveText('People crossing the Channel have already passed through other countries, where British law expects them to claim asylum');
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
  await row.locator('.sv-deck__outline-item').nth(3).click();
  const card = row.locator('.sv-deck__card').nth(3);
  await expect(card.locator('.sv-deck__heading')).toHaveText('Human-rights claims stop removals, the Home Office says');
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
});

// us-vote-by-mail quotes in two reports: the Supreme Court in Watson v. RNC, and
// research on whether rule changes move trust in results.
test('a data panel lists every quote on its topic, which a reader can narrow to one question', async ({ page }) => {
  await page.goto('/topics/us-vote-by-mail#data');
  const row = page.locator('#fact-ballot-deadlines-and-counting-speed');
  await row.locator('.sv-row__toggle').click(headCorner);
  const quotes = row.locator('.sv-quote-browser');
  await expect(quotes.locator('.sv-graph-heading')).toHaveText('Every quote on this topic');
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 5 of 5 quotes');
  // Each question is a line of the Question dropdown.
  await quotes.getByRole('button', { name: 'Question: All' }).click();
  await quotes.locator('.sv-bar__pop:popover-open').getByRole('button', { name: /Watson v\. RNC/ }).click();
  await expect(quotes.locator('.sv-control__status')).toHaveText('Showing 3 of 5 quotes');
});
