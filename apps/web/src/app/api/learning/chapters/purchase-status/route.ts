import { getServerSession } from "@/lib/auth";
import { db as prisma } from "@colonels-academy/database";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/learning/chapters/purchase-status?courseSlug=xxx
 *
 * Get user's chapter purchase status and progress
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get("courseSlug");

    if (!courseSlug) {
      return NextResponse.json({ error: "courseSlug is required" }, { status: 400 });
    }

    // Get course
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get user's chapter purchases
    const chapterPurchases = await prisma.chapterPurchase.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id,
        paymentStatus: "COMPLETED"
      },
      include: {
        module: {
          select: {
            id: true,
            chapterNumber: true,
            title: true
          }
        }
      }
    });

    // Get user's bundle purchases
    const bundlePurchases = await prisma.bundlePurchase.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id,
        paymentStatus: "COMPLETED"
      },
      include: {
        bundleOffer: {
          select: {
            bundleType: true,
            includedChapters: true
          }
        }
      }
    });

    // Get chapter progress
    const chapterProgress = await prisma.chapterProgress.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id
      }
    });

    // Determine which chapters are unlocked
    const purchasedChapters = new Set<number>();

    // Add individually purchased chapters
    for (const purchase of chapterPurchases) {
      if (purchase.module.chapterNumber) {
        purchasedChapters.add(purchase.module.chapterNumber);
      }
    }

    // Add bundle-purchased chapters
    for (const purchase of bundlePurchases) {
      const chapters = purchase.bundleOffer.includedChapters as number[];
      for (const ch of chapters) {
        purchasedChapters.add(ch);
      }
    }

    // Build response
    const response = {
      hasBundlePurchase: bundlePurchases.length > 0,
      bundleType: bundlePurchases[0]?.bundleOffer.bundleType || null,
      purchasedChapters: Array.from(purchasedChapters).sort(),
      chapterProgress: chapterProgress.map((progress) => ({
        chapterNumber: progress.chapterNumber,
        completionPercentage: progress.completionPercentage,
        isCompleted: progress.isChapterCompleted,
        lessonsCompleted: progress.lessonsCompleted,
        totalLessons: progress.totalLessons
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching chapter purchase status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
