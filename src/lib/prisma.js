import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient for Serverless environments (Vercel)
// Prevents connection pool exhaustion by reusing the client instance
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: 'pretty',
  });
};

// Check if we need to force a refresh (e.g. models missing in dev)
if (process.env.NODE_ENV === "development" && globalForPrisma.prisma) {
  if (!globalForPrisma.prisma.pushSubscription) {
    console.log('🔄 Prisma client missing pushSubscription. Re-initializing...');
    globalForPrisma.prisma = createPrismaClient();
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// DB Ping test for performance tracking
export async function pingDB() {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const end = performance.now();
    return (end - start).toFixed(2);
  } catch (err) {
    return "ERROR";
  }
}

export default prisma;