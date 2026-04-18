import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@colonels-academy/database';
import { getServerSession } from '@/lib/auth';

/**
 * POST /api/orders/confirm-payment
 * 
 * Confirm payment and unlock chapters
 * Body: { 
 *   purchaseId: string, 
 *   type: 'chapter' | 'bundle',
 *   transactionId: string,
 *   paymentStatus: 'COMPLETED' | 'FAILED'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { purchaseId, type, transactionId, paymentStatus } = body;

    if (!purchaseId || !type || !transactionId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type === 'chapter') {
      // Update chapter purchase
      const chapterPurchase = await prisma.chapterPurchase.findUnique({
        where: { id: purchaseId },
        include: {
          module: {
            include: {
              lessons: {
                where: { isRequired: true },
                select: { id: true }
              }
            }
          }
        }
      });

      if (!chapterPurchase) {
        return NextResponse.json(
          { error: 'Purchase not found' },
          { status: 404 }
        );
      }

      if (chapterPurchase.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Update payment status
      await prisma.chapterPurchase.update({
        where: { id: purchaseId },
        data: {
          paymentStatus,
          transactionId,
          purchaseDate: paymentStatus === 'COMPLETED' ? new Date() : undefined
        }
      });

      if (paymentStatus === 'COMPLETED') {
        // Unlock chapter by updating module
        await prisma.module.update({
          where: { id: chapterPurchase.moduleId },
          data: { isLocked: false }
        });

        // Create enrollment if doesn't exist
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: chapterPurchase.courseId
            }
          },
          update: {},
          create: {
            userId: session.user.id,
            courseId: chapterPurchase.courseId,
            status: 'ACTIVE'
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: paymentStatus === 'COMPLETED' 
          ? 'Chapter unlocked successfully!' 
          : 'Payment failed',
        redirectUrl: paymentStatus === 'COMPLETED'
          ? `/classroom/${chapterPurchase.module.courseId}`
          : `/courses/${chapterPurchase.module.courseId}`
      });

    } else if (type === 'bundle') {
      // Update bundle purchase
      const bundlePurchase = await prisma.bundlePurchase.findUnique({
        where: { id: purchaseId },
        include: {
          bundleOffer: {
            include: {
              course: {
                include: {
                  modules: {
                    where: {
                      chapterNumber: {
                        in: [] // Will be populated below
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!bundlePurchase) {
        return NextResponse.json(
          { error: 'Purchase not found' },
          { status: 404 }
        );
      }

      if (bundlePurchase.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Update payment status
      await prisma.bundlePurchase.update({
        where: { id: purchaseId },
        data: {
          paymentStatus,
          transactionId,
          purchaseDate: paymentStatus === 'COMPLETED' ? new Date() : undefined,
          unlockDate: paymentStatus === 'COMPLETED' ? new Date() : undefined
        }
      });

      if (paymentStatus === 'COMPLETED') {
        const includedChapters = bundlePurchase.bundleOffer.includedChapters as number[];

        // Unlock all chapters in the bundle
        await prisma.module.updateMany({
          where: {
            courseId: bundlePurchase.courseId,
            chapterNumber: {
              in: includedChapters
            }
          },
          data: { isLocked: false }
        });

        // Create chapter purchases for each chapter
        const modules = await prisma.module.findMany({
          where: {
            courseId: bundlePurchase.courseId,
            chapterNumber: {
              in: includedChapters
            }
          }
        });

        for (const module of modules) {
          await prisma.chapterPurchase.upsert({
            where: {
              userId_moduleId: {
                userId: session.user.id,
                moduleId: module.id
              }
            },
            update: {
              paymentStatus: 'COMPLETED',
              isBundle: true,
              bundleId: bundlePurchase.id
            },
            create: {
              userId: session.user.id,
              courseId: bundlePurchase.courseId,
              moduleId: module.id,
              chapterNumber: module.chapterNumber!,
              amount: 0, // Part of bundle
              paymentMethod: bundlePurchase.paymentMethod,
              paymentStatus: 'COMPLETED',
              isBundle: true,
              bundleId: bundlePurchase.id,
              transactionId
            }
          });

          // Initialize chapter progress
          await prisma.chapterProgress.upsert({
            where: {
              userId_moduleId: {
                userId: session.user.id,
                moduleId: module.id
              }
            },
            update: {},
            create: {
              userId: session.user.id,
              courseId: bundlePurchase.courseId,
              moduleId: module.id,
              chapterNumber: module.chapterNumber!,
              totalLessons: await prisma.lesson.count({
                where: { moduleId: module.id, isRequired: true }
              }),
              totalVideos: await prisma.lesson.count({
                where: { moduleId: module.id, contentType: 'VIDEO' }
              }),
              totalQuizzes: await prisma.lesson.count({
                where: { moduleId: module.id, contentType: 'QUIZ' }
              }),
              totalAssignments: await prisma.lesson.count({
                where: { moduleId: module.id, learningMode: 'PRACTICE' }
              })
            }
          });
        }

        // Create enrollment
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: bundlePurchase.courseId
            }
          },
          update: {},
          create: {
            userId: session.user.id,
            courseId: bundlePurchase.courseId,
            status: 'ACTIVE'
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: paymentStatus === 'COMPLETED' 
          ? 'Bundle purchased successfully! All chapters unlocked.' 
          : 'Payment failed',
        redirectUrl: paymentStatus === 'COMPLETED'
          ? `/classroom/${bundlePurchase.courseId}`
          : `/courses/${bundlePurchase.courseId}`
      });
    }

    return NextResponse.json(
      { error: 'Invalid purchase type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
