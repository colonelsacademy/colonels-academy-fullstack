import { PrismaClient } from "@prisma/client";

import type { CadetIqMockResultDelegate } from "./cadet-iq-mock-types";

/** Prisma client plus delegates for models that may be missing from generated types until `prisma generate` runs. */
export type DatabaseClient = PrismaClient & {
  cadetIqMockResult: CadetIqMockResultDelegate;
};

const globalForDatabase = globalThis as typeof globalThis & {
  __colonelsAcademyPrisma?: DatabaseClient;
};

export function createDatabaseClient(): DatabaseClient {
  return new PrismaClient() as DatabaseClient;
}

export const db: DatabaseClient = globalForDatabase.__colonelsAcademyPrisma ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__colonelsAcademyPrisma = db;
}
