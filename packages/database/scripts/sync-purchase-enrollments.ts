/**
 * Sync Purchase Enrollments
 *
 * This script finds all PAID orders and ensures enrollments exist.
 * Useful when purchases succeed but enrollments aren't created.
 *
 * Usage: pnpm --filter @colonels-academy/database exec tsx scripts/sync-purchase-enrollments.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncPurchaseEnrollments() {
  console.log("🔄 Syncing purchase enrollments...\n");

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
      user: {
        select: {
          id: true,
          email: true,
          displayName: true
        }
      }
    }
  });

  console.log(`Found ${paidOrders.length} paid orders\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const order of paidOrders) {
    console.log(`\n📦 Order ${order.id} - ${order.user.email}`);

    for (const item of order.items) {
      const courseTitle = item.course.title;

      // Check if enrollment exists
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: item.courseId
          }
        }
      });

      if (!existingEnrollment) {
        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: item.courseId,
            status: "ACTIVE",
            progressPercent: 0,
            purchasedAt: order.createdAt
          }
        });
        console.log(`   ✅ Created enrollment: ${courseTitle}`);
        created++;
      } else if (existingEnrollment.status !== "ACTIVE") {
        // Update status to ACTIVE
        await prisma.enrollment.update({
          where: {
            id: existingEnrollment.id
          },
          data: {
            status: "ACTIVE"
          }
        });
        console.log(
          `   🔄 Updated enrollment status: ${courseTitle} (${existingEnrollment.status} → ACTIVE)`
        );
        updated++;
      } else {
        console.log(`   ⏭️  Enrollment already exists: ${courseTitle}`);
        skipped++;
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Created: ${created} enrollments`);
  console.log(`🔄 Updated: ${updated} enrollments`);
  console.log(`⏭️  Skipped: ${skipped} enrollments (already active)`);
  console.log("=".repeat(60));
  console.log("\n✨ Sync complete!");
}

syncPurchaseEnrollments()
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
