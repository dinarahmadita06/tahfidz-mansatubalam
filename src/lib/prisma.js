import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Konfigurasi Prisma dengan logging untuk monitoring performa
// Optimized for Vercel serverless environment
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : ['error'],
  // Optimize connection pool for serverless
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Log slow queries di development (> 50ms untuk identifikasi bottleneck lebih ketat)
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 50) {
      console.log(`🐢 Slow Query (${e.duration}ms):`, e.query.substring(0, 150))
    }
  })
}

// Cache Prisma client globally in all environments to prevent connection pool exhaustion
// Critical for serverless environments like Vercel
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

export default prisma