import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const datasourceUrl = process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("DATABASE_URL");
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
