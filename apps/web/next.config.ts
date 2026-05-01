import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true
  },
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
  },
  async redirects() {
    return [
      {
        source: "/courses/staff-college-command",
        destination: "/staff-college",
        permanent: true
      },
      {
        source: "/courses/staff-college-command/:path*",
        destination: "/staff-college",
        permanent: true
      }
    ];
  }
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT
};

const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true
};

export default process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions, sentryOptions)
  : nextConfig;
