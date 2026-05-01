/**
 * Fix Enrollment Atomicity Issue
 *
 * This script improves the purchase → enrollment flow to ensure atomicity.
 * It also provides a function to sync existing purchases with missing enrollments.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Sync existing PAID orders with missing enrollments
 * This fixes the current issue where users have paid but don't have enrollments
 */
async function syncPurchasesWithEnrollments() {
  console.log("🔍 Finding PAID orders without enrollments...\n");

  // Find all PAID orders
  const paidOrders = await prisma.purchaseOrder.findMany({
    where: {
      status: "PAID"
    },
    include: {
      items: {
        include: {
          course: true
        }
      },
      user: true
    }
  });

  console.log(`Found ${paidOrders.length} PAID orders\n`);

  let fixed = 0;
  let alreadyEnrolled = 0;
  let errors = 0;

  for (const order of paidOrders) {
    for (const item of order.items) {
      try {
        // Check if enrollment exists
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: item.courseId
            }
          }
        });

        if (existingEnrollment) {
          // Enrollment exists - check if it's ACTIVE
          if (existingEnrollment.status !== "ACTIVE") {
            await prisma.enrollment.update({
              where: { id: existingEnrollment.id },
              data: { status: "ACTIVE" }
            });
            console.log(
              `✅ Updated enrollment status to ACTIVE for user ${order.user.email} - ${item.course.title}`
            );
            fixed++;
          } else {
            alreadyEnrolled++;
          }
        } else {
          // Create missing enrollment
          await prisma.enrollment.create({
            data: {
              userId: order.userId,
              courseId: item.courseId,
              status: "ACTIVE",
              purchasedAt: order.createdAt
            }
          });
          console.log(
            `✅ Created missing enrollment for user ${order.user.email} - ${item.course.title}`
          );
          fixed++;
        }
      } catch (error) {
        console.error(`❌ Error processing order ${order.id} for course ${item.courseId}:`, error);
        errors++;
      }
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   Fixed/Created: ${fixed}`);
  console.log(`   Already enrolled: ${alreadyEnrolled}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total orders processed: ${paidOrders.length}\n`);
}

/**
 * Create an atomic purchase + enrollment transaction
 * This is the improved version that should be used in the API
 */
async function createPurchaseWithEnrollment(
  userId: string,
  courseId: string,
  priceNpr: number,
  provider: string
) {
  // Use a transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Create the order
    const order = await tx.purchaseOrder.create({
      data: {
        userId,
        status: "PENDING_PAYMENT",
        totalNpr: priceNpr,
        currency: "NPR",
        provider,
        items: {
          create: {
            courseId,
            priceNpr,
            quantity: 1
          }
        }
      },
      include: {
        items: true
      }
    });

    // 2. When payment is confirmed, update order and create enrollment
    // This should be called from the payment webhook/confirmation
    return order;
  });
}

/**
 * Confirm payment and create enrollment atomically
 * This should be called from the payment confirmation endpoint
 */
async function confirmPaymentAndEnroll(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update order status
    const order = await tx.purchaseOrder.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: {
        items: true,
        user: true
      }
    });

    // 2. Create enrollments for all items
    const enrollments = [];
    for (const item of order.items) {
      // Check if enrollment already exists (idempotency)
      const existing = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: item.courseId
          }
        }
      });

      if (existing) {
        // Update to ACTIVE if not already
        if (existing.status !== "ACTIVE") {
          const updated = await tx.enrollment.update({
            where: { id: existing.id },
            data: { status: "ACTIVE" }
          });
          enrollments.push(updated);
        } else {
          enrollments.push(existing);
        }
      } else {
        // Create new enrollment
        const enrollment = await tx.enrollment.create({
          data: {
            userId: order.userId,
            courseId: item.courseId,
            status: "ACTIVE",
            purchasedAt: new Date()
          }
        });
        enrollments.push(enrollment);
      }
    }

    return { order, enrollments };
  });
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncPurchasesWithEnrollments()
    .then(() => {
      console.log("✅ Sync completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Sync failed:", error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

// Export functions for use in API
export { syncPurchasesWithEnrollments, createPurchaseWithEnrollment, confirmPaymentAndEnroll };
