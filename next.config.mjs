/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental settings to optimize imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // TEMPORARILY DISABLE MINIFICATION TO SEE FULL ERRORS
  productionBrowserSourceMaps: true,
  
  // Optimize compilation
  compiler: {
    removeConsole: false, // Keep console logs to debug
  },
  
  // Disable minification temporarily
  swcMinify: false,

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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules' blob: chrome-extension:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com blob:; font-src 'self' https://fonts.gstatic.com blob: data:; img-src 'self' data: https: blob:; connect-src 'self' https: blob:; media-src 'self' https://everyayah.com https://cdn.islamic.network; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;
