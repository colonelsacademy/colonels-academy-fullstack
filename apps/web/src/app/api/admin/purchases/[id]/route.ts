import { getServerSession } from "@/lib/auth";
import { db } from "@colonels-academy/database";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/purchases/:id
 *
 * Get detailed purchase information (admin only)
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Try to find as chapter purchase first
    const purchase = await db.chapterPurchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true
          }
        },
        module: {
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            chapterPrice: true
          }
        },
        course: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    if (purchase) {
      return NextResponse.json({
        id: purchase.id,
        type: "CHAPTER",
        user: purchase.user,
        course: purchase.course,
        amount: purchase.amount,
        paymentMethod: purchase.paymentMethod,
        paymentStatus: purchase.paymentStatus,
        transactionId: purchase.transactionId,
        purchaseDate: purchase.purchaseDate,
        createdAt: purchase.createdAt,
        updatedAt: purchase.updatedAt,
        chapter: {
          id: purchase.module.id,
          number: purchase.module.chapterNumber,
          title: purchase.module.title,
          price: purchase.module.chapterPrice
        },
        isBundle: purchase.isBundle,
        bundleId: purchase.bundleId
      });
    }

    // Try to find as bundle purchase
    const bundlePurchase = await db.bundlePurchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true
          }
        },
        bundleOffer: {
          select: {
            id: true,
            bundleType: true,
            title: true,
            description: true,
            includedChapters: true,
            originalPrice: true,
            bundlePrice: true,
            discount: true,
            includesMentorAccess: true,
            includesMockExams: true,
            includesCertificate: true,
            mockExamCount: true
          }
        },
        course: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    if (bundlePurchase) {
      // Get chapter progress for this user
      const chapterProgress = await db.chapterProgress.findMany({
        where: {
          userId: bundlePurchase.userId,
          courseId: bundlePurchase.courseId,
          chapterNumber: {
            in: bundlePurchase.bundleOffer.includedChapters as number[]
          }
        }
      });

      return NextResponse.json({
        id: bundlePurchase.id,
        type: "BUNDLE",
        user: bundlePurchase.user,
        course: bundlePurchase.course,
        amount: bundlePurchase.amount,
        paymentMethod: bundlePurchase.paymentMethod,
        paymentStatus: bundlePurchase.paymentStatus,
        transactionId: bundlePurchase.transactionId,
        purchaseDate: bundlePurchase.purchaseDate,
        unlockDate: bundlePurchase.unlockDate,
        createdAt: bundlePurchase.createdAt,
        updatedAt: bundlePurchase.updatedAt,
        bundle: {
          id: bundlePurchase.bundleOffer.id,
          type: bundlePurchase.bundleOffer.bundleType,
          title: bundlePurchase.bundleOffer.title,
          description: bundlePurchase.bundleOffer.description,
          chaptersIncluded: bundlePurchase.bundleOffer.includedChapters as number[],
          pricing: {
            originalPrice: bundlePurchase.bundleOffer.originalPrice,
            bundlePrice: bundlePurchase.bundleOffer.bundlePrice,
            discount: bundlePurchase.bundleOffer.discount
          },
          features: {
            mentorAccess: bundlePurchase.bundleOffer.includesMentorAccess,
            mockExams: bundlePurchase.bundleOffer.includesMockExams,
            mockExamCount: bundlePurchase.bundleOffer.mockExamCount,
            certificate: bundlePurchase.bundleOffer.includesCertificate
          }
        },
        chaptersUnlocked: bundlePurchase.chaptersUnlocked as number[],
        chapterProgress: chapterProgress.map((cp) => ({
          chapterNumber: cp.chapterNumber,
          completionPercentage: cp.completionPercentage,
          isCompleted: cp.isChapterCompleted,
          lessonsCompleted: cp.lessonsCompleted,
          totalLessons: cp.totalLessons
        }))
      });
    }

    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
