/**
 * Vitest Setup File
 * Runs before all tests
 */

import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
  // Ensure test environment variables are set
  if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_TEST) {
    throw new Error("DATABASE_URL or DATABASE_URL_TEST must be set for testing");
  }
});

afterAll(async () => {
  // Global cleanup if needed
});
