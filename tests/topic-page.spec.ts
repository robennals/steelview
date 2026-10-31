import { test, expect } from './hydrated-test';
import { headCorner, openDataRow, openViewpoint } from './topic-rows';

// These assertions depend on authored uk-immigration content: the topic
// title "UK immigration", the report `immigration-against-the-long-run`, and
// the viewpoint `open-and-build` with the link text it uses for
// `work-and-study-routes`. Editing any of that content's wording or
// cross-references will turn this suite red.

const TOPIC = '/topics/uk-immigration';
const longRun = 'UK Migration and Population Over the Long Run';

test('the topic page shows all four sections', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  for (const section of ['Data', 'Viewpoints', 'Principles', 'Cruxes']) {
    await expect(page.getByRole('heading', { name: section, level: 2 })).toBeVisible();
  }
});

// A closed row is a title and an overview: its charts load only when it opens.
test('a data collection loads its charts only when its row opens', async ({ page }) => {
  await page.goto(TOPIC);
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
  await expect(sheet.locator('.sv-modal__title')).toContainText('Work and Study Visas and the Care Workforce');
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
  await page.goto(TOPIC);
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

test('a short bar chart keeps its bars together, with its scale under them, in a tall panel', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, 'Immigration, the Economy and the Public Finances');
  await row.locator('.sv-walk__tab', { hasText: 'Who pays UK universities' }).click();
  const chart = row.locator('.sv-comparison').filter({ hasText: 'Who pays UK universities' });
  const bars = chart.locator('.sv-comparison__rows > li');
  await expect(bars).toHaveCount(2);
  const first = await bars.first().boundingBox();
  const second = await bars.last().boundingBox();
  const scale = await chart.locator('.sv-comparison__scale').boundingBox();
  expect(second!.y - first!.y).toBeLessThan(60);
  expect(scale!.y - (second!.y + second!.height)).toBeLessThan(40);
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
  await bubble.hover();
  await expect.poll(async () => (await look()).boxShadow).not.toBe(resting.boxShadow);
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

  // A point: the 2025 value on the immigration line, with the other lines receding.
  await expect(lines.first()).toBeVisible();
  await expect(shownMark.locator('.sv-chart__mark-label')).toHaveText('813,000');
  await expect(dimmed('Net migration')).toHaveCount(1);
  await expect(dimmed('Immigration')).toHaveCount(0);

  // A region: the four years from 2021, with the plot either side of them veiled.
  await step.getByRole('button', { name: 'Next observation' }).click();
  await expect(shownMark.locator('.sv-chart__mark-veil')).toHaveCount(2);
  await expect(dimmed('Emigration')).toHaveCount(1);
  await expect(dimmed('Net migration')).toHaveCount(0);
});

test('an observation on a comparison picks out its rows, and keeps them when the rows change', async ({ page }) => {
  await page.goto(TOPIC);
  const row = await openDataRow(page, longRun);
  const tab = row.locator('.sv-walk__tab').filter({ hasText: 'Arrivals per head by nationality' }).first();
  await tab.click();
  const step = row.locator('.sv-walk__slide:has(.sv-comparison-controls)').first();
  await expect(step.locator('.sv-comparison__rows')).toBeVisible();
  await expect(step.locator('[data-row="Luxembourg"]')).toHaveAttribute('data-mark-picked', '');
  await expect(step.locator('[data-row="Germany"]')).toHaveAttribute('data-mark-dimmed', '');
  await step.locator('.sv-comparison-controls button').first().click();
  await expect(step.locator('[data-row="Luxembourg"]')).toHaveAttribute('data-mark-picked', '');
  await expect(step.locator('[data-row="Germany"]')).toHaveAttribute('data-mark-dimmed', '');
});

test('a chart\'s description is one line until opened, and method notes are inside it', async ({ page }) => {
  await page.goto(TOPIC);
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
  await page.goto(TOPIC);
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
  await page.goto(TOPIC);
  const row = page.locator('.sv-row--data').first();
  await row.locator('.sv-walk__thumb').nth(2).click();
  await expect(row).toHaveAttribute('data-open', 'true');
  await expect(row.locator('.sv-walk__tab').nth(2)).toHaveAttribute('aria-current', 'step');
  await expect(row.locator('.sv-walk__slide').nth(2)).toBeInViewport({ ratio: 0.5 });
});

test('the "more" tile opens a data row at the first chart it stands for', async ({ page }) => {
  await page.goto(TOPIC);
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
