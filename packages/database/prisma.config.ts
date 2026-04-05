import * as path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts"
  }
});
