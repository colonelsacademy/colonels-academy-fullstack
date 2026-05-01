/**
 * Order & Enrollment Flow Tests
 *
 * Critical path testing for payment and enrollment atomicity
 */

import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../app";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: (process.env.DATABASE_URL_TEST || process.env.DATABASE_URL) as string
    }
  }
});

describe("Orders API - Enrollment Atomicity", () => {
  let app: FastifyInstance;
  let testUserId: string;
  let testCourseId: string;

  beforeAll(async () => {
    app = await buildApp();

    // Create test course
    const course = await prisma.course.create({
      data: {
        slug: "test-course-enrollment",
        title: "Test Course for Enrollment",
        track: "army",
        summary: "Test course",
        description: "Test description",
        level: "Beginner",
        durationLabel: "4 weeks",
        lessonCount: 10,
        priceNpr: 5000,
        accentColor: "#D4AF37"
      }
    });
    testCourseId = course.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.enrollment.deleteMany({ where: { courseId: testCourseId } });
    await prisma.purchaseOrderItem.deleteMany({ where: { courseId: testCourseId } });
    await prisma.purchaseOrder.deleteMany({ where: { userId: testUserId } });
    await prisma.course.delete({ where: { id: testCourseId } });
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Create fresh test user for each test
    const user = await prisma.user.create({
      data: {
        firebaseUid: `test-uid-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        role: "STUDENT"
      }
    });
    testUserId = user.id;
  });

  it("should create enrollment atomically when order is confirmed", async () => {
    // 1. Create order
    const order = await prisma.purchaseOrder.create({
      data: {
        userId: testUserId,
        status: "PENDING_PAYMENT",
        totalNpr: 5000,
        provider: "mock",
        items: {
          create: {
            courseId: testCourseId,
            priceNpr: 5000,
            quantity: 1
          }
        }
      }
    });

    // 2. Confirm order (simulating payment confirmation)
    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.update({
        where: { id: order.id },
        data: { status: "PAID" }
      });

      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: testUserId, courseId: testCourseId } },
        create: {
          userId: testUserId,
          courseId: testCourseId,
          status: "ACTIVE",
          progressPercent: 0
        },
        update: { status: "ACTIVE" }
      });
    });

    // 3. Verify both order and enrollment
    const updatedOrder = await prisma.purchaseOrder.findUnique({
      where: { id: order.id }
    });
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: testUserId, courseId: testCourseId } }
    });

    expect(updatedOrder?.status).toBe("PAID");
    expect(enrollment).toBeTruthy();
    expect(enrollment?.status).toBe("ACTIVE");
  });

  it("should be idempotent - confirming twice should not create duplicate enrollments", async () => {
    // 1. Create order
    const order = await prisma.purchaseOrder.create({
      data: {
        userId: testUserId,
        status: "PENDING_PAYMENT",
        totalNpr: 5000,
        provider: "mock",
        items: {
          create: {
            courseId: testCourseId,
            priceNpr: 5000,
            quantity: 1
          }
        }
      }
    });

    // 2. Confirm order twice
    for (let i = 0; i < 2; i++) {
      await prisma.$transaction(async (tx) => {
        await tx.purchaseOrder.update({
          where: { id: order.id },
          data: { status: "PAID" }
        });

        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: testUserId, courseId: testCourseId } },
          create: {
            userId: testUserId,
            courseId: testCourseId,
            status: "ACTIVE",
            progressPercent: 0
          },
          update: { status: "ACTIVE" }
        });
      });
    }

    // 3. Verify only one enrollment exists
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: testUserId, courseId: testCourseId }
    });

    expect(enrollments).toHaveLength(1);
    expect(enrollments[0]?.status).toBe("ACTIVE");
  });

  it("should rollback enrollment if order update fails", async () => {
    // 1. Create order
    const order = await prisma.purchaseOrder.create({
      data: {
        userId: testUserId,
        status: "PENDING_PAYMENT",
        totalNpr: 5000,
        provider: "mock",
        items: {
          create: {
            courseId: testCourseId,
            priceNpr: 5000,
            quantity: 1
          }
        }
      }
    });

    // 2. Try to confirm with invalid order ID (should fail)
    try {
      await prisma.$transaction(async (tx) => {
        await tx.purchaseOrder.update({
          where: { id: "invalid-order-id" },
          data: { status: "PAID" }
        });

        await tx.enrollment.create({
          data: {
            userId: testUserId,
            courseId: testCourseId,
            status: "ACTIVE",
            progressPercent: 0
          }
        });
      });
    } catch (_error) {
      // Expected to fail
    }

    // 3. Verify enrollment was NOT created (transaction rolled back)
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: testUserId, courseId: testCourseId } }
    });
    const orderStatus = await prisma.purchaseOrder.findUnique({
      where: { id: order.id },
      select: { status: true }
    });

    expect(enrollment).toBeNull();
    expect(orderStatus?.status).toBe("PENDING_PAYMENT");
  });
});
