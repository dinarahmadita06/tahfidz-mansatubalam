/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false, // Keep disabled to prevent hydration errors

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental settings to optimize imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Optimize compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  
  // Enable minification for production
  swcMinify: true,

  // Optimize images and fonts
  images: {
    minimumCacheTTL: 60,
  },

  // Optimize page loading
  swcMinify: true,

  // Webpack config to handle permission issues
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.next', '**/C:/Users/**', '**/.git', '**/dist'],
    };
    
    return config;
  },

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
