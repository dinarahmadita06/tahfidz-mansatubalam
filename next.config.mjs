/** @type {import('next').NextConfig} */
const nextConfig = {
eslint: {
    ignoreDuringBuilds: true,  
  },
  // Set the workspace root to fix the lockfile warning  
  outputFileTracingRoot: 'd:/tahfidz/tahfidz',
  
  // Experimental settings to optimize imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Disable source maps in development to reduce file operations
  productionBrowserSourceMaps: false,
};

export default nextConfig;
