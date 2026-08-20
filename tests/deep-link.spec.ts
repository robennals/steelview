import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the headline
// fact `non-citizens-share-of-convictions-and-prisons`, the supporting fact
// `net-migration-peak-and-fall` (body text "Net migration in YE December
// 2025 was 171,000.") and the headline fact `immigration-against-the-long-run`
// it supports, the viewpoint `a-country-should-decide-who-joins-it`, and the
// fact `health-and-care-relies-on-migrant-workers` (claim "Health and care is
// the sector most dependent on migrant labour") that that viewpoint lists.
// Editing any of that content's wording, ids, or cross-references will turn
// this suite red.

// A fact is addressed by its own URL now, not by an anchor on the topic page:
// a cold load of that URL is the fact's standalone page, and a click from
// within the topic is the same route intercepted into a panel over it.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;

test('a fact URL loaded cold renders the standalone page', async ({ page }) => {
  await page.goto(factUrl('non-citizens-share-of-convictions-and-prisons'));
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
  await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
  await expect(
    page.getByText('It is not a measurement of offending', { exact: false })
  ).toBeVisible();
  // The page says which topic it belongs to and links back to it.
  await expect(page.locator('.sv-crumbs').getByRole('link', { name: 'UK immigration' })).toHaveAttribute(
    'href',
    TOPIC
  );
});

// A supporting fact is evidence for a headline claim and says little standing
// alone, so its page states that claim before any of the detail and links to it.
test('a supporting fact page makes its parent obvious and links to it', async ({ page }) => {
  await page.goto(factUrl('net-migration-peak-and-fall'));
  const parent = page.locator('.sv-parentnote__claim');
  await expect(parent).toBeVisible();
  await expect(parent).toHaveAttribute('href', factUrl('immigration-against-the-long-run'));
  await expect(page.locator('.sv-parentnote__label')).toHaveText('Evidence for');
  await expect(
    page.getByText('Net migration in YE December 2025 was 171,000.', { exact: false })
  ).toBeVisible();

  // Following it goes to the parent's address. Within a topic a fact always
  // opens over whatever the reader was reading, so from here that is the
  // panel — one Back from the fact they came from, and the URL is the
  // parent's either way.
  await parent.click();
  await expect(page).toHaveURL(new RegExp(`${factUrl('immigration-against-the-long-run')}$`));
  await expect(page.locator('#sv-modal-title')).toContainText('Long-term immigration');
});

test('clicking a cross-reference chip opens the fact it points at', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-a-country-should-decide-who-joins-it');
  await viewpoint.locator('summary').click();
  await viewpoint
    .getByRole('link', {
      name: 'Health and care is the sector most dependent on migrant labour',
    })
    .click();
  await expect(page).toHaveURL(new RegExp(`${factUrl('health-and-care-relies-on-migrant-workers')}$`));
  await expect(page.locator('dialog.sv-modal #sv-modal-title')).toContainText(
    'Health and care is the sector most dependent on migrant labour'
  );
});

// Every fact is addressable, headline and supporting alike, because both are
// cited — and the topic page is where a crawler finds them.
test('every fact in the list links to its own page', async ({ page }) => {
  await page.goto(TOPIC);
  const rows = page.locator('a.sv-factrow');
  const total = await rows.count();
  expect(total).toBeGreaterThan(12);
  const hrefs = await rows.evaluateAll((links) =>
    links.map((l) => l.getAttribute('href') ?? '')
  );
  for (const href of hrefs) {
    expect(href).toMatch(/^\/topics\/uk-immigration\/facts\/[a-z0-9-]+$/);
  }
  expect(new Set(hrefs).size).toBe(total);
});

// Addresses are permanent and must keep working with no JavaScript to
// interpret them: the fact URL is a real, statically generated page.
test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('a fact URL still delivers the whole fact', async ({ page }) => {
    await page.goto(factUrl('immigration-against-the-long-run'));
    await expect(page.locator('h1.sv-factpage__claim')).toBeVisible();
    await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
    await expect(page.locator('.sv-stance blockquote').first()).toBeVisible();
    // Its supporting fact travels with it, and opens where it stands.
    const child = page.locator('details.sv-subfact').first();
    const quote = child.getByText('Net migration in YE December 2025 was 171,000', {
      exact: false,
    });
    await expect(quote).toBeHidden();
    await child.locator('summary').click();
    await expect(quote).toBeVisible();
  });
});

// A page that works without JavaScript must not be destroyed by its
// JavaScript: `decodeURIComponent` throws on a malformed escape like `%zz`,
// and an uncaught throw in a mount effect would otherwise replace the
// already-delivered static HTML with Next's default error boundary.
test('a malformed hash does not break the page', async ({ page }) => {
  await page.goto(`${TOPIC}#%zz`);
  await expect(page.getByRole('heading', { name: 'UK immigration', level: 1 })).toBeVisible();
  await expect(page.locator('a.sv-factrow').first()).toBeVisible();
});
