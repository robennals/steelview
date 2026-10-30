import { test, expect, type Page, type Request } from '@playwright/test';
import { citationTo, cruxCitation, openCollection } from './topic-rows';

// These assertions depend on authored uk-immigration content: the report
// `immigration-against-the-long-run`, the related reports it holds, and the
// crux citing `work-and-study-routes`.

const TOPIC = '/topics/uk-immigration';
const HEADLINE = 'immigration-against-the-long-run';
const CARE = 'work-and-study-routes';

const factUrl = (id: string) => `${TOPIC}/facts/${id}`;
const firstChart = `${HEADLINE}--viz-series`;
const dialog = 'dialog.sv-modal';
const title = '#sv-modal-title';

test('a citation opens the report in the panel', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(page.locator(dialog)).toHaveCount(0);

  await openCollection(page, HEADLINE);

  await expect(page.locator(dialog)).toBeVisible();
  // The article includes its chart and evidence.
  await expect(page.locator(`${dialog} ${title}`)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-chart`).first()).toBeVisible();
});

// The whole head of a row toggles it, not just its title: a click at the
// bottom edge, away from any text, must open it.
test('the whole row head opens the row, not just the title', async ({ page }) => {
  await page.goto(`${TOPIC}#data`);
  const row = page.locator('.sv-row--data').first();
  await row.scrollIntoViewIfNeeded();
  const box = await row.locator('.sv-row__head').boundingBox();
  if (!box) throw new Error('row head has no layout box');

  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 2);

  await expect(row.locator('.sv-row__toggle')).toHaveAttribute('aria-expanded', 'true');
});

test('a citation in a crux opens the same panel', async ({ page }) => {
  await page.goto(TOPIC);
  await (await cruxCitation(page, CARE)).click();

  await expect(page).toHaveURL(new RegExp(`${factUrl(CARE)}#${CARE}--`));
  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(`${dialog} ${title}`)).toContainText(
    'Work and Study Visas and the Care Workforce'
  );
});

test('the panel is labelled by the fact it is showing', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  const claim = await page.locator(`${dialog} ${title}`).textContent();
  await expect(page.getByRole('dialog', { name: claim ?? '' })).toBeVisible();
});

test('Escape closes the panel and returns to the topic', async ({ page }) => {
  await page.goto(TOPIC);
  const explore = await openCollection(page, HEADLINE);
  await expect(page.locator(dialog)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  // Focus returns to the link that opened it.
  await expect(explore).toBeFocused();
});

test('clicking the backdrop closes the panel', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await expect(page.locator(dialog)).toBeVisible();

  // The panel does not fill the dialog at desktop width; the corner is backdrop.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator(dialog).click({ position: { x: 4, y: 4 } });
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});

test('the close button closes the panel', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await page.locator('.sv-modal__close').click();
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});

// The panel is a place in the reader's history, not a mode they get stuck in:
// Back closes it rather than leaving the page.
test('opening the panel puts the fact URL in the address bar, and Back closes it', async ({
  page,
}) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await expect(page).toHaveURL(new RegExp(`${factUrl(HEADLINE)}#${firstChart}$`));

  await page.goBack();
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
});

// Closing by any other route takes the fact back out of the URL, so a reader
// who closes the panel and reloads does not get it opened again.
test('closing the panel takes the fact off the URL', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});

test('a related fact inside the panel still expands and collapses', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await page.getByRole('button', { name: 'Whole report', exact: true }).click();
  const child = page.locator(`${dialog} details.sv-subfact`).first();
  const quote = child.locator('.sv-finding');
  await expect(quote).toBeHidden();
  await child.locator(':scope > summary').click();
  await expect(quote).toBeVisible();
});

test('focus moves into the panel and Tab stays inside it', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await expect(page.locator('.sv-modal__close')).toBeFocused();

  // Tab around the whole panel and check focus never lands outside it.
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      document.querySelector('dialog.sv-modal')?.contains(document.activeElement)
    );
    expect(inside).toBe(true);
  }
});

// The page behind must not scroll while the panel is open: on a phone that
// means the panel and the page moving at once.
test('the page behind the panel is scroll-locked', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await expect(page.locator('html')).toHaveClass(/sv-modal-open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).not.toHaveClass(/sv-modal-open/);
});

// Everything above is presentation layered on markup that works on its own.
// With JavaScript off there is no panel and nothing is intercepted: a fact row
// and a viewpoint's fact chip are ordinary links, and following either one
// loads that fact's page — the whole fact, at its own address.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a citation is an ordinary link to the fact page', async ({ page }) => {
    await page.goto(TOPIC);
    const link = await cruxCitation(page, CARE);
    await expect(link).toHaveAttribute('href', new RegExp(`^${factUrl(CARE)}#${CARE}--`));

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${factUrl(CARE)}#${CARE}--`));
    await expect(page.locator(dialog)).toHaveCount(0);
    // The whole fact is there: claim, context, chart, sources.
    await expect(page.locator('h1.sv-factpage__claim')).toContainText(
      'Work and Study Visas and the Care Workforce'
    );
    await expect(page.locator('.sv-chart').first()).toBeVisible();
    await expect(page.locator('.sv-references blockquote').first()).toBeHidden();
    await page.locator('.sv-references > summary').click();
    await page.locator('.sv-source-quote > summary').first().click();
    await expect(page.locator('.sv-references blockquote').first()).toBeVisible();
  });
});

// A citation is prefetched when the reader points at it, not when it comes
// into view: a topic page cites hundreds of sections of a few collections.
const factData = (request: Request) =>
  request.headers()['rsc'] === '1' && new URL(request.url()).pathname.includes('/facts/');

test('a fact is prefetched only once the reader points at its link', async ({ page }) => {
  const requested = new Set<string>();
  page.on('request', (request) => {
    if (factData(request)) requested.add(new URL(request.url()).pathname);
  });
  await page.goto(TOPIC, { waitUntil: 'networkidle' });
  const citation = await citationTo(page, HEADLINE);
  await page.waitForLoadState('networkidle');
  expect([...requested]).toEqual([]);

  await citation.hover();
  await expect.poll(() => [...requested]).toEqual([factUrl(HEADLINE)]);
});

// Once prefetched, opening and reopening a fact needs no network response.
test('facts open with the network offline and Forward restores the modal', async ({ page, context }) => {
  await page.goto(TOPIC, { waitUntil: 'networkidle' });
  const citation = await citationTo(page, HEADLINE);
  const explore = citation;
  const prefetched = page.waitForResponse((response) =>
    response.request().headers()['next-router-segment-prefetch']?.endsWith('__PAGE__') ?? false);
  await explore.hover();
  await (await prefetched).finished();
  await context.setOffline(true);
  await explore.click();
  await expect(page.locator(`${dialog} ${title}`)).toHaveText('UK Migration and Population Over the Long Run');
  await expect(page.locator(`${dialog} .sv-chart`).first()).toBeVisible();
  await page.goBack();
  await expect(page.locator(dialog)).toHaveCount(0);
  await page.goForward();
  await expect(page.locator(`${dialog} ${title}`)).toHaveText('UK Migration and Population Over the Long Run');
  await page.locator('.sv-modal__close').click();
  await expect(page.locator(dialog)).toHaveCount(0);
  // Forward reopened the sheet with no link clicked, so focus returns to the
  // first link to the fact that can take it.
  await expect(page.locator(`a[href^="${factUrl(HEADLINE)}"]:focus`)).toHaveCount(1);
});

test('Expand loads the standalone fact page', async ({ page }) => {
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  const expand = page.getByRole('link', { name: 'Expand', exact: true });
  await expect(expand).toHaveAttribute('href', /#/);
  await expand.click();
  await expect(page).toHaveURL(new RegExp(`${factUrl(HEADLINE)}#${firstChart}$`));
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
});


// The sheet opens on the click, not when the fact arrives: a fact that was not
// prefetched waits on the server, and the sheet must not wait with it.
const holdFactData = async (page: Page) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route((url) => url.pathname.includes('/facts/'), async (route) => {
    if (route.request().headers()['rsc'] === '1') await gate;
    await route.continue();
  });
  return () => release();
};

test('a slow fact response never delays opening the sheet', async ({ page }) => {
  const release = await holdFactData(page);
  try {
    await page.goto(TOPIC);
    await openCollection(page, HEADLINE);
    // A citation names no fact, so the sheet opens untitled until the fact arrives.
    await expect(page.getByRole('dialog', { name: 'Loading data' })).toBeVisible();
    // A loading message only once the wait is noticeable, never as a flash.
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('Loading data…', { timeout: 4000 });
    // Closing while it loads, then choosing another fact, gets the other fact.
    await page.locator('.sv-modal__close').click();
    const second = await citationTo(page, CARE);
    await second.click();
    await expect(page.getByRole('dialog', { name: 'Loading data' })).toBeVisible();
    release();
    await expect(page.locator(`${dialog} .sv-factpage__body`)).toBeVisible();
    await expect(page.locator(`${dialog} ${title}`)).toHaveText('Work and Study Visas and the Care Workforce');
    await expect(page).toHaveURL(new RegExp(`${await second.getAttribute('href')}$`));
  } finally {
    release();
  }
});

test('closing a sheet before its fact arrives keeps it closed', async ({ page }) => {
  const release = await holdFactData(page);
  try {
    await page.goto(TOPIC);
    const explore = await openCollection(page, HEADLINE);
    await expect(page.locator(`${dialog} [aria-busy="true"]`)).toBeVisible();
    await page.locator('.sv-modal__close').click();
    await expect(page.locator(dialog)).toHaveCount(0);
    await expect(explore).toBeFocused();
    release();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(dialog)).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  } finally {
    release();
  }
});

test('modified fact clicks are left to the browser', async ({ page }) => {
  await page.goto(TOPIC, { waitUntil: 'networkidle' });
  // Observe the event after application handlers, then suppress the browser's
  // platform-specific new-tab/context-menu default inside this test only.
  for (const modifier of ['ctrlKey', 'metaKey'] as const) {
    const prevented = await (await citationTo(page, HEADLINE)).evaluate((link, key) => {
      let intercepted = false;
      document.addEventListener('click', (event) => {
        intercepted = event.defaultPrevented;
        event.preventDefault();
      }, { once: true });
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, [key]: true }));
      return intercepted;
    }, modifier);
    expect(prevented).toBe(false);
  }
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});


test('a preview using the loopback IP loads its JavaScript and opens facts in place', async ({ page }) => {
  // Embedded/local previews can send this origin while accessing the dev server
  // by its localhost name. Next's dev-origin guard must allow their scripts.
  await page.setExtraHTTPHeaders({ Origin: 'http://127.0.0.1' });
  const blockedScripts: string[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/_next/') && response.status() === 403) {
      blockedScripts.push(response.url());
    }
  });
  await page.goto(TOPIC);
  await openCollection(page, HEADLINE);
  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-factpage__body`)).toBeVisible();
  expect(blockedScripts).toEqual([]);
});
