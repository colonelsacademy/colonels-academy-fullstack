import type { PaymentAttemptStatus, PrismaClient } from "@prisma/client";

/**
 * Parameters for creating a payment attempt
 */
export interface CreatePaymentAttemptParams {
  userId: string;
  amount: number;
  provider: string;
  orderId?: string;
  chapterPurchaseId?: string;
  bundlePurchaseId?: string;
}

/**
 * Parameters for updating a payment attempt
 */
export interface UpdatePaymentAttemptParams {
  attemptId: string;
  status: "SUCCESS" | "FAILED";
  transactionId?: string | undefined;
  errorCode?: string | undefined;
  errorMessage?: string | undefined;
}

/**
 * Query parameters for payment attempts
 */
export interface PaymentAttemptsQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  status?: "INITIATED" | "SUCCESS" | "FAILED" | undefined;
  provider?: string | undefined;
  userId?: string | undefined;
  orderId?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

/**
 * Payment attempt entry with user details
 */
export interface PaymentAttemptEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  provider: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  transactionId: string | null;
  attemptedAt: string;
  orderType: "order" | "chapter" | "bundle" | null;
  orderId: string | null;
}

/**
 * Paginated payment attempts response
 */
export interface PaymentAttemptsResponse {
  attempts: PaymentAttemptEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Query parameters for payment statistics
 */
export interface PaymentStatsQueryParams {
  startDate?: string | undefined;
  endDate?: string | undefined;
  provider?: string | undefined;
}

/**
 * Payment statistics response
 */
export interface PaymentStatsResponse {
  totalAttempts: number;
  byStatus: {
    initiated: number;
    success: number;
    failed: number;
  };
  byProvider: Record<
    string,
    {
      total: number;
      success: number;
      failed: number;
      successRate: number;
    }
  >;
  successRate: number;
  totalSuccessAmount: number;
  totalFailedAmount: number;
  commonErrors: Array<{
    errorCode: string;
    count: number;
    percentage: number;
  }>;
  timeline: Array<{
    date: string;
    success: number;
    failed: number;
  }>;
}

/**
 * Service for tracking payment attempts
 */
export class PaymentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new payment attempt record
   * @param params - Payment attempt parameters
   * @returns Created payment attempt
   */
  async createAttempt(params: CreatePaymentAttemptParams) {
    return await this.prisma.paymentAttempt.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        provider: params.provider,
        orderId: params.orderId ?? null,
        chapterPurchaseId: params.chapterPurchaseId ?? null,
        bundlePurchaseId: params.bundlePurchaseId ?? null,
        status: "INITIATED"
      }
    });
  }

  /**
   * Update a payment attempt with success or failure details
   * @param params - Update parameters
   * @returns Updated payment attempt
   */
  async updateAttempt(params: UpdatePaymentAttemptParams) {
    const updateData: {
      status: PaymentAttemptStatus;
      transactionId?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
    } = {
      status: params.status
    };

    if (params.status === "SUCCESS") {
      updateData.transactionId = params.transactionId ?? null;
    } else if (params.status === "FAILED") {
      updateData.errorCode = params.errorCode ?? null;
      updateData.errorMessage = params.errorMessage ?? null;
    }

    return await this.prisma.paymentAttempt.update({
      where: {
        id: params.attemptId
      },
      data: updateData
    });
  }

  /**
   * Query payment attempts with filtering and pagination
   * @param filters - Query filters
   * @returns Paginated payment attempts
   */
  async queryAttempts(filters: PaymentAttemptsQueryParams): Promise<PaymentAttemptsResponse> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.provider) {
      where.provider = filters.provider;
    }

    const userId = filters.userId;
    const orderId = filters.orderId;
    const startDate = filters.startDate;
    const endDate = filters.endDate;

    if (userId) {
      where.userId = userId;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (startDate || endDate) {
      where.attemptedAt = {};
      if (startDate) {
        (where.attemptedAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.attemptedAt as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // Execute queries
    const [attempts, total] = await Promise.all([
      this.prisma.paymentAttempt.findMany({
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
          attemptedAt: "desc"
        },
        skip,
        take: limit
      }),
      this.prisma.paymentAttempt.count({ where })
    ]);

    // Format response
    const formattedAttempts: PaymentAttemptEntry[] = attempts.map((attempt) => {
      let orderType: "order" | "chapter" | "bundle" | null = null;
      let orderId: string | null = null;

      if (attempt.orderId) {
        orderType = "order";
        orderId = attempt.orderId;
      } else if (attempt.chapterPurchaseId) {
        orderType = "chapter";
        orderId = attempt.chapterPurchaseId;
      } else if (attempt.bundlePurchaseId) {
        orderType = "bundle";
        orderId = attempt.bundlePurchaseId;
      }

      return {
        id: attempt.id,
        userId: attempt.userId,
        userName: attempt.user.displayName ?? "Unknown",
        userEmail: attempt.user.email ?? "Unknown",
        amount: attempt.amount,
        provider: attempt.provider,
        status: attempt.status,
        errorCode: attempt.errorCode,
        errorMessage: attempt.errorMessage,
        transactionId: attempt.transactionId,
        attemptedAt: attempt.attemptedAt.toISOString(),
        orderType,
        orderId
      };
    });

    return {
      attempts: formattedAttempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get payment statistics
   * @param filters - Optional filters
   * @returns Payment statistics
   */
  async getStats(filters?: PaymentStatsQueryParams): Promise<PaymentStatsResponse> {
    // Build where clause
    const where: Record<string, unknown> = {};

    const provider = filters?.provider;
    const startDate = filters?.startDate;
    const endDate = filters?.endDate;

    if (provider) {
      where.provider = provider;
    }

    if (startDate || endDate) {
      where.attemptedAt = {};
      if (startDate) {
        (where.attemptedAt as Record<string, unknown>).gte = new Date(startDate!);
      }
      if (endDate) {
        (where.attemptedAt as Record<string, unknown>).lte = new Date(endDate!);
      }
    }

    // Get all attempts for aggregation
    const attempts = await this.prisma.paymentAttempt.findMany({
      where,
      orderBy: {
        attemptedAt: "asc"
      }
    });

    const totalAttempts = attempts.length;

    // Count by status
    const byStatus = {
      initiated: 0,
      success: 0,
      failed: 0
    };

    for (const attempt of attempts) {
      if (attempt.status === "INITIATED") byStatus.initiated++;
      else if (attempt.status === "SUCCESS") byStatus.success++;
      else if (attempt.status === "FAILED") byStatus.failed++;
    }

    // Calculate success rate
    const successRate =
      totalAttempts > 0 ? Math.round((byStatus.success / totalAttempts) * 100 * 10) / 10 : 0;

    // Calculate total amounts
    let totalSuccessAmount = 0;
    let totalFailedAmount = 0;

    for (const attempt of attempts) {
      if (attempt.status === "SUCCESS") {
        totalSuccessAmount += attempt.amount;
      } else if (attempt.status === "FAILED") {
        totalFailedAmount += attempt.amount;
      }
    }

    // Aggregate by provider
    const providerMap = new Map<string, { total: number; success: number; failed: number }>();

    for (const attempt of attempts) {
      if (!providerMap.has(attempt.provider)) {
        providerMap.set(attempt.provider, { total: 0, success: 0, failed: 0 });
      }

      const providerData = providerMap.get(attempt.provider)!;
      providerData.total++;

      if (attempt.status === "SUCCESS") providerData.success++;
      else if (attempt.status === "FAILED") providerData.failed++;
    }

    const byProvider: Record<
      string,
      { total: number; success: number; failed: number; successRate: number }
    > = {};

    for (const [provider, data] of providerMap.entries()) {
      byProvider[provider] = {
        ...data,
        successRate: data.total > 0 ? Math.round((data.success / data.total) * 100 * 10) / 10 : 0
      };
    }

    // Aggregate common errors
    const errorMap = new Map<string, number>();

    for (const attempt of attempts) {
      if (attempt.status === "FAILED" && attempt.errorCode) {
        errorMap.set(attempt.errorCode, (errorMap.get(attempt.errorCode) ?? 0) + 1);
      }
    }

    const commonErrors = Array.from(errorMap.entries())
      .map(([errorCode, count]) => ({
        errorCode,
        count,
        percentage: Math.round((count / byStatus.failed) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 errors

    // Create timeline (group by date)
    const timelineMap = new Map<string, { success: number; failed: number }>();

    for (const attempt of attempts) {
      const date = attempt.attemptedAt.toISOString().slice(0, 10);

      if (!timelineMap.has(date)) {
        timelineMap.set(date, { success: 0, failed: 0 });
      }

      const dayData = timelineMap.get(date)!;

      if (attempt.status === "SUCCESS") dayData.success++;
      else if (attempt.status === "FAILED") dayData.failed++;
    }

    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalAttempts,
      byStatus,
      byProvider,
      successRate,
      totalSuccessAmount,
      totalFailedAmount,
      commonErrors,
      timeline
    };
  }
}
