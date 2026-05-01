import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

import { loadApiEnv } from "@colonels-academy/config";
import type {
  HealthStatusResponse,
  LivenessStatusResponse,
  QueueDepthSnapshot
} from "@colonels-academy/contracts";

async function readQueueDepths(
  queues: import("../../plugins/infrastructure").QueueRegistry | null
): Promise<Record<string, QueueDepthSnapshot> | null> {
  if (!queues) {
    return null;
  }

  const entries = await Promise.all(
    Object.entries(queues).map(async ([queueName, queue]) => {
      const counts = await queue.getJobCounts("wait", "active", "delayed", "completed", "failed");
      const snapshot: QueueDepthSnapshot = {
        waiting: counts.wait ?? 0,
        active: counts.active ?? 0,
        delayed: counts.delayed ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0
      };

      return [queueName, snapshot] as const;
    })
  );

  return Object.fromEntries(entries);
}

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /v1/health/live ────────────────────────────────────────────────────
  // Liveness probe - always returns 200 if server is running
  // Used by Railway/K8s to know if container should be restarted
  fastify.get("/live", async (request) => {
    const response: LivenessStatusResponse = {
      status: "ok",
      requestId: request.id,
      time: new Date().toISOString()
    };

    return response;
  });

  // ── GET /v1/health & /v1/health/ready ──────────────────────────────────────
  // Readiness probe - returns 200 if app can serve traffic
  // Returns 503 if database or redis is down
  // Used by Railway/K8s to know if traffic should be routed to this instance
  const readinessHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const env = loadApiEnv();
    let database: HealthStatusResponse["services"]["database"] = "connected";
    let redis: HealthStatusResponse["services"]["redis"] = fastify.redis
      ? "configured"
      : "disabled";
    let queues: HealthStatusResponse["services"]["queues"] = null;

    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "unavailable";
    }

    if (fastify.redis) {
      try {
        await fastify.redis.ping();
      } catch {
        redis = "unavailable";
      }
    }

    if (fastify.queues && redis !== "unavailable") {
      try {
        queues = await readQueueDepths(fastify.queues);
      } catch {
        redis = "unavailable";
        queues = null;
      }
    }

    const status: HealthStatusResponse["status"] =
      database === "connected" && redis !== "unavailable" ? "ok" : "degraded";

    const response: HealthStatusResponse = {
      status,
      requestId: request.id,
      services: {
        database,
        redis,
        queues,
        firebaseAuth: env.FIREBASE_PROJECT_ID ? "configured" : "pending",
        bunnyStream: fastify.bunny.libraryId ? "configured" : "pending"
      },
      policy:
        "WebSockets remain opt-in. Readiness requires the database and configured infrastructure to respond."
    };

    void reply.status(status === "ok" ? 200 : 503);

    return response;
  };

  fastify.get("/", readinessHandler);
  fastify.get("/ready", readinessHandler);
};

export default healthRoutes;
