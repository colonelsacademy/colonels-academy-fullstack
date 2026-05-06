import { type PrismaClient, PaymentStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";

export class MockTestPurchaseService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  /**
   * Create a purchase record for a mock test
   */
  async createPurchase(data: {
    userId: string;
    mockTestId: string;
    amount: number;
    paymentMethod: string;
  }) {
    // Verify test exists and is paid
    const test = await this.prisma.mockTest.findUnique({
      where: { id: data.mockTestId }
    });

    if (!test) {
      throw new Error("Mock test not found");
    }

    if (test.accessType !== "PAID") {
      throw new Error("This test is free and does not require purchase");
    }

    // Check if user already purchased
    const existingPurchase = await this.prisma.mockTestPurchase.findUnique({
      where: {
        userId_mockTestId: {
          userId: data.userId,
          mockTestId: data.mockTestId
        }
      }
    });

    if (existingPurchase && existingPurchase.paymentStatus === "COMPLETED") {
      throw new Error("You have already purchased this test");
    }

    // Create purchase record
    return this.prisma.mockTestPurchase.create({
      data: {
        userId: data.userId,
        mockTestId: data.mockTestId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any,
        paymentStatus: "PENDING"
      }
    });
  }

  /**
   * Mark purchase as completed
   */
  async completePurchase(purchaseId: string, transactionId?: string) {
    return this.prisma.mockTestPurchase.update({
      where: { id: purchaseId },
      data: {
        paymentStatus: "COMPLETED",
        transactionId: transactionId || null,
        purchaseDate: new Date()
      }
    });
  }

  /**
   * Mark purchase as failed
   */
  async failPurchase(purchaseId: string) {
    return this.prisma.mockTestPurchase.update({
      where: { id: purchaseId },
      data: {
        paymentStatus: "FAILED"
      }
    });
  }

  /**
   * Check if user has purchased a test
   */
  async hasPurchased(userId: string, mockTestId: string): Promise<boolean> {
    const purchase = await this.prisma.mockTestPurchase.findUnique({
      where: {
        userId_mockTestId: {
          userId,
          mockTestId
        }
      }
    });

    return purchase?.paymentStatus === "COMPLETED";
  }

  /**
   * Get user's purchases
   */
  async getUserPurchases(userId: string) {
    return this.prisma.mockTestPurchase.findMany({
      where: {
        userId,
        paymentStatus: "COMPLETED"
      },
      include: {
        mockTest: {
          include: { subject: true }
        }
      },
      orderBy: { purchaseDate: "desc" }
    });
  }

  /**
   * Get purchase by ID
   */
  async getPurchaseById(purchaseId: string) {
    return this.prisma.mockTestPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        mockTest: true,
        user: true
      }
    });
  }

  /**
   * Get analytics for purchases
   */
  async getPurchaseAnalytics(mockTestId: string) {
    const purchases = await this.prisma.mockTestPurchase.findMany({
      where: {
        mockTestId,
        paymentStatus: "COMPLETED"
      }
    });

    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);

    return {
      mockTestId,
      totalPurchases,
      totalRevenue,
      averagePrice: totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases) : 0
    };
  }

  /**
   * Get purchase by payment attempt
   */
  async getPurchaseByPaymentAttempt(paymentAttemptId: string) {
    const paymentAttempt = await this.prisma.paymentAttempt.findUnique({
      where: { id: paymentAttemptId }
    });

    if (!paymentAttempt?.mockTestPurchaseId) {
      return null;
    }

    return this.getPurchaseById(paymentAttempt.mockTestPurchaseId);
  }
}

export function createMockTestPurchaseService(
  prisma: PrismaClient,
  fastify: FastifyInstance
): MockTestPurchaseService {
  return new MockTestPurchaseService(prisma, fastify);
}
