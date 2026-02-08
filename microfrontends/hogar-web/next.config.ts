import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Cuando se accede a través del rewrite /apps/hogar, los assets deben cargarse 
  // usando el mismo prefijo para que el rewrite los intercepte y sirva correctamente
  // Evitamos dominios absolutos para prevenir problemas de CORS setup
  assetPrefix: isProd ? '/apps/hogar' : undefined,
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
