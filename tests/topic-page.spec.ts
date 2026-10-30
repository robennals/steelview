import { test, expect, type Page } from '@playwright/test';
import { cruxCitation, headCorner, openTab, openViewpoint } from './topic-rows';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the report `immigration-against-the-long-run`, and
// the viewpoint `open-and-build` with the link text it uses for
// `work-and-study-routes`. Editing any of that content's wording or
// cross-references will turn this suite red.

const TOPIC = '/topics/uk-immigration';
const DATA = `${TOPIC}#data`;

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
  await expect(page.locator('.sv-crux').first()).toBeVisible();
  await openTab(page, 'Data');
  await expect(heading).toBeVisible();
  await expect(page.locator('.sv-crux').first()).toBeVisible();
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

test('a link to a viewpoint from a crux brings up the viewpoint', async ({ page }) => {
  await page.goto(DATA);
  const crux = page.locator('.sv-crux').first();
  await crux.locator('> summary').click();
  await crux.locator('.sv-position a').first().click();
  await expect(page.locator('.sv-row--viewpoint[data-open]')).toBeInViewport();
});

// The row open above it closes as this one opens, which moves everything up.
test('a crux\'s viewpoint stays in view as the open row above it closes', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator('.sv-row--viewpoint').first().locator('.sv-row__toggle').click(headCorner);
  await openTab(page, 'Data');
  const crux = page.locator('.sv-crux').first();
  await crux.locator('> summary').click();
  const first = await page.locator('.sv-row--viewpoint').first().getAttribute('id');
  const link = crux.locator(`.sv-position a:not([href="#${first}"])`).first();
  const row = page.locator((await link.getAttribute('href')) ?? '');
  await link.click();
  await expect(row).toHaveAttribute('data-open', 'true');
  await page.waitForTimeout(800);
  await expect(row.locator('.sv-row__title')).toBeInViewport();
  expect(await row.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(200);
});

test('a link to a crux loaded cold brings up the crux, opened', async ({ page }) => {
  await page.goto(TOPIC);
  const id = await page.locator('.sv-crux').first().getAttribute('id');
  await page.goto(`${TOPIC}#${id}`);
  const crux = page.locator(`[id="${id}"]`);
  await expect(crux).toHaveAttribute('open', '');
  await expect(crux).toBeInViewport();
});

// The sheet's data panel sits on the Data tab, closed or not.
test('a viewpoint opens a data panel without leaving its tab', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'open-and-build');
  await viewpoint.locator('.sv-walk__slide').first().getByRole('link', { name: 'Explore this data' }).click();
  await expect(page.locator('dialog[open] .sv-walk__tab').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(viewpoint).toBeVisible();
});

test('closing a fact opened from a crux keeps the tab that was showing', async ({ page }) => {
  await page.goto(DATA);
  const citation = await cruxCitation(page, 'work-and-study-routes');
  await citation.click();
  await expect(page.locator('dialog.sv-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${DATA}$`));
  await expect(citation).toBeFocused();
  await expect(page.locator('.sv-row--data').first()).toBeVisible();
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
    await expect(page.locator('.sv-crux').first()).toBeVisible();
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
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'open-and-build');
  await viewpoint.locator('.sv-walk__outline-step').nth(1).click();
  const explore = viewpoint.locator('.sv-walk__slide').nth(1).getByRole('link', { name: 'Explore this data' });
  await explore.click();

  const sheet = page.locator('dialog[open]');
  await expect(sheet.getByRole('heading', { level: 2 })).toContainText('Work and Study Visas and the Care Workforce');
  await expect(sheet.locator('.sv-walk__tab[aria-current]')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${TOPIC}#work-and-study-routes--`));

  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  await expect(viewpoint).toHaveAttribute('data-open', 'true');
  await expect(explore).toBeFocused();
});

test('clicking a viewpoint step\'s chart opens the panel too, title included', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = await openViewpoint(page, 'open-and-build');
  const heading = viewpoint.locator('.sv-walk__slide').first().locator('.sv-graph-heading');
  await expect(heading.locator('a')).toHaveCount(0);
  await heading.click();
  await expect(page.locator('dialog[open] .sv-walk__tab').first()).toBeVisible();
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

test('a chart\'s description is one line until opened, and method notes are inside it', async ({ page }) => {
  await page.goto(DATA);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-row__toggle').click(headCorner);
  const step = row.locator('.sv-walk__slide').first();
  const about = step.locator('.sv-chart__about').first();
  await expect(about).toBeVisible();
  await expect(step.locator('.sv-method-changes-group').first()).toBeHidden();
  await step.getByRole('link', { name: 'See method changes' }).click();
  await expect(step.locator('.sv-method-changes-group').first()).toBeVisible();
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

test('a thumbnail opens a viewpoint at that step', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  await row.locator('.sv-walk__thumb').nth(3).click();
  await expect(row.locator('.sv-walk__outline-step').nth(3)).toHaveAttribute('aria-current', 'step');
  await expect(row.locator('.sv-walk__slide').nth(3)).toBeInViewport({ ratio: 0.5 });
});

test('a thumbnail still moves the row after it was closed on another step', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  const thumb = row.locator('.sv-walk__thumb').nth(3);
  await thumb.click();
  await row.locator('.sv-walk__outline-step').first().click();
  await row.locator('.sv-row__toggle').click(headCorner);
  await thumb.click();
  await expect(row.locator('.sv-walk__outline-step').nth(3)).toHaveAttribute('aria-current', 'step');
});

test('a keyboard reader keeps their place when a thumbnail opens the row', async ({ page }) => {
  await page.goto(TOPIC);
  const row = page.locator('#viewpoint-open-and-build');
  const thumb = row.locator('.sv-walk__thumb').nth(1);
  await thumb.focus();
  await page.keyboard.press('Enter');
  await expect(row.locator('.sv-row__toggle')).toBeFocused();
});
