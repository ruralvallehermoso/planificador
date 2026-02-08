const nextConfig: NextConfig = {
  // Use basePath for standard microfrontend routing
  basePath: '/apps/hogar',
  // Disable trailing slashes to avoid redirect loops with rewrites
  trailingSlash: false,
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
