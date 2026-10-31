import type { Locator, Page } from '@playwright/test';

// A topic page's viewpoints and data collections are accordion rows. A
// viewpoint step's "Explore this data" opens that collection's own panel in a
// pop-up; any other citation opens its report over the page.

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

/** A link to `href`, as a citation of the collection `factId`, added to the page where it can be clicked. */
async function placeCitation(page: Page, factId: string, href: string): Promise<Locator> {
  await page.evaluate(([id, target]) => {
    if (document.getElementById(`citation-${id}`)) return;
    const link = document.createElement('a');
    link.id = `citation-${id}`;
    link.className = 'sv-cite';
    link.dataset.factId = id;
    link.href = target;
    link.textContent = id;
    document.querySelector('main')?.prepend(link);
  }, [factId, href]);
  return page.locator(`#citation-${factId}`);
}

/**
 * A citation of one chart of a collection, added to the page. Not every
 * collection is cited on a part of the page that shows at first, and this is
 * the markup every citation has, so it exercises what a reader's click does.
 */
export async function citationTo(page: Page, factId: string, chart = 'series'): Promise<Locator> {
  return placeCitation(page, factId, `${TOPIC}/facts/${factId}#${factId}--viz-${chart}`);
}

/** A citation of the section of `factId` a viewpoint links to, reachable without stepping through that viewpoint. */
export async function viewpointCitation(page: Page, factId: string): Promise<Locator> {
  const href = await page.locator(`.sv-row--viewpoint a[href*="/facts/${factId}#"]`).first().getAttribute('href');
  return placeCitation(page, factId, href!);
}

/** Open a collection's report over the page, at its first chart, through a citation of it. */
export async function openCollection(page: Page, factId: string): Promise<Locator> {
  const citation = await citationTo(page, factId);
  await citation.click();
  return citation;
}
