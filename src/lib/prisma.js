import { PrismaClient } from "./prisma-client";

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
  // Check for presence of newer models and fields to force reload if client is stale
  const isStale = !globalForPrisma.prisma.pushSubscription || 
                  !globalForPrisma.prisma.certificateTemplate; 
  
  // A better way to check if fields exist in the client is to look at the dMMF or just try a dummy check
  // But for now, checking for model presence is usually enough for most stale client issues.
  if (isStale) {
    console.log('🔄 Prisma client might be stale. Re-initializing...');
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