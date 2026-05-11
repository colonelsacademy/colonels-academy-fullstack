import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

export class MockTestBundlePurchaseService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  /**
   * Create a bundle purchase record
   */
  async createBundlePurchase(data: {
    userId: string;
    position: string; // "Officer Cadet" | "ASI"
    paymentMethod: string;
  }) {
    // Get the bundle by position
    const bundle = await this.prisma.mockTestBundle.findUnique({
      where: { position: data.position }
    });

    if (!bundle) {
      throw new Error(`Bundle not found for position: ${data.position}`);
    }

    if (!bundle.isActive) {
      throw new Error("This bundle is not available for purchase");
    }

    // Check if user already purchased this bundle
    const existingPurchase = await this.prisma.mockTestBundlePurchase.findUnique({
      where: {
        userId_bundleId: {
          userId: data.userId,
          bundleId: bundle.id
        }
      }
    });

    if (existingPurchase && existingPurchase.paymentStatus === "COMPLETED") {
      throw new Error("You have already purchased this bundle");
    }

    // Create purchase record
    return this.prisma.mockTestBundlePurchase.create({
      data: {
        userId: data.userId,
        bundleId: bundle.id,
        amount: bundle.priceNpr,
        paymentMethod: data.paymentMethod as "ESEWA" | "KHALTI",
        paymentStatus: "PENDING"
      }
    });
  }

  /**
   * Mark bundle purchase as completed
   */
  async completeBundlePurchase(purchaseId: string, transactionId?: string) {
    return this.prisma.mockTestBundlePurchase.update({
      where: { id: purchaseId },
      data: {
        paymentStatus: "COMPLETED",
        transactionId: transactionId || null,
        purchaseDate: new Date()
      }
    });
  }

  /**
   * Mark bundle purchase as failed
   */
  async failBundlePurchase(purchaseId: string) {
    return this.prisma.mockTestBundlePurchase.update({
      where: { id: purchaseId },
      data: {
        paymentStatus: "FAILED"
      }
    });
  }

  /**
   * Check if user has purchased a bundle by position
   */
  async hasPurchasedBundle(userId: string, position: string): Promise<boolean> {
    const bundle = await this.prisma.mockTestBundle.findUnique({
      where: { position }
    });

    if (!bundle) {
      return false;
    }

    const purchase = await this.prisma.mockTestBundlePurchase.findUnique({
      where: {
        userId_bundleId: {
          userId,
          bundleId: bundle.id
        }
      }
    });

    return purchase?.paymentStatus === "COMPLETED";
  }

  /**
   * Get bundle by position
   */
  async getBundleByPosition(position: string) {
    return this.prisma.mockTestBundle.findUnique({
      where: { position }
    });
  }

  /**
   * Get user's bundle purchases
   */
  async getUserBundlePurchases(userId: string) {
    return this.prisma.mockTestBundlePurchase.findMany({
      where: {
        userId,
        paymentStatus: "COMPLETED"
      },
      include: {
        bundle: true
      },
      orderBy: { purchaseDate: "desc" }
    });
  }

  /**
   * Get all active bundles
   */
  async getActiveBundles() {
    return this.prisma.mockTestBundle.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" }
    });
  }
}

export function createMockTestBundlePurchaseService(
  prisma: PrismaClient,
  fastify: FastifyInstance
): MockTestBundlePurchaseService {
  return new MockTestBundlePurchaseService(prisma, fastify);
}
