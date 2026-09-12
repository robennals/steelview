import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the headline
// fact `immigration-against-the-long-run` (first in the derived ranking, so it
// renders outside the Facts collapse), the supporting fact
// `immigration-shifted-from-eu-to-non-eu` it holds, and the viewpoint
// `a-country-should-decide-who-joins-it`, which lists the fact
// `health-and-care-relies-on-migrant-workers` (claim "Health and care is the
// sector most dependent on migrant labour").

const TOPIC = '/topics/uk-immigration';
const HEADLINE = 'immigration-against-the-long-run';
const SUPPORTING = 'care-worker-route-fiscally-negative';
const FISCAL = 'skilled-worker-fiscal-gain-concentrated';
const CARE = 'health-and-care-relies-on-migrant-workers';

const factUrl = (id: string) => `${TOPIC}/facts/${id}`;
const row = (id: string) => `a.sv-factrow[href="${factUrl(id)}"]`;
const dialog = 'dialog.sv-modal';
const title = '#sv-modal-title';

test('clicking a fact in the list opens it in the panel', async ({ page }) => {
  await page.goto(TOPIC);
  await expect(page.locator(dialog)).toHaveCount(0);

  await page.locator(row(HEADLINE)).click();

  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-modal__eyebrow`)).toHaveText('Data');
  // The prefetched article includes its chart and evidence.
  await expect(page.locator(`${dialog} ${title}`)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-chart`).first()).toBeVisible();
  await expect(page.locator(`${dialog} .sv-supporting details.sv-subfact`)).toHaveCount(0);
});

// Regression pin: the row's link used to end where the claim text did, so
// only the top slice of the row actually opened anything — the rest looked
// like part of a clickable row but silently did nothing. The whole row is
// now the link, so a click anywhere in it, including its bottom edge where
// no text sits, must open the fact.
test('the whole fact row is clickable, not just the claim text', async ({ page }) => {
  await page.goto(TOPIC);
  const link = page.locator(row(HEADLINE));
  const box = await link.boundingBox();
  if (!box) throw new Error('fact row has no layout box');

  // A point just inside the row's bottom edge, away from the claim text and
  // the status badge, which both sit nearer the top.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 2);

  await expect(page).toHaveURL(new RegExp(`${factUrl(HEADLINE)}$`));
  await expect(page.locator(dialog)).toBeVisible();
});

test('a fact chip in a viewpoint opens the same panel', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary .sv-item__claim').first().click();
  await viewpoint
    .getByRole('link', {
      name: 'Immigration and the Health and Care Workforce', exact: true,
    })
    .click();

  await expect(page).toHaveURL(new RegExp(`${factUrl(CARE)}$`));
  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(`${dialog} ${title}`)).toContainText(
    'Immigration and the Health and Care Workforce'
  );
});

test('the panel is labelled by the fact it is showing', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  const claim = await page.locator(`${dialog} ${title}`).textContent();
  await expect(page.getByRole('dialog', { name: claim ?? '' })).toBeVisible();
});

test('Escape closes the panel and returns to the topic', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  await expect(page.locator(dialog)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  // Focus returns to the row that opened it.
  await expect(page.locator(row(HEADLINE))).toBeFocused();
});

test('clicking the backdrop closes the panel', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  await expect(page.locator(dialog)).toBeVisible();

  // The panel does not fill the dialog at desktop width; the corner is backdrop.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator(dialog).click({ position: { x: 4, y: 4 } });
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});

test('the close button closes the panel', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
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
  await page.locator(row(HEADLINE)).click();
  await expect(page).toHaveURL(new RegExp(`${factUrl(HEADLINE)}$`));

  await page.goBack();
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
});

// Closing by any other route takes the fact back out of the URL, so a reader
// who closes the panel and reloads does not get it opened again.
test('closing the panel takes the fact off the URL', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(new RegExp(`${TOPIC}$`));
});

// A supporting fact has an address of its own, and its panel opens by naming
// the headline claim it is evidence for — a supporting fact read without that
// claim is the out-of-context number this page exists to prevent. It is not a
// row in the Facts list (see topic-page.spec.ts), so it is reached here the
// way a reader actually reaches it outside its parent's detail: a citation
// chip, in this case the "Builds on" chip in the viewpoint that cites it.
test('a supporting fact opens its own panel, which names the claim it supports', async ({
  page,
}) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary .sv-item__claim').first().click();
  await viewpoint.locator('.sv-evidence-index > summary').click();
  await viewpoint
    .getByRole('link', {
      name: 'Fiscal Contributions of Care Workers', exact: true,
    })
    .click();

  await expect(page).toHaveURL(new RegExp(`${factUrl(SUPPORTING)}$`));
  await expect(page.locator(`${dialog} .sv-parentnote__claim`)).toHaveAttribute(
    'href',
    factUrl(FISCAL)
  );
  await expect(
    page.locator(`${dialog} .sv-finding`).filter({ hasText: '36,000' }).first()
  ).toBeVisible();
});

test('a supporting fact inside the panel still expands and collapses', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(FISCAL)).click();
  const child = page.locator(`${dialog} details.sv-subfact`).first();
  const quote = child.locator('.sv-finding');
  await expect(quote).toBeHidden();
  await child.locator(':scope > summary').click();
  await expect(quote).toBeVisible();
});

test('focus moves into the panel and Tab stays inside it', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
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
  await page.locator(row(HEADLINE)).click();
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

  test('a fact row is an ordinary link to the fact page', async ({ page }) => {
    await page.goto(TOPIC);
    const link = page.locator(row(HEADLINE));
    await expect(link).toHaveAttribute('href', factUrl(HEADLINE));

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${factUrl(HEADLINE)}$`));
    await expect(page.locator(dialog)).toHaveCount(0);
    // The whole fact is there: claim, status, context, chart, sources.
    await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
    await expect(page.locator('.sv-factpage .sv-status').first()).toBeVisible();
    await expect(page.locator('.sv-chart').first()).toBeVisible();
    await expect(page.locator('.sv-references blockquote').first()).toBeHidden();
    await page.locator('.sv-references > summary').click();
    await page.locator('.sv-source-quote > summary').first().click();
    await expect(page.locator('.sv-references blockquote').first()).toBeVisible();
  });

  test('a fact chip in a viewpoint is an ordinary link to the fact page', async ({ page }) => {
    await page.goto(TOPIC);
    const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
    await viewpoint.locator('summary .sv-item__claim').first().click();
    const link = viewpoint.getByRole('link', {
      name: 'Immigration and the Health and Care Workforce', exact: true,
    });
    await expect(link).toHaveAttribute('href', factUrl(CARE));

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${factUrl(CARE)}$`));
    await expect(page.locator(dialog)).toHaveCount(0);
    await expect(page.locator('h1.sv-factpage__claim')).toContainText(
      'Immigration and the Health and Care Workforce'
    );
  });
});

// Once prefetched, opening and reopening facts needs no network response.
test('facts open with the network offline and Forward restores the modal', async ({ page, context }) => {
  await page.goto(TOPIC, { waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.locator(row(HEADLINE)).click();
  await expect(page.locator(`${dialog} ${title}`)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-chart`).first()).toBeVisible();
  await page.goBack();
  await expect(page.locator(dialog)).toHaveCount(0);
  await page.goForward();
  await expect(page.locator(`${dialog} ${title}`)).toBeVisible();
  await page.locator('.sv-modal__close').click();
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page.locator(row(HEADLINE))).toBeFocused();
});

test('Expand loads the standalone fact page', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  await page.getByRole('link', { name: 'Expand', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${factUrl(HEADLINE)}$`));
  await expect(page.locator(dialog)).toHaveCount(0);
  await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
});


test('a slow fact response never delays opening or switching the modal', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/topics/**/facts/**', async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(TOPIC);
    await page.locator(row(HEADLINE)).click();
    await expect(page.locator(dialog)).toBeVisible();
    await expect(page.locator(`${dialog} ${title}`)).toHaveText('UK Immigration Trends');
    await expect(page.getByRole('status')).toHaveText('Loading data…');
    await page.locator('.sv-modal__close').click();
    await expect(page.locator(dialog)).toHaveCount(0);
    const other = page.locator('a.sv-factrow').nth(1);
    const claim = await other.locator('.sv-item__claim').textContent();
    await other.click();
    await expect(page.locator(`${dialog} ${title}`)).toHaveText(claim!);
    release();
    await expect(page.locator(`${dialog} .sv-factpage__body`)).toBeVisible();
    await expect(page.locator(`${dialog} ${title}`)).toHaveText(claim!);
  } finally {
    release();
  }
});

test('modified fact clicks are left to the browser', async ({ page }) => {
  await page.goto(TOPIC, { waitUntil: 'networkidle' });
  // Observe the event after application handlers, then suppress the browser's
  // platform-specific new-tab/context-menu default inside this test only.
  for (const modifier of ['ctrlKey', 'metaKey'] as const) {
    const prevented = await page.locator(row(HEADLINE)).evaluate((link, key) => {
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
  await page.locator(row(HEADLINE)).click();
  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-factpage__body`)).toBeVisible();
  expect(blockedScripts).toEqual([]);
});
