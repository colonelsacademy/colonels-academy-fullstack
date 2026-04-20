import { db as prisma } from "@colonels-academy/database";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/catalog/courses/[slug]/chapters
 *
 * Fetch course chapters with purchase status and bundle offers
 * Public endpoint - no authentication required
 */
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    // Get course with modules and bundle offers
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                contentType: true,
                durationMinutes: true,
                isRequired: true
              },
              orderBy: { position: "asc" }
            }
          }
        },
        bundleOffers: {
          where: { isActive: true },
          orderBy: { bundlePrice: "asc" }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Format response
    const response = {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        heroImageUrl: course.heroImageUrl,
        durationLabel: course.durationLabel,
        totalPrice: course.priceNpr
      },
      chapters: course.modules.map((module) => ({
        id: module.id,
        chapterNumber: module.chapterNumber,
        title: module.title,
        position: module.position,
        price: module.chapterPrice,
        isFreeIntro: module.isFreeIntro,
        isLocked: module.isLocked,
        lessonCount: module.lessons.length,
        totalDuration: module.lessons.reduce(
          (sum, lesson) => sum + (lesson.durationMinutes || 0),
          0
        ),
        lessons: module.lessons
      })),
      bundles: course.bundleOffers.map((bundle) => ({
        id: bundle.id,
        type: bundle.bundleType,
        title: bundle.title,
        description: bundle.description,
        originalPrice: bundle.originalPrice,
        bundlePrice: bundle.bundlePrice,
        discount: bundle.discount,
        features: {
          includesMentorAccess: bundle.includesMentorAccess,
          includesMockExams: bundle.includesMockExams,
          includesCertificate: bundle.includesCertificate,
          includesLiveClasses: bundle.includesLiveClasses,
          mockExamCount: bundle.mockExamCount,
          liveClassCount: bundle.liveClassCount
        },
        includedChapters: bundle.includedChapters as number[]
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching course chapters:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
