/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental settings to optimize imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Disable source maps in development to reduce file operations
  productionBrowserSourceMaps: false,

  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize images and fonts
  images: {
    minimumCacheTTL: 60,
  },

  // Optimize page loading
  swcMinify: true,

  // Security headers including CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com blob:; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;
