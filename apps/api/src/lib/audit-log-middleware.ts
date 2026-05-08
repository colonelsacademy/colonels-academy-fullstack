import type { FastifyReply, FastifyRequest } from "fastify";

import type { AuditLogService } from "./audit-log";

/**
 * Options for configuring audit log hooks
 */
export interface AuditLogOptions {
  action: "CREATE" | "UPDATE" | "DELETE" | "ROLE_CHANGE";
  resourceType: string;
  getResourceId: (request: FastifyRequest) => string;
  getBeforeState?: (request: FastifyRequest) => Promise<Record<string, unknown> | null>;
  getAfterState?: (
    request: FastifyRequest,
    reply: FastifyReply
  ) => Promise<Record<string, unknown> | null>;
}

/**
 * Extract IP address from request headers or socket
 */
function extractIpAddress(request: FastifyRequest): string | undefined {
  // Check x-forwarded-for header first (for proxied requests)
  const forwardedFor = request.headers["x-forwarded-for"];
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips?.split(",")[0]?.trim() || "unknown";
  }

  // Check x-real-ip header
  const realIp = request.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fall back to socket remote address
  return request.socket.remoteAddress;
}

/**
 * Extract user agent from request headers
 */
function extractUserAgent(request: FastifyRequest): string | undefined {
  const userAgent = request.headers["user-agent"];
  return Array.isArray(userAgent) ? userAgent[0] : userAgent;
}

/**
 * Create an audit log hook for Fastify routes
 *
 * This factory function creates a Fastify onResponse hook that logs administrative
 * actions to the audit log. It captures user context, IP address, user agent, and
 * before/after state of resources.
 *
 * @param auditLogService - The audit log service instance
 * @param options - Configuration options for the audit log
 * @returns A Fastify onResponse hook function
 *
 * @example
 * ```typescript
 * fastify.post('/courses', {
 *   onResponse: createAuditLogHook(auditLogService, {
 *     action: 'CREATE',
 *     resourceType: 'Course',
 *     getResourceId: (request) => request.body.id,
 *     getAfterState: async (request, reply, fastify) => request.body
 *   })
 * }, async (request, reply) => {
 *   // Route handler
 * });
 * ```
 */
export function createAuditLogHook(auditLogService: AuditLogService, options: AuditLogOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Only log successful responses (2xx status codes)
      if (reply.statusCode < 200 || reply.statusCode >= 300) {
        return;
      }

      // Get authenticated user from request context
      const authUser = request.authUser;
      if (!authUser) {
        // No authenticated user, skip audit logging
        return;
      }

      // Get user ID from database
      const fastifyInstance = request.server as typeof request.server & {
        prisma: {
          user: {
            findUnique: (args: {
              where: { firebaseUid: string };
              select: { id: boolean };
            }) => Promise<{ id: string } | null>;
          };
        };
      };
      const dbUser = await fastifyInstance.prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true }
      });

      if (!dbUser) {
        // User not found in database, skip audit logging
        return;
      }

      // Extract resource ID
      const resourceId = options.getResourceId(request);

      // Build changes object based on action type
      const changes: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
      } = {};

      if (options.action === "CREATE") {
        // For CREATE, capture after state
        if (options.getAfterState) {
          const afterState = await options.getAfterState(request, reply);
          if (afterState) {
            changes.after = afterState;
          }
        }
      } else if (options.action === "UPDATE") {
        // For UPDATE, capture both before and after state
        if (options.getBeforeState) {
          const beforeState = await options.getBeforeState(request);
          if (beforeState) {
            changes.before = beforeState;
          }
        }
        if (options.getAfterState) {
          const afterState = await options.getAfterState(request, reply);
          if (afterState) {
            changes.after = afterState;
          }
        }
      } else if (options.action === "DELETE") {
        // For DELETE, capture before state
        if (options.getBeforeState) {
          const beforeState = await options.getBeforeState(request);
          if (beforeState) {
            changes.before = beforeState;
          }
        }
      } else if (options.action === "ROLE_CHANGE") {
        // For ROLE_CHANGE, capture both before and after state
        if (options.getBeforeState) {
          const beforeState = await options.getBeforeState(request);
          if (beforeState) {
            changes.before = beforeState;
          }
        }
        if (options.getAfterState) {
          const afterState = await options.getAfterState(request, reply);
          if (afterState) {
            changes.after = afterState;
          }
        }
      }

      // Extract IP address and user agent
      const ipAddress = extractIpAddress(request) || "unknown";
      const userAgent = extractUserAgent(request) || "unknown";

      // Create audit log entry
      await auditLogService.createLog({
        userId: dbUser.id,
        action: options.action,
        resourceType: options.resourceType,
        resourceId,
        changes,
        ipAddress,
        userAgent
      });
    } catch (error) {
      // Non-blocking error handling - log error but don't fail the request
      // Use type assertion to access log property
      const logger = (
        request as FastifyRequest & { log?: { error: (obj: unknown, msg: string) => void } }
      ).log;
      if (logger) {
        logger.error(
          {
            error,
            action: options.action,
            resourceType: options.resourceType
          },
          "Failed to create audit log entry"
        );
      }
      // Don't throw - allow the request to succeed even if audit logging fails
    }
  };
}
