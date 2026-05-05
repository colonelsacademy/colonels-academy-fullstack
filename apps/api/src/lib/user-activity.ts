import type { PrismaClient } from "@prisma/client";

/**
 * Query parameters for user activity statistics
 */
export interface UserActivityQueryParams {
  startDate?: string | undefined;
  endDate?: string | undefined;
  limit?: number | undefined;
}

/**
 * User activity entry
 */
export interface UserActivityEntry {
  id: string;
  displayName: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
  enrollmentCount: number;
  orderCount: number;
  isActive: boolean;
}

/**
 * User activity statistics response
 */
export interface UserActivityStatsResponse {
  totalUsers: number;
  activeUsers: number; // Users who logged in within last 30 days
  newUsers: number; // Users created within the date range
  usersByRole: Record<string, number>;
  recentActivity: UserActivityEntry[];
  dailySignups: Array<{
    date: string;
    count: number;
  }>;
  topActiveUsers: Array<{
    userId: string;
    displayName: string;
    email: string;
    enrollmentCount: number;
    orderCount: number;
    lastActivity: string;
  }>;
}

/**
 * Service for tracking user activity and site visits
 */
export class UserActivityService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get user activity statistics
   * @param filters - Optional filters
   * @returns User activity statistics
   */
  async getStats(filters?: UserActivityQueryParams): Promise<UserActivityStatsResponse> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Build date filters
    const startDateString = filters?.startDate;
    const endDateString = filters?.endDate;
    const startDate = startDateString ? new Date(startDateString) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = endDateString ? new Date(endDateString) : now;

    // Get all users with their activity data
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalUsers = users.length;

    // Count users by role
    const usersByRole: Record<string, number> = {};
    for (const user of users) {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    }

    // Count new users in date range
    const newUsers = users.filter(user => 
      user.createdAt >= startDate && user.createdAt <= endDate
    ).length;

    // For "active users", we'll use users who have recent activity (enrollments, orders, or recent creation)
    // Since we don't have login tracking yet, we'll use updatedAt as a proxy for activity
    const activeUsers = users.filter(user => 
      user.updatedAt >= thirtyDaysAgo || 
      user._count.enrollments > 0 || 
      user._count.orders > 0
    ).length;

    // Recent activity (last 50 users with activity)
    const recentActivity: UserActivityEntry[] = users
      .slice(0, 50)
      .map(user => ({
        id: user.id,
        displayName: user.displayName || 'Unknown',
        email: user.email || 'Unknown',
        role: user.role,
        lastLoginAt: user.updatedAt.toISOString(), // Using updatedAt as proxy
        createdAt: user.createdAt.toISOString(),
        enrollmentCount: user._count.enrollments,
        orderCount: user._count.orders,
        isActive: user.updatedAt >= thirtyDaysAgo || user._count.enrollments > 0 || user._count.orders > 0
      }));

    // Daily signups for the last 30 days
    const dailySignupsMap = new Map<string, number>();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (const user of users) {
      if (user.createdAt >= last30Days) {
        const dateKey = user.createdAt.toISOString().slice(0, 10);
        dailySignupsMap.set(dateKey, (dailySignupsMap.get(dateKey) || 0) + 1);
      }
    }

    const dailySignups = Array.from(dailySignupsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top active users (by enrollments + orders)
    const topActiveUsers = users
      .filter(user => user._count.enrollments > 0 || user._count.orders > 0)
      .sort((a, b) => (b._count.enrollments + b._count.orders) - (a._count.enrollments + a._count.orders))
      .slice(0, 10)
      .map(user => ({
        userId: user.id,
        displayName: user.displayName || 'Unknown',
        email: user.email || 'Unknown',
        enrollmentCount: user._count.enrollments,
        orderCount: user._count.orders,
        lastActivity: user.updatedAt.toISOString()
      }));

    return {
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      recentActivity,
      dailySignups,
      topActiveUsers
    };
  }

  /**
   * Get recent user registrations
   * @param limit - Number of recent users to return
   * @returns Recent user registrations
   */
  async getRecentRegistrations(limit: number = 20): Promise<UserActivityEntry[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return users.map(user => ({
      id: user.id,
      displayName: user.displayName || 'Unknown',
      email: user.email || 'Unknown',
      role: user.role,
      lastLoginAt: user.updatedAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      enrollmentCount: user._count.enrollments,
      orderCount: user._count.orders,
      isActive: true // Recent registrations are considered active
    }));
  }
}