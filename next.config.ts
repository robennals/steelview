import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local previews can use the loopback IP instead of localhost. Their JS
  // must load too, or fact links fall back to full-page navigation.
  allowedDevOrigins: ['127.0.0.1'],
  /*
   * Data collections no longer have pages of their own, so an old link to one
   * lands on its topic. A few collections moved from UK immigration to UK
   * asylum first; their old addresses go there. Not permanent: the pages may
   * come back.
   */
  redirects: async () => [
    { source: '/topics/uk-immigration/facts/asylum-accommodation-cost-overrun', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/uk-immigration/facts/asylum-backlog-and-hotel-use-have-fallen', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/uk-immigration/facts/asylum-claims-in-historical-and-european-context', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/uk-immigration/facts/asylum-grant-rate-fell', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/uk-immigration/facts/deportable-offenders-living-in-the-community', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/uk-immigration/facts/deterrence-would-reduce-channel-crossings', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/uk-immigration/facts/illegal-arrivals-drove-the-net-migration-rise', destination: '/topics/uk-asylum', permanent: false },
    { source: '/topics/:slug/facts/:fact*', destination: '/topics/:slug', permanent: false },
  ],
};

export default nextConfig;
