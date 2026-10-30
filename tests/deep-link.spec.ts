import { test, expect } from '@playwright/test';

// These assertions depend on authored uk-immigration content: the reports
// `crime-terrorism-and-group-exploitation`, `immigration-economy-and-public-finances`
// and `work-and-study-routes`, the viewpoint `open-and-build`, and the link
// text it uses for `work-and-study-routes`. Editing any of that content's
// wording, ids, or cross-references will turn this suite red.

// A fact is addressed by its own URL now, not by an anchor on the topic page:
// a cold load of that URL is the fact's standalone page, and a click from
// within the topic is the same route intercepted into a panel over it.

const TOPIC = '/topics/uk-immigration';
const factUrl = (id: string) => `${TOPIC}/facts/${id}`;

test('a fact URL loaded cold renders the standalone page', async ({ page }) => {
  await page.goto(factUrl('crime-terrorism-and-group-exploitation'));
  await expect(page.locator('dialog.sv-modal')).toHaveCount(0);
  await expect(page.locator('h1.sv-factpage__claim')).toContainText(
    'Crime, Terrorism and Group-Based Child Sexual Exploitation'
  );
  // The page says which topic it belongs to and links back to it.
  await expect(page.locator('.sv-crumbs').getByRole('link', { name: 'UK immigration' })).toHaveAttribute(
    'href',
    TOPIC
  );
});

// Addresses are permanent: a fact merged into a report keeps working, and
// lands on the report that now holds it.
test('the address of a merged fact redirects to its report', async ({ page }) => {
  await page.goto(factUrl('care-worker-route-fiscally-negative'));
  await expect(page).toHaveURL(new RegExp(`${factUrl('immigration-economy-and-public-finances')}$`));
  await expect(page.locator('h1.sv-factpage__claim')).toContainText('Immigration, the Economy and the Public Finances');
});

test('clicking a cross-reference chip opens the fact it points at', async ({ page }) => {
  await page.goto(TOPIC);
  const viewpoint = page.locator('#viewpoint-open-and-build');
  await viewpoint.locator('summary .sv-item__claim').first().click();
  await viewpoint
    .getByRole('link', {
      name: 'About a fifth of NHS staff in England are not British, and over a third of doctors',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(new RegExp(`${factUrl('work-and-study-routes')}#`));
  await expect(page.locator('dialog.sv-modal #sv-modal-title')).toContainText(
    'Work and Study Visas and the Care Workforce'
  );
});

// Every headline fact in the list links to its own page.
test('every headline fact in the list links to its own page', async ({ page }) => {
  await page.goto(TOPIC);
  // The rest of the headline facts sit behind the Facts collapse.
  await page.locator('details.sv-more > summary').click();
  const rows = page.locator('a.sv-factrow');
  const total = await rows.count();
  expect(total).toBe(7);
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
    await expect(page.locator('.sv-references blockquote').first()).toBeHidden();
    await page.locator('.sv-references > summary').click();
    await page.locator('.sv-source-quote > summary').first().click();
    await expect(page.locator('.sv-references blockquote').first()).toBeVisible();
    // The merged observation and its graph work without JavaScript too.
    await page.locator('#immigration-against-the-long-run--observations-nationality-arrivals > summary').click();
    const child = page.locator('#immigration-against-the-long-run--nationality-shift');
    const quote = child.locator('.sv-observation__body');
    await expect(quote).toBeHidden();
    await child.locator(':scope > summary').click();
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
