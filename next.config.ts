import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local previews can use the loopback IP instead of localhost. Their JS
  // must load too, or fact links fall back to full-page navigation.
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
