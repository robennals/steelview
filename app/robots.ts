import type { MetadataRoute } from 'next';
import { absoluteUrl, SITE_URL } from '@/lib/site';

/**
 * Everything here is meant to be indexed. The whole point of giving each fact
 * its own address is that the content is reusable by people who did not come
 * through the front page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
