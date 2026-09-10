/**
 * The origin every canonical, Open Graph and sitemap URL is built from.
 *
 * Crawlability is the point of addressing facts individually, and a crawler
 * needs absolute URLs. The value is overridable so a preview deployment does
 * not advertise production URLs, and vice versa.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://steelview.vercel.app').replace(
  /\/$/,
  ''
);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
