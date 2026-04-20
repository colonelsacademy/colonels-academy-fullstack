import { loadApiEnv } from "@colonels-academy/config";

import { buildApp } from "./app";
import { listCourses, listInstructors } from "./modules/catalog/service";

async function warmCache(app: ReturnType<typeof buildApp>) {
  app.log.info("🔥 Warming cache...");

  try {
    // Pre-load courses into cache
    await listCourses(app.prisma, app.cache, app.log);

    // Pre-load instructors into cache
    await listInstructors(app.prisma, app.cache, app.log);

    app.log.info("✅ Cache warmed successfully");
  } catch (error) {
    app.log.warn({ err: error }, "⚠️ Cache warming failed (non-fatal)");
  }
}

async function start() {
  const env = loadApiEnv();
  const app = buildApp();

  const close = async (signal: string) => {
    app.log.info({ signal }, "Shutting down API.");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void close("SIGINT");
  });

  process.on("SIGTERM", () => {
    void close("SIGTERM");
  });

  try {
    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT
    });

    // Warm cache after server starts
    await warmCache(app);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
