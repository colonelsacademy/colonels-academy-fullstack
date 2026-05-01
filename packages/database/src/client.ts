import { PrismaClient } from "@prisma/client";

const globalForDatabase = globalThis as typeof globalThis & {
  __colonelsAcademyPrisma?: PrismaClient;
};

export function createDatabaseClient() {
  return new PrismaClient();
}

export const db = globalForDatabase.__colonelsAcademyPrisma ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__colonelsAcademyPrisma = db;
}

export type DatabaseClient = PrismaClient;
