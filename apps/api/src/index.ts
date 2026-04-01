import { loadApiEnv } from "@colonels-academy/config";

import { buildApp } from "./app";

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
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
