import type { FastifyPluginAsync } from "fastify";

import { PaymentService } from "../../lib/payment-tracking";

const paymentAnalyticsRoutes: FastifyPluginAsync = async (fastify) => {
  const paymentService = new PaymentService(fastify.prisma);
  const STATS_CACHE_TTL = 300; // 5 minutes

  // ── Auth guard helper ──────────────────────────────────────────────────────
  async function requireAdmin(
    request: Parameters<typeof fastify.authenticateRequest>[0],
    reply: { forbidden: (msg: string) => unknown }
  ) {
    const { user } = await fastify.authenticateRequest(request);
    if (!user) return reply.forbidden("Admin access required.");

    // Always check DB role - Firebase token claims may not have the role
    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      select: { role: true }
    });

    if (!dbUser || dbUser.role.toLowerCase() !== "admin") {
      return reply.forbidden("Admin access required.");
    }

    return user;
  }

  // ── GET /v1/admin/payments/attempts ────────────────────────────────────────
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      status?: "INITIATED" | "SUCCESS" | "FAILED";
      provider?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    };
  }>("/attempts", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const {
      page: pageStr,
      limit: limitStr,
      status,
      provider,
      userId,
      startDate,
      endDate
    } = request.query;

    // Parse and validate query parameters
    const page = pageStr ? Number.parseInt(pageStr, 10) : undefined;
    const limit = limitStr ? Number.parseInt(limitStr, 10) : undefined;

    if (page !== undefined && (Number.isNaN(page) || page < 1)) {
      return reply.badRequest("Invalid page parameter. Must be a positive integer.");
    }

    if (limit !== undefined && (Number.isNaN(limit) || limit < 1 || limit > 100)) {
      return reply.badRequest("Invalid limit parameter. Must be between 1 and 100.");
    }

    if (status && !["INITIATED", "SUCCESS", "FAILED"].includes(status)) {
      return reply.badRequest("Invalid status parameter. Must be INITIATED, SUCCESS, or FAILED.");
    }

    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return reply.badRequest("Invalid startDate parameter. Must be a valid ISO 8601 date.");
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return reply.badRequest("Invalid endDate parameter. Must be a valid ISO 8601 date.");
    }

    try {
      const result = await paymentService.queryAttempts({
        page,
        limit,
        status,
        provider,
        userId,
        startDate,
        endDate
      });

      return result;
    } catch (error) {
      fastify.log.error({ error, query: request.query }, "Failed to query payment attempts");
      return reply.internalServerError("Failed to retrieve payment attempts");
    }
  });

  // ── GET /v1/admin/payments/stats ───────────────────────────────────────────
  fastify.get<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      provider?: string;
    };
  }>("/stats", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const { startDate, endDate, provider } = request.query;

    // Validate date parameters
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return reply.badRequest("Invalid startDate parameter. Must be a valid ISO 8601 date.");
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return reply.badRequest("Invalid endDate parameter. Must be a valid ISO 8601 date.");
    }

    try {
      // Build cache key based on query parameters
      const cacheKey = `payments:stats:${provider || "all"}:${startDate || "all"}:${endDate || "all"}`;
      
      // Try to get from cache
      const cached = await fastify.cache.get(cacheKey);
      if (cached) {
        fastify.log.debug({ cacheKey }, "Payment stats cache hit");
        return cached;
      }

      const stats = await paymentService.getStats({
        startDate,
        endDate,
        provider
      });

      // Cache the result for 5 minutes
      await fastify.cache.set(cacheKey, stats, STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      fastify.log.error({ error, query: request.query }, "Failed to get payment stats");
      return reply.internalServerError("Failed to retrieve payment statistics");
    }
  });
};

export default paymentAnalyticsRoutes;
