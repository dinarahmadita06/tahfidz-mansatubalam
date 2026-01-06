import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient for Serverless environments (Vercel)
// Prevents connection pool exhaustion by reusing the client instance
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;