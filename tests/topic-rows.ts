import type { Locator, Page } from '@playwright/test';

// A topic page's viewpoints and data collections are accordion rows. A
// viewpoint step's "Explore this data" opens that collection's own panel in a
// pop-up.

/** Where to click a row's toggle: its corner, as the centre of a walkthrough row's head is a thumbnail. */
export const headCorner = { position: { x: 8, y: 8 } };

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
