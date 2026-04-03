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
        hostname: "colonels-alpha.b-cdn.net"
      }
    ]
  }
};

export default nextConfig;
