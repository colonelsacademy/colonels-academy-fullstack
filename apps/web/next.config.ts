import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@colonels-academy/api-client",
    "@colonels-academy/config",
    "@colonels-academy/contracts",
    "@colonels-academy/ui"
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ca-assets.b-cdn.net"
      },
      {
        protocol: "https",
        hostname: "dev.thecolonelsacademy.com"
      },
      {
        protocol: "https",
        hostname: "uat.thecolonelsacademy.com"
      },
      {
        protocol: "https",
        hostname: "colonels-alpha.b-cdn.net"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ],
    // Image optimization settings
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configure quality levels
    qualities: [50, 75, 90, 100]
  }
};

export default nextConfig;
