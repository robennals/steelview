import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local previews can use the loopback IP instead of localhost. Their JS
  // must load too, or fact links fall back to full-page navigation.
  allowedDevOrigins: ['127.0.0.1'],
  redirects: async () => [{
    source: '/topics/uk-immigration/facts/net-migration-peak-and-fall',
    destination: '/topics/uk-immigration/facts/immigration-against-the-long-run#immigration-against-the-long-run--net-migration-is-not-unusual-at-all',
    permanent: true,
  }, {
    source: '/topics/uk-immigration/facts/immigration-shifted-from-eu-to-non-eu',
    destination: '/topics/uk-immigration/facts/immigration-against-the-long-run#immigration-against-the-long-run--nationality-shift',
    permanent: true,
  }],
};

export default nextConfig;
