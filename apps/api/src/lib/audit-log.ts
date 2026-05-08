import type { PrismaClient } from "@prisma/client";

/**
 * Parameters for creating an audit log entry
 */
export interface CreateAuditLogParams {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

/**
 * Query parameters for filtering audit logs
 */
export interface AuditLogQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  userId?: string | undefined;
  resourceType?: string | undefined;
  resourceId?: string | undefined;
  action?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

/**
 * Audit log entry with user details
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

/**
 * Paginated audit log response
 */
export interface AuditLogResponse {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Audit log statistics
 */
export interface AuditLogStatsResponse {
  totalEntries: number;
  byAction: Record<string, number>;
  byResourceType: Record<string, number>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

/**
 * Service for managing audit logs
 */
export class AuditLogService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new audit log entry
   * @param params - Audit log parameters
   */
  async createLog(params: CreateAuditLogParams): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        changes: JSON.parse(JSON.stringify(params.changes)),
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null
      }
    });
  }

  /**
   * Query audit logs with filtering and pagination
   * @param filters - Query filters
   * @returns Paginated audit log entries
   */
  async queryLogs(filters: AuditLogQueryParams): Promise<AuditLogResponse> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters.resourceId) {
      where.resourceId = filters.resourceId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate);
      }
    }

    // Execute queries
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              displayName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      this.prisma.auditLog.count({ where })
    ]);

    // Format response
    const formattedLogs: AuditLogEntry[] = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user.displayName ?? "Unknown",
      userEmail: log.user.email ?? "Unknown",
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      changes: log.changes as {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
      },
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString()
    }));

    return {
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get audit log statistics
   * @param filters - Optional date range filters
   * @returns Audit log statistics
   */
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogStatsResponse> {
    // Build where clause for date filtering
    const where: Record<string, unknown> = {};
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, unknown>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, unknown>).lte = filters.endDate;
      }
    }

    // Get total count
    const totalEntries = await this.prisma.auditLog.count({ where });

    // Get all logs for aggregation (this could be optimized with raw SQL for large datasets)
    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Aggregate by action
    const byAction: Record<string, number> = {};
    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] ?? 0) + 1;
    }

    // Aggregate by resource type
    const byResourceType: Record<string, number> = {};
    for (const log of logs) {
      byResourceType[log.resourceType] = (byResourceType[log.resourceType] ?? 0) + 1;
    }

    // Aggregate by user
    const userCounts: Record<string, { name: string; count: number }> = {};
    for (const log of logs) {
      if (!userCounts[log.userId]) {
        userCounts[log.userId] = {
          name: log.user?.displayName ?? "Unknown",
          count: 0
        };
      }
      userCounts[log.userId]!.count++;
    }

    const byUser = Object.entries(userCounts)
      .map(([userId, data]) => ({
        userId,
        userName: data?.name ?? "Unknown",
        count: data?.count ?? 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 users

    // Get date range
    const dateRange = {
      earliest: logs.length > 0 ? (logs[0]?.createdAt.toISOString() ?? null) : null,
      latest: logs.length > 0 ? (logs[logs.length - 1]?.createdAt.toISOString() ?? null) : null
    };

    return {
      totalEntries,
      byAction,
      byResourceType,
      byUser,
      dateRange
    };
  }
}
