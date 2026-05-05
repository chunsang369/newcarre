import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function withRetry<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await fn(prisma);
  } catch (error: any) {
    if (
      error.message && 
      (error.message.includes("closed") || error.message.includes("P1017") || error.message.includes("connection"))
    ) {
      console.warn("Prisma connection was closed. Recreating client instance and retrying...");
      const freshClient = new PrismaClient();
      globalForPrisma.prisma = freshClient;
      try {
        return await fn(freshClient);
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
}
