import { test, expect } from '@playwright/test';

// Addressing each fact individually is only worth anything if a machine can
// find and use them, so the sitemap, the canonicals and the structured data
// are part of the feature rather than decoration on top of it.

const TOPIC = '/topics/uk-immigration';
const FACT = `${TOPIC}/facts/immigration-against-the-long-run`;

test('the sitemap lists the home page, every topic and every fact', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  expect(locs.some((l) => new URL(l).pathname === '/')).toBe(true);
  expect(locs.some((l) => new URL(l).pathname === TOPIC)).toBe(true);

  const factPaths = locs
    .map((l) => new URL(l).pathname)
    .filter((p) => p.startsWith(`${TOPIC}/facts/`));
  // 12 headline facts and 20 supporting ones — both kinds are cited, so both
  // are listed.
  expect(factPaths.length).toBeGreaterThanOrEqual(30);
  expect(factPaths).toContain(FACT);
  expect(new Set(locs).size).toBe(locs.length);
});

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toMatch(/User-Agent: \*/i);
  expect(body).toMatch(/Allow: \//);
  expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
});

test('a fact page carries its own title, description, canonical and card', async ({ page }) => {
  await page.goto(FACT);
  const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
  expect(new URL(canonical ?? '').pathname).toBe(FACT);

  const claim = await page.locator('h1.sv-factpage__claim').textContent();
  await expect(page).toHaveTitle(`${claim} — Steelview`);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', claim ?? '');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
  expect(new URL(ogUrl ?? '').pathname).toBe(FACT);
  const description = await page.locator('meta[name=description]').getAttribute('content');
  expect((description ?? '').length).toBeGreaterThan(20);
});

test('the topic page carries a canonical and Open Graph metadata', async ({ page }) => {
  await page.goto(TOPIC);
  const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
  expect(new URL(canonical ?? '').pathname).toBe(TOPIC);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'UK immigration'
  );
});

test('a fact page states in machine-readable form what it is', async ({ page }) => {
  await page.goto(FACT);
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw ?? '{}');
  expect(data['@type']).toBe('CollectionPage');
  expect(new URL(data.url).pathname).toBe(FACT);
  expect(data.name).toBe(await page.locator('h1.sv-factpage__claim').textContent());
  expect(new URL(data.isPartOf['@id']).pathname).toBe(TOPIC);
  // Every quoted source is a citation, with its publisher and date.
  expect(Array.isArray(data.citation)).toBe(true);
  expect(data.citation.length).toBeGreaterThan(0);
  expect(data.citation[0].publisher['@type']).toBe('Organization');
});
