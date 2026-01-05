import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Microfrontend rewrites for direct navigation
  async rewrites() {
    return [
      // Portfolio Master
      {
        source: '/apps/portfolio/:path*',
        destination: `${process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'http://localhost:5173'}/:path*`,
      },
      // Dashboard Financiero (Streamlit)
      {
        source: '/apps/dashboard/:path*',
        destination: `${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:8501'}/:path*`,
      },
      // Casa Rural
      {
        source: '/apps/casa-rural/:path*',
        destination: `${process.env.NEXT_PUBLIC_CASARURAL_URL || 'http://localhost:3002'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
