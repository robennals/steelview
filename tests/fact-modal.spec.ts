import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the headline
// fact `immigration-against-the-long-run` (first in the derived ranking, so it
// renders outside the Facts collapse), the supporting fact
// `net-migration-peak-and-fall` it holds, and the viewpoint
// `a-country-should-decide-who-joins-it`, which lists the fact
// `health-and-care-relies-on-migrant-workers` (claim "Health and care is the
// sector most dependent on migrant labour").

const TOPIC = '/topics/uk-immigration';
const HEADLINE = 'immigration-against-the-long-run';
const SUPPORTING = 'net-migration-peak-and-fall';
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
  // The panel is rendered from the fact's own route, so it holds the whole
  // fact — claim, status, body, chart, sources and supporting facts — not a
  // borrowed piece of the list behind it.
  await expect(page.locator(`${dialog} ${title}`)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-chart`)).toBeVisible();
  await expect(page.locator(`${dialog} .sv-supporting details.sv-subfact`)).toHaveCount(1);
});

test('a fact chip in a viewpoint opens the same panel', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary').first().click();
  await viewpoint
    .getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    })
    .click();

  await expect(page).toHaveURL(new RegExp(`${factUrl(CARE)}$`));
  await expect(page.locator(dialog)).toBeVisible();
  await expect(page.locator(`${dialog} ${title}`)).toContainText(
    'Health and care is the sector most dependent on migrant labour'
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
// claim is the out-of-context number this page exists to prevent.
test('a supporting fact opens its own panel, which names the claim it supports', async ({
  page,
}) => {
  await page.goto(TOPIC);
  await page.locator(row(SUPPORTING)).click();

  await expect(page).toHaveURL(new RegExp(`${factUrl(SUPPORTING)}$`));
  await expect(page.locator(`${dialog} .sv-parentnote__claim`)).toHaveAttribute(
    'href',
    factUrl(HEADLINE)
  );
  await expect(
    page.locator(dialog).getByText('Net migration in YE December 2025 was 171,000.', {
      exact: false,
    })
  ).toBeVisible();
});

test('a supporting fact inside the panel still expands and collapses', async ({ page }) => {
  await page.goto(TOPIC);
  await page.locator(row(HEADLINE)).click();
  const child = page.locator(`${dialog} details.sv-subfact`).first();
  const quote = child.getByText('Net migration in YE December 2025 was 171,000', { exact: false });
  await expect(quote).toBeHidden();
  await child.locator('summary').click();
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
    await expect(page.locator('.sv-chart')).toBeVisible();
    await expect(page.locator('.sv-stance blockquote').first()).toBeVisible();
  });

  test('a fact chip in a viewpoint is an ordinary link to the fact page', async ({ page }) => {
    await page.goto(TOPIC);
    const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
    await viewpoint.locator('summary').first().click();
    const link = viewpoint.getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    });
    await expect(link).toHaveAttribute('href', factUrl(CARE));

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${factUrl(CARE)}$`));
    await expect(page.locator(dialog)).toHaveCount(0);
    await expect(page.locator('h1.sv-factpage__claim')).toContainText(
      'Health and care is the sector most dependent on migrant labour'
    );
  });
});
