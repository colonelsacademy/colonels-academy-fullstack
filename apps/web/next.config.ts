import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
    ]
  }
};

export default nextConfig;
