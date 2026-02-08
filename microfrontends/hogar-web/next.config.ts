const nextConfig: NextConfig = {
  // We remove basePath to simplify routing and avoid rewrite conflicts
  // We use assetPrefix to ensure styles load correctly through the main app proxy
  assetPrefix: '/apps/hogar',
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          // Allow framing from the main planificador domain
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://planificador-chi.vercel.app http://localhost:3000" },
        ],
      },
    ];
  },
};

export default nextConfig;
