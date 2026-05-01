/**
 * Enrollment Reconciliation Script
 * 
 * Ensures all PAID orders have corresponding ACTIVE enrollments.
 * Safe to run multiple times (idempotent).
 * 
 * Usage: pnpm --filter @colonels-academy/database exec tsx scripts/reconcile-enrollments.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ReconciliationStats {
  totalPaidOrders: number;
  enrollmentsCreated: number;
  enrollmentsUpdated: number;
  alreadyActive: number;
  errors: number;
}

async function reconcileEnrollments(): Promise<ReconciliationStats> {
  const stats: ReconciliationStats = {
    totalPaidOrders: 0,
    enrollmentsCreated: 0,
    enrollmentsUpdated: 0,
    alreadyActive: 0,
    errors: 0,
  };

  // Find all PAID orders with their items
  const paidOrders = await prisma.purchaseOrder.findMany({
    where: { status: 'PAID' },
    include: {
      user: { select: { id: true, email: true } },
      items: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });

  stats.totalPaidOrders = paidOrders.length;

  for (const order of paidOrders) {
    for (const item of order.items) {
      try {
        // Check if enrollment exists
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: item.courseId,
            },
          },
        });

        if (!existingEnrollment) {
          // Create missing enrollment
          await prisma.enrollment.create({
            data: {
              userId: order.userId,
              courseId: item.courseId,
              status: 'ACTIVE',
              progressPercent: 0,
              purchasedAt: order.createdAt,
            },
          });
          stats.enrollmentsCreated++;
        } else if (existingEnrollment.status !== 'ACTIVE') {
          // Update enrollment status
          await prisma.enrollment.update({
            where: {
              userId_courseId: {
                userId: order.userId,
                courseId: item.courseId,
              },
            },
            data: { status: 'ACTIVE' },
          });
          stats.enrollmentsUpdated++;
        } else {
          stats.alreadyActive++;
        }
      } catch (error) {
        stats.errors++;
        // Log error but continue processing
        if (error instanceof Error) {
          process.stderr.write(
            `Error processing order ${order.id} for course ${item.course.title}: ${error.message}\n`
          );
        }
      }
    }
  }

  return stats;
}

async function main() {
  try {
    process.stdout.write('🔄 Starting enrollment reconciliation...\n\n');

    const stats = await reconcileEnrollments();

    process.stdout.write('\n📊 Reconciliation Summary:\n');
    process.stdout.write(`   Total PAID orders: ${stats.totalPaidOrders}\n`);
    process.stdout.write(`   Enrollments created: ${stats.enrollmentsCreated}\n`);
    process.stdout.write(`   Enrollments updated: ${stats.enrollmentsUpdated}\n`);
    process.stdout.write(`   Already active: ${stats.alreadyActive}\n`);
    process.stdout.write(`   Errors: ${stats.errors}\n\n`);

    if (stats.errors > 0) {
      process.stdout.write('⚠️  Some errors occurred. Check stderr for details.\n');
      process.exit(1);
    } else {
      process.stdout.write('✅ Reconciliation completed successfully\n');
      process.exit(0);
    }
  } catch (error) {
    process.stderr.write(`❌ Fatal error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
