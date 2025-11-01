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
};

export default nextConfig;
