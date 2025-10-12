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
};

export default nextConfig;
