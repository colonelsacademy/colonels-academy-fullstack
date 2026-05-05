import type { FastifyPluginAsync } from "fastify";

import { AuditLogService } from "../../lib/audit-log";

const auditLogRoutes: FastifyPluginAsync = async (fastify) => {
  const auditLogService = new AuditLogService(fastify.prisma);
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

  // ── GET /v1/admin/audit-logs ───────────────────────────────────────────────
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      userId?: string;
      resourceType?: string;
      resourceId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    };
  }>("/", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const {
      page: pageStr,
      limit: limitStr,
      userId,
      resourceType,
      resourceId,
      action,
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

    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return reply.badRequest("Invalid startDate parameter. Must be a valid ISO 8601 date.");
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return reply.badRequest("Invalid endDate parameter. Must be a valid ISO 8601 date.");
    }

    try {
      const result = await auditLogService.queryLogs({
        page,
        limit,
        userId,
        resourceType,
        resourceId,
        action,
        startDate,
        endDate
      });

      return result;
    } catch (error) {
      fastify.log.error({ error, query: request.query }, "Failed to query audit logs");
      return reply.internalServerError("Failed to retrieve audit logs");
    }
  });

  // ── GET /v1/admin/audit-logs/stats ─────────────────────────────────────────
  fastify.get<{
    Querystring: {
      startDate?: string;
      endDate?: string;
    };
  }>("/stats", async (request, reply) => {
    const user = await requireAdmin(request, reply);
    if (!user) return;

    const { startDate, endDate } = request.query;

    // Validate date parameters
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return reply.badRequest("Invalid startDate parameter. Must be a valid ISO 8601 date.");
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return reply.badRequest("Invalid endDate parameter. Must be a valid ISO 8601 date.");
    }

    try {
      // Build cache key based on query parameters
      const cacheKey = `audit-logs:stats:${startDate || "all"}:${endDate || "all"}`;
      
      // Try to get from cache
      const cached = await fastify.cache.get(cacheKey);
      if (cached) {
        fastify.log.debug({ cacheKey }, "Audit log stats cache hit");
        return cached;
      }

      const filters = {
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {})
      };

      const stats = await auditLogService.getStats(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      // Cache the result for 5 minutes
      await fastify.cache.set(cacheKey, stats, STATS_CACHE_TTL);

      return stats;
    } catch (error) {
      fastify.log.error({ error, query: request.query }, "Failed to get audit log stats");
      return reply.internalServerError("Failed to retrieve audit log statistics");
    }
  });
};

export default auditLogRoutes;
