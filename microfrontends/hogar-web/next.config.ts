const nextConfig: NextConfig = {
  // Use basePath for standard microfrontend routing
  basePath: '/apps/hogar',
  // Disable trailing slashes to keep URLs clean and avoid extra redirects
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          // Explicitly allow framing from same origin and the main planificador domain
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://planificador-chi.vercel.app http://localhost:3000" },
        ],
      },
      {
        source: "/_next/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
