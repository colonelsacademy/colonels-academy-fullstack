import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify from "fastify";

import { loadApiEnv } from "@colonels-academy/config";

import adminRoutes from "./modules/admin/routes";
import authRoutes from "./modules/auth/routes";
import catalogRoutes from "./modules/catalog/routes";
import dsRoutes from "./modules/ds/routes";
import healthRoutes from "./modules/health/routes";
import learningRoutes from "./modules/learning/routes";
import mediaRoutes from "./modules/media/routes";
import mockTestRoutes from "./modules/mock-test/routes";
import ordersRoutes from "./modules/orders/routes";
import authPlugin from "./plugins/auth";
import infrastructurePlugin from "./plugins/infrastructure";
import prismaPlugin from "./plugins/prisma";
import sentryPlugin from "./plugins/sentry";

export function buildApp() {
  const env = loadApiEnv();
  const app = Fastify({
    trustProxy: env.API_TRUST_PROXY,
    requestIdHeader: "x-request-id",
    logger: {
      level: env.LOG_LEVEL,
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers['x-csrf-token']",
          "res.headers['set-cookie']"
        ],
        censor: "[redacted]"
      }
    }
  });

  void app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true
  });

  void app.register(cookie);
  void app.register(helmet);
  void app.register(rateLimit, {
    global: true,
    max: env.API_RATE_LIMIT_MAX,
    timeWindow: env.API_RATE_LIMIT_WINDOW
  });
  void app.register(sensible);
  void app.register(sentryPlugin);
  void app.register(prismaPlugin);
  void app.register(infrastructurePlugin);
  void app.register(authPlugin);

  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  void app.register(authRoutes, {
    prefix: "/v1/auth"
  });
  void app.register(healthRoutes, {
    prefix: "/v1/health"
  });
  void app.register(catalogRoutes, {
    prefix: "/v1/catalog"
  });
  void app.register(dsRoutes, {
    prefix: "/v1/ds"
  });
  void app.register(learningRoutes, {
    prefix: "/v1/learning"
  });
  void app.register(mediaRoutes, {
    prefix: "/v1/media"
  });
  void app.register(adminRoutes, {
    prefix: "/v1/admin"
  });
  void app.register(ordersRoutes, {
    prefix: "/v1/orders"
  });
  void app.register(mockTestRoutes, {
    prefix: "/v1/mock-test"
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    const statusCode =
      typeof error === "object" &&
      error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    void reply.status(statusCode).send({
      message,
      requestId: request.id,
      statusCode
    });
  });

  return app;
}
