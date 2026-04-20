import { getServerSession } from "@/lib/auth";
import { db } from "@colonels-academy/database";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/purchases?courseSlug=xxx&limit=50&offset=0&status=COMPLETED
 *
 * List all purchases (admin only)
 * Query params:
 *   - courseSlug: Filter by course
 *   - limit: Number of results (default 50, max 100)
 *   - offset: Pagination offset
 *   - status: Filter by payment status (PENDING, COMPLETED, FAILED)
 *   - type: Filter by purchase type (CHAPTER, BUNDLE)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get("courseSlug");
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100);
    const offset = Number.parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let courseId: string | undefined;
    if (courseSlug) {
      const course = await db.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true }
      });
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      courseId = course.id;
    }

    // Build filters
    const chapterFilter: any = {};
    const bundleFilter: any = {};

    if (courseId) {
      chapterFilter.courseId = courseId;
      bundleFilter.courseId = courseId;
    }

    if (status) {
      chapterFilter.paymentStatus = status;
      bundleFilter.paymentStatus = status;
    }

    // Fetch chapter purchases
    let chapterPurchases: any[] = [];
    if (!type || type === "CHAPTER") {
      chapterPurchases = await db.chapterPurchase.findMany({
        where: chapterFilter,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true
            }
          },
          module: {
            select: {
              chapterNumber: true,
              title: true
            }
          }
        },
        orderBy: { purchaseDate: "desc" },
        take: limit,
        skip: offset
      });
    }

    // Fetch bundle purchases
    let bundlePurchases: any[] = [];
    if (!type || type === "BUNDLE") {
      bundlePurchases = await db.bundlePurchase.findMany({
        where: bundleFilter,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true
            }
          },
          bundleOffer: {
            select: {
              bundleType: true,
              title: true,
              includedChapters: true
            }
          }
        },
        orderBy: { purchaseDate: "desc" },
        take: limit,
        skip: offset
      });
    }

    // Format response
    const purchases = [
      ...chapterPurchases.map((p) => ({
        id: p.id,
        type: "CHAPTER",
        userId: p.userId,
        user: p.user,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus,
        transactionId: p.transactionId,
        purchaseDate: p.purchaseDate,
        chapter: {
          number: p.module.chapterNumber,
          title: p.module.title
        }
      })),
      ...bundlePurchases.map((p) => ({
        id: p.id,
        type: "BUNDLE",
        userId: p.userId,
        user: p.user,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentStatus: p.paymentStatus,
        transactionId: p.transactionId,
        purchaseDate: p.purchaseDate,
        bundle: {
          type: p.bundleOffer.bundleType,
          title: p.bundleOffer.title,
          chaptersIncluded: p.bundleOffer.includedChapters as number[]
        }
      }))
    ].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    // Get total counts
    const totalChapters = await db.chapterPurchase.count({
      where: chapterFilter
    });

    const totalBundles = await db.bundlePurchase.count({
      where: bundleFilter
    });

    const total = totalChapters + totalBundles;

    return NextResponse.json({
      purchases: purchases.slice(0, limit),
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      },
      summary: {
        totalChapterPurchases: totalChapters,
        totalBundlePurchases: totalBundles
      }
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
