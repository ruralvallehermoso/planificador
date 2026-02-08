const nextConfig: NextConfig = {
  // Use basePath for standard microfrontend routing
  basePath: '/apps/hogar',
  // Enable trailing slashes for consistent path matching on Vercel
  trailingSlash: true,
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
