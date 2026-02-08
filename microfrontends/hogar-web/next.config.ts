import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // basePath removed to allow rewrite stripping
  // Explicitly set assetPrefix to match the Main App rewrite path for assets
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
