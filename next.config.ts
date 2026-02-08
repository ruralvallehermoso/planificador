import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Microfrontend rewrites - solo se activan si hay URLs configuradas
  async rewrites() {
    const rewrites = [];

    // Portfolio Master - solo si hay URL o estamos en desarrollo
    const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || (isDev ? 'http://localhost:5173' : '');
    if (portfolioUrl) {
      rewrites.push({
        source: '/apps/portfolio/:path*',
        destination: `${portfolioUrl}/:path*`,
      });
    }

    // Dashboard Financiero (Now migrated to Portfolio app)
    if (portfolioUrl) {
      rewrites.push({
        source: '/apps/dashboard',
        destination: `${portfolioUrl}/?view=simulator`,
      });
      rewrites.push({
        source: '/apps/dashboard/:path*',
        destination: `${portfolioUrl}/:path*`,
      });
    }

    // Casa Rural
    const casaRuralUrl = process.env.NEXT_PUBLIC_CASARURAL_URL || (isDev ? 'http://localhost:3002' : '');
    if (casaRuralUrl) {
      rewrites.push({
        source: '/apps/casa-rural/:path*',
        destination: `${casaRuralUrl}/:path*`,
      });
    }

    // Hogar
    const hogarUrl = process.env.NEXT_PUBLIC_HOGAR_URL || (isDev ? 'http://localhost:3003' : 'https://hogar-web.vercel.app');
    if (hogarUrl) {
      rewrites.push({
        source: '/apps/hogar/:path*',
        // Rewrite to microfrontend basePath without trailing slash
        destination: `${hogarUrl}/apps/hogar/:path*`,
      });
    }

    return rewrites;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }
        ],
      },
    ]
  },
};

export default nextConfig;

