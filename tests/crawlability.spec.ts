import { test, expect } from './hydrated-test';

// A topic is only worth publishing if a machine can find it, so the sitemap,
// robots.txt and each topic's canonical and card are part of the site rather
// than decoration on top of it.

const TOPIC = '/topics/uk-immigration';

test('the sitemap lists the site’s own pages and every topic, and no data collections', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

  expect(paths).toContain('/');
  expect(paths).toContain('/about');
  expect(paths).toContain('/how-its-made');
  expect(paths).toContain('/privacy');
  expect(paths).toContain('/feedback');
  for (const slug of ['uk-asylum', 'uk-immigration', 'us-iran-war', 'us-vote-by-mail', 'us-voter-id']) {
    expect(paths).toContain(`/topics/${slug}`);
  }
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
