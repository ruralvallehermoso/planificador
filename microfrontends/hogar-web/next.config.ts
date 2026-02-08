import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Usamos basePath para que la app espere ser servida bajo /apps/hogar
  // Esto arregla tanto el routing como la carga de assets
  basePath: isProd ? '/apps/hogar' : undefined,
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
