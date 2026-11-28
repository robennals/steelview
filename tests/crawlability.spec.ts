import { test, expect } from './hydrated-test';

// A topic is only worth publishing if a machine can find it, so the sitemap,
// robots.txt and each topic's canonical and card are part of the site rather
// than decoration on top of it.

const TOPIC = '/topics/uk-immigration';

test('the sitemap lists the home page, the About page and every topic on the home page, and no data collections', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

  expect(paths).toContain('/');
  expect(paths).toContain('/about');
  const home = await (await request.get('/')).text();
  const topics = [...new Set([...home.matchAll(/href="(\/topics\/[^"/#?]+)"/g)].map((m) => m[1]))];
  expect(topics.length).toBeGreaterThan(0);
  for (const topic of topics) expect(paths).toContain(topic);
  // A data collection has no page of its own, so nothing to list.
  expect(paths.filter((p) => p.includes('/facts/'))).toEqual([]);
  expect(new Set(paths).size).toBe(paths.length);
});

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toMatch(/User-Agent: \*/i);
  expect(body).toMatch(/Allow: \//);
  expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
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

test('an unknown topic is a 404, even at an old data-collection address', async ({ request }) => {
  expect((await request.get('/topics/no-such-topic')).status()).toBe(404);
  // The catch-all redirect sends this to the topic, which still does not exist.
  expect((await request.get('/topics/no-such-topic/facts/anything')).status()).toBe(404);
});

test('the home and About pages carry their titles and canonicals', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Steelview');
  expect(new URL((await page.locator('link[rel=canonical]').getAttribute('href')) ?? '').pathname).toBe('/');

  await page.goto('/about');
  await expect(page).toHaveTitle('About — Steelview');
  await expect(page.getByRole('heading', { name: 'About Steelview', level: 1 })).toBeVisible();
  expect(new URL((await page.locator('link[rel=canonical]').getAttribute('href')) ?? '').pathname).toBe('/about');
});
