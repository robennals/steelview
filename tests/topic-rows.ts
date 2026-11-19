import { expect, type Locator, type Page } from '@playwright/test';

// A topic page's viewpoints and data collections are accordion rows. A
// viewpoint step's "Explore this data", and each claim in its prose, opens
// the chart it cites in a pop-up.

/** Where to click a row's toggle: its corner, as the centre of a walkthrough row's head is a thumbnail. */
export const headCorner = { position: { x: 8, y: 8 } };

/**
 * A chart sheet shows the one chart it was opened at, larger, under the
 * chart's title: no second title over the chart, no miniatures of the
 * collection's other charts, and no observations to step through.
 */
export async function expectChartAlone(sheet: Locator): Promise<void> {
  await expect(sheet.locator('.sv-walk[data-alone] .sv-chart, .sv-walk[data-alone] .sv-report').first()).toBeVisible();
  await expect(sheet.locator('.sv-walk__step')).toHaveCount(1);
  await expect(sheet.locator('.sv-modal__title')).not.toBeEmpty();
  await expect(sheet.locator('.sv-graph-heading:visible')).toHaveCount(0);
  await expect(sheet.locator('.sv-walk__tab')).toHaveCount(0);
  await expect(sheet.locator('.sv-observe')).toHaveCount(0);
}

/** Bring up one of a topic page's tabs. Without JavaScript there are none: every panel is already showing. */
export async function openTab(page: Page, name: 'Viewpoints' | 'Data'): Promise<void> {
  const tab = page.locator('.sv-topic-tabs').getByRole('link', { name });
  if (await tab.isVisible()) await tab.click();
}

/** The row of the viewpoint `id`, opened. */
export async function openViewpoint(page: Page, id: string): Promise<Locator> {
  const row = page.locator(`#viewpoint-${id}`);
  await row.locator('.sv-row__toggle').click(headCorner);
  return row;
}

/** The row of the data collection titled `title`, opened. */
export async function openDataRow(page: Page, title: string): Promise<Locator> {
  await openTab(page, 'Data');
  const row = page.locator('.sv-row--data').filter({ hasText: title });
  await row.locator('.sv-row__toggle').click(headCorner);
  return row;
}

const TOPIC = '/topics/uk-immigration';

/** A report's own address. */
export const factUrl = (id: string) => `${TOPIC}/facts/${id}`;

/** A report's own page, at one of its charts, and that chart. */
export async function openChart(page: Page, factId: string, chart: string): Promise<Locator> {
  await page.goto(`${factUrl(factId)}#${factId}--chart-${chart}`);
  return page.locator(`#${factId}--chart-${chart}`);
}
