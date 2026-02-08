import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Enforce paths to always be /apps/hogar
  basePath: '/apps/hogar',
  // Explicitly set assetPrefix to match basePath (redundant but safe)
  assetPrefix: '/apps/hogar',
  // Use trailing slashes to avoid redirection loops/issues in rewrites
  trailingSlash: true,
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
