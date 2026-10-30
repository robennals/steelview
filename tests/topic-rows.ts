import type { Locator, Page } from '@playwright/test';

// A topic page's viewpoints and data collections are accordion rows. Opening
// one steps through its sections, and each chart's "Explore this data" link
// opens the collection over the page, showing that chart.

/** The row of the viewpoint `id`, opened. */
export async function openViewpoint(page: Page, id: string): Promise<Locator> {
  const row = page.locator(`#viewpoint-${id}`);
  await row.locator('.sv-row__toggle').click();
  return row;
}

/** The row of the data collection titled `title`, opened. */
export async function openDataRow(page: Page, title: string): Promise<Locator> {
  const row = page.locator('.sv-row--data').filter({ hasText: title });
  await row.locator('.sv-row__toggle').click();
  return row;
}

/** A row's first "Explore this data" link. */
export const exploreLink = (row: Locator) => row.locator('.sv-walk__explore a').first();

/** Open the collection titled `title` over the page, at its first chart. */
export async function openCollection(page: Page, title: string): Promise<Locator> {
  const row = await openDataRow(page, title);
  await exploreLink(row).click();
  return exploreLink(row);
}
