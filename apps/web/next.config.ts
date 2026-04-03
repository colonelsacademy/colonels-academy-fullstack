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
      }
    ]
  }
};

export default nextConfig;
