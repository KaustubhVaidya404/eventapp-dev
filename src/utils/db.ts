// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
//
// export const prisma = globalForPrisma.prisma || new PrismaClient();
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// utils/db.ts
import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

// Ensure Prisma is instantiated only once in dev
export const prisma =
    global.prisma ||
    new PrismaClient({
        // log: ['query', 'info', 'warn', 'error'], // Add logging if needed
    });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
