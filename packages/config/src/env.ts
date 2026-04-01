import { z } from "zod";

const optionalString = z.string().min(1).optional();
const logLevelSchema = z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

function booleanFlag(defaultValue: boolean) {
  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.trim().toLowerCase();
      }

      return value;
    },
    z
      .enum(["true", "false", "1", "0", "yes", "no", "on", "off"])
      .optional()
      .transform((value) => {
        if (!value) {
          return defaultValue;
        }

        return ["true", "1", "yes", "on"].includes(value);
      })
  );
}

const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: optionalString,
  LOG_LEVEL: logLevelSchema.default("info"),
  API_TRUST_PROXY: booleanFlag(false),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  API_RATE_LIMIT_WINDOW: z.string().min(1).default("1 minute"),
  SESSION_COOKIE_NAME: z.string().min(1).default("ca_session"),
  SESSION_COOKIE_DOMAIN: optionalString,
  SESSION_COOKIE_SECURE: booleanFlag(false),
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().positive().default(5),
  SESSION_RECENT_SIGN_IN_MINUTES: z.coerce.number().int().positive().default(5),
  CSRF_COOKIE_NAME: z.string().min(1).default("ca_csrf"),
  CSRF_TOKEN_MAX_AGE_MINUTES: z.coerce.number().int().positive().default(60),
  FIREBASE_PROJECT_ID: optionalString,
  FIREBASE_CLIENT_EMAIL: optionalString,
  FIREBASE_PRIVATE_KEY: optionalString,
  FIREBASE_CHECK_REVOKED_SESSIONS: booleanFlag(true),
  BUNNY_STREAM_LIBRARY_ID: optionalString,
  BUNNY_STREAM_API_KEY: optionalString,
  BUNNY_STREAM_PULL_ZONE: optionalString,
  BUNNY_STREAM_CDN_HOSTNAME: optionalString
});

const workerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  LOG_LEVEL: logLevelSchema.default("info"),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  BUNNY_STREAM_LIBRARY_ID: optionalString,
  BUNNY_STREAM_API_KEY: optionalString,
  BUNNY_STREAM_PULL_ZONE: optionalString,
  BUNNY_STREAM_CDN_HOSTNAME: optionalString
});

const publicWebEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_FIREBASE_API_KEY: optionalString,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalString,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_APP_ID: optionalString
});

const publicMobileEnvSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000"),
  EXPO_PUBLIC_FIREBASE_API_KEY: optionalString,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalString,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: optionalString,
  EXPO_PUBLIC_FIREBASE_APP_ID: optionalString
});

export type ApiEnv = ReturnType<typeof loadApiEnv>;
export type WorkerEnv = ReturnType<typeof loadWorkerEnv>;
export type PublicWebEnv = ReturnType<typeof readPublicWebEnv>;
export type PublicMobileEnv = ReturnType<typeof readPublicMobileEnv>;

function normalizePrivateKey(value?: string) {
  return value?.replace(/\\n/g, "\n");
}

export function loadApiEnv(env: NodeJS.ProcessEnv = process.env) {
  const parsed = apiEnvSchema.parse(env);

  return {
    ...parsed,
    FIREBASE_PRIVATE_KEY: normalizePrivateKey(parsed.FIREBASE_PRIVATE_KEY),
    SESSION_COOKIE_SECURE: parsed.SESSION_COOKIE_SECURE || parsed.NODE_ENV === "production"
  };
}

export function loadWorkerEnv(env: NodeJS.ProcessEnv = process.env) {
  return workerEnvSchema.parse(env);
}

export function readPublicWebEnv(env: NodeJS.ProcessEnv = process.env) {
  return publicWebEnvSchema.parse(env);
}

export function readPublicMobileEnv(env: NodeJS.ProcessEnv = process.env) {
  return publicMobileEnvSchema.parse(env);
}
