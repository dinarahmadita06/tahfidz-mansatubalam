import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient for Serverless environments (Vercel)
// Prevents connection pool exhaustion by reusing the client instance
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: 'pretty',
  });

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