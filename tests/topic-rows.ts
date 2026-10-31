import type { Locator, Page } from '@playwright/test';

// A topic page's viewpoints and data collections are accordion rows. A
// viewpoint step's "Explore this data" opens that collection's own panel in a
// pop-up; a citation elsewhere, as in a crux, opens its report over the page.

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

/** Open the crux citing the collection `factId`, and return that citation. */
export async function cruxCitation(page: Page, factId: string): Promise<Locator> {
  await page.locator(`.sv-crux:has(a[data-fact-id="${factId}"]) > summary`).first().click();
  return page.locator(`.sv-crux a[data-fact-id="${factId}"]`).first();
}

/**
 * A citation of one chart of a collection, added to the page. Not every
 * collection is cited from a crux, and this is the markup every citation has,
 * so it exercises what a reader's click does.
 */
export async function citationTo(page: Page, factId: string, chart = 'series'): Promise<Locator> {
  await page.evaluate(([id, href]) => {
    if (document.getElementById(`citation-${id}`)) return;
    const link = document.createElement('a');
    link.id = `citation-${id}`;
    link.className = 'sv-cite';
    link.dataset.factId = id;
    link.href = href;
    link.textContent = id;
    document.querySelector('main')?.prepend(link);
  }, [factId, `${TOPIC}/facts/${factId}#${factId}--viz-${chart}`]);
  return page.locator(`#citation-${factId}`);
}

/** Open a collection's report over the page, at its first chart, through a citation of it. */
export async function openCollection(page: Page, factId: string): Promise<Locator> {
  const citation = await citationTo(page, factId);
  await citation.click();
  return citation;
}
