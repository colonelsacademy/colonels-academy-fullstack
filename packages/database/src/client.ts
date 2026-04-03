import { createRequire } from "node:module";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

const runtimeRequire: NodeRequire =
  typeof require === "function" ? require : createRequire(__filename);

const { PrismaClient } = runtimeRequire("@prisma/client") as {
  PrismaClient: new () => PrismaClientType;
};

const globalForDatabase = globalThis as typeof globalThis & {
  __colonelsAcademyPrisma?: PrismaClientType;
};

export function createDatabaseClient() {
  return new PrismaClient();
}

export const db = globalForDatabase.__colonelsAcademyPrisma ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__colonelsAcademyPrisma = db;
}

export type DatabaseClient = PrismaClientType;
