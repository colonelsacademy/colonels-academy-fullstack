import type { FastifyPluginAsync } from "fastify";

import { UserActivityService } from "../../lib/user-activity";

const userActivityRoutes: FastifyPluginAsync = async (fastify) => {
  const userActivityService = new UserActivityService(fastify.prisma);
  const STATS_CACHE_TTL = 300; // 5 minutes

  // ── Auth guard helper ──────────────────────────────────────────────────────
  async function requireAdmin(
    request: Parameters<typeof fastify.authenticateRequest>[0],
    reply: { forbidden: (msg: string) => unknown }
  ) {
    const { user } = await fastify.authenticateRequest(request);
    if (!user) return reply.forbidden("Admin access required.");

    // Always check DB role
    const dbUser = await fastify.prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      select: { role: true }
    });

    if (!dbUser || dbUser.role.toLowerCase() !== "admin") {
      return reply.forbidden("Admin access required.");
    }

    return user;
  }

  // ── GET /v1/admin/user-activity/stats ──────────────────────────────────────
  fastify.get<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };
  }>("/admin/user-activity/stats", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const { startDate, endDate, limit: limitStr } = request.query;

    // Validate date parameters
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return reply.badRequest("Invalid startDate parameter. Must be a valid ISO 8601 date.");
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return reply.badRequest("Invalid endDate parameter. Must be a valid ISO 8601 date.");
    }

    const limit = limitStr ? Number.parseInt(limitStr, 10) : undefined;
    if (limit !== undefined && (Number.isNaN(limit) || limit < 1 || limit > 100)) {
      return reply.badRequest("Invalid limit parameter. Must be between 1 and 100.");
    }

    try {
      // Build cache key based on query parameters
      const cacheKey = `user-activity:stats:${startDate || "all"}:${endDate || "all"}:${limit || "default"}`;
      
      // Try to get from cache
      const cached = await fastify.cache.get(cacheKey);
      if (cached) {
        fastify.log.debug({ cacheKey }, "User activity stats cache hit");
        return cached;
      }

      const stats = await userActivityService.getStats({
        startDate,
        endDate,
        limit
      });

      // Cache the result for 5 minutes
      await fastify.cache.set(cacheKey, stats, STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      fastify.log.error({ error, query: request.query }, "Failed to get user activity stats");
      return reply.internalServerError("Failed to retrieve user activity statistics");
    }
  });

  // ── GET /v1/admin/user-activity/recent ─────────────────────────────────────
  fastify.get<{
    Querystring: {
      limit?: string;
    };
  }>("/admin/user-activity/recent", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const { limit: limitStr } = request.query;

    const limit = limitStr ? Number.parseInt(limitStr, 10) : 20;
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return reply.badRequest("Invalid limit parameter. Must be between 1 and 100.");
    }

    try {
      // Build cache key
      const cacheKey = `user-activity:recent:${limit}`;
      
      // Try to get from cache
      const cached = await fastify.cache.get(cacheKey);
      if (cached) {
        fastify.log.debug({ cacheKey }, "Recent user activity cache hit");
        return cached;
      }

      const recentUsers = await userActivityService.getRecentRegistrations(limit);

      // Cache the result for 2 minutes (shorter TTL for recent data)
      await fastify.cache.set(cacheKey, { users: recentUsers }, 120);

      return { users: recentUsers };
    } catch (error) {
      fastify.log.error({ error, query: request.query }, "Failed to get recent user activity");
      return reply.internalServerError("Failed to retrieve recent user activity");
    }
  });
};

export default userActivityRoutes;