import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the headline
// fact `immigration-against-the-long-run` (first in the derived ranking, so it
// renders outside the Facts collapse), the supporting fact
// `net-migration-peak-and-fall` it holds, and the viewpoint
// `a-country-should-decide-who-joins-it`, which cites the fact
// `health-and-care-relies-on-migrant-workers` (claim "Health and care is the
// sector most dependent on migrant labour").

const HEADLINE = '#fact-immigration-against-the-long-run';
const SUPPORTING = '#fact-net-migration-peak-and-fall';
const dialog = 'dialog.sv-modal';
const inModal = `${dialog} ${HEADLINE}`;

test('clicking a fact in the list opens it in the panel', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await expect(page.locator(dialog)).toBeHidden();

  await page.locator(`${HEADLINE} > summary`).click();

  // The fact is *moved* into the dialog, not copied: exactly one element on
  // the page carries the anchor, and it is the one inside the dialog. Two
  // would make every deep link to it a coin toss.
  await expect(page.locator(HEADLINE)).toHaveCount(1);
  await expect(page.locator(inModal)).toBeVisible();
  await expect(page.locator(dialog)).toBeVisible();
  // Open, with its body and its supporting facts, as it was inline.
  await expect(page.locator(inModal)).toHaveAttribute('open', '');
  await expect(page.locator(`${dialog} ${SUPPORTING}`)).toBeVisible();
});

test('a citation link in a viewpoint opens the same panel', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary').first().click();
  await viewpoint
    .getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    })
    .click();

  const fact = page.locator('#fact-health-and-care-relies-on-migrant-workers');
  await expect(page.locator(`${dialog} #fact-health-and-care-relies-on-migrant-workers`)).toBeVisible();
  await expect(fact).toHaveCount(1);
  await expect(fact).toHaveAttribute('open', '');
});

test('the panel is labelled by the fact it is showing', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  const claim = await page.locator(`${inModal} > summary .sv-item__claim`).textContent();
  await expect(page.getByRole('dialog', { name: claim ?? '' })).toBeVisible();
});

test('Escape closes the panel and puts the fact back in the list', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  await expect(page.locator(inModal)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator(dialog)).toBeHidden();
  // Back in the list, collapsed as it was, and still the only copy.
  await expect(page.locator(HEADLINE)).toHaveCount(1);
  await expect(page.locator(HEADLINE)).toBeVisible();
  await expect(page.locator(HEADLINE)).not.toHaveAttribute('open', '');
  // Focus returns to the row that opened it.
  await expect(page.locator(`${HEADLINE} > summary`)).toBeFocused();
});

test('clicking the backdrop closes the panel', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  await expect(page.locator(inModal)).toBeVisible();

  // The panel does not fill the dialog; the corner is backdrop.
  await page.locator(dialog).click({ position: { x: 4, y: 4 } });
  await expect(page.locator(dialog)).toBeHidden();
  await expect(page.locator(HEADLINE)).toBeVisible();
});

test('the close button closes the panel', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  await page.locator('.sv-modal__close').click();
  await expect(page.locator(dialog)).toBeHidden();
  await expect(page.locator(HEADLINE)).toBeVisible();
});

// The panel is a place in the reader's history, not a mode they get stuck in:
// Back closes it rather than leaving the page.
test('opening the panel puts the fact in the URL, and Back closes it', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  await expect(page).toHaveURL(new RegExp(`${HEADLINE.slice(1)}$`));

  await page.goBack();
  await expect(page.locator(dialog)).toBeHidden();
  await expect(page).toHaveURL(/\/topics\/uk-immigration$/);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
});

// Closing by any other route takes the fact back out of the URL, so a reader
// who closes the panel and reloads does not get it opened again.
test('closing the panel takes the fact off the URL', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/topics\/uk-immigration$/);
});

test('a page loaded at a fact anchor opens that fact in the panel', async ({ page }) => {
  await page.goto(`/topics/uk-immigration${HEADLINE}`);
  await expect(page.locator(inModal)).toBeVisible();
  await expect(page.locator(HEADLINE)).toHaveCount(1);
});

// A supporting fact's anchor is a permanent address of its own, and it lives
// inside its headline fact — so opening it moves the whole headline fact into
// the panel and the supporting fact is open inside it.
test('a supporting fact anchor opens the headline fact holding it', async ({ page }) => {
  await page.goto(`/topics/uk-immigration${SUPPORTING}`);
  await expect(page.locator(`${dialog} ${SUPPORTING}`)).toBeVisible();
  await expect(page.locator(`${dialog} ${SUPPORTING}`)).toHaveAttribute('open', '');
  await expect(
    page
      .locator(SUPPORTING)
      .getByText('Net migration in YE December 2025 was 171,000.', { exact: false })
  ).toBeVisible();
});

test('a supporting fact inside the panel still expands and collapses', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  const child = page.locator(`${dialog} ${SUPPORTING}`);
  const quote = child.getByText('Net migration in YE December 2025 was 171,000', { exact: false });
  await expect(quote).toBeHidden();
  await child.locator('summary').click();
  await expect(quote).toBeVisible();
});

// The fact's own summary is the panel's title. Clicking it must not empty the
// panel the reader just opened.
test('the panel keeps its fact open when its title is clicked', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
  await page.locator(`${inModal} > summary`).click();
  await expect(page.locator(inModal)).toHaveAttribute('open', '');
});

test('focus moves into the panel and Tab stays inside it', async ({ page }) => {
  await page.goto('/topics/uk-immigration');
  await page.locator(`${HEADLINE} > summary`).click();
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

// Everything above is presentation layered on markup that works on its own.
// With JavaScript off there is no panel: a fact is a <details> a reader opens
// in place, and a citation is an anchor that takes them to it in the list.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a fact expands in place and no dialog is ever shown', async ({ page }) => {
    await page.goto('/topics/uk-immigration');
    const fact = page.locator(HEADLINE);
    const body = page.locator(SUPPORTING);
    await expect(body).toBeHidden();

    await fact.locator('summary').first().click();
    await expect(fact).toHaveAttribute('open', '');
    await expect(body).toBeVisible();
    // The fact stays where it is: it is still a child of the Facts section.
    await expect(page.locator(`${dialog} ${HEADLINE}`)).toHaveCount(0);
    await expect(page.locator(dialog)).toBeHidden();
  });

  test('a fact link in a viewpoint is an anchor to the fact in the list', async ({ page }) => {
    await page.goto('/topics/uk-immigration');
    const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
    await viewpoint.locator('summary').first().click();
    const link = viewpoint.getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    });
    await expect(link).toHaveAttribute(
      'href',
      '#fact-health-and-care-relies-on-migrant-workers'
    );
    await link.click();
    await expect(page).toHaveURL(/#fact-health-and-care-relies-on-migrant-workers$/);
    await expect(page.locator(dialog)).toBeHidden();
    // The fact is still in the list where the anchor points, and opening it
    // there is a click on its summary.
    const fact = page.locator('#fact-health-and-care-relies-on-migrant-workers');
    await expect(fact).toHaveCount(1);
    await expect(page.locator(`${dialog} #fact-health-and-care-relies-on-migrant-workers`)).toHaveCount(0);
  });
});
