import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Cuando se accede a través del rewrite /apps/hogar, los assets deben cargarse 
  // desde el dominio original para no romper las rutas relativas
  assetPrefix: isProd ? 'https://hogar-web.vercel.app' : undefined,
  async headers() {
    return [
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
