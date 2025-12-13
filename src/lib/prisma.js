import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Konfigurasi Prisma dengan logging untuk monitoring performa
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : ['error'],
})

// Log slow queries di development (> 100ms)
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      console.log(`🐢 Slow Query (${e.duration}ms):`, e.query.substring(0, 100))
    }
  })
}

// Cache Prisma client globally in all environments to prevent connection pool exhaustion
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

export default prisma