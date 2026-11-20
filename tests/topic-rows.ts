import { expect, type Locator, type Page } from '@playwright/test';

// A topic page's viewpoints and cruxes are accordion rows. A viewpoint card's
// chart opens in full in a pop-up, and each claim in its prose opens the
// finding it cites.

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

/** The row of the viewpoint `id`, opened. */
export async function openViewpoint(page: Page, id: string): Promise<Locator> {
  const row = page.locator(`#viewpoint-${id}`);
  await row.locator('.sv-row__toggle').click(headCorner);
  return row;
}

const TOPIC = '/topics/uk-immigration';

/**
 * A chart a viewpoint's card is made with, opened in full over its topic page
 * by its address, and that chart. Only those charts are on the page.
 */
export async function openChart(page: Page, factId: string, chart: string, topic = TOPIC): Promise<Locator> {
  await page.goto(`${topic}#${factId}--chart-${chart}`);
  return page.locator(`dialog.sv-modal [id="${factId}--chart-${chart}"]`);
}
