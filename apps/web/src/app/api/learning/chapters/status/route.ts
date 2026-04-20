import { NextRequest, NextResponse } from 'next/server';
import { db } from '@colonels-academy/database';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/learning/chapters/status?courseSlug=xxx
 * 
 * Get chapter unlock status for all chapters in a course
 * Returns which chapters are locked/unlocked and why
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get('courseSlug');

    if (!courseSlug) {
      return NextResponse.json(
        { error: 'courseSlug is required' },
        { status: 400 }
      );
    }

    // Get course
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, title: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get all modules (chapters)
    const modules = await db.module.findMany({
      where: { courseId: course.id },
      orderBy: { chapterNumber: 'asc' },
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        isLocked: true,
        isFreeIntro: true,
        chapterPrice: true
      }
    });

    // Get user's purchases
    const chapterPurchases = await db.chapterPurchase.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id,
        paymentStatus: 'COMPLETED'
      },
      select: {
        moduleId: true
      }
    });

    const bundlePurchases = await db.bundlePurchase.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id,
        paymentStatus: 'COMPLETED'
      },
      select: {
        bundleOffer: {
          select: {
            includedChapters: true
          }
        }
      }
    });

    // Get chapter progress
    const chapterProgress = await db.chapterProgress.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id
      }
    });

    // Build purchased chapters set
    const purchasedModuleIds = new Set(chapterPurchases.map(p => p.moduleId));
    const purchasedChapters = new Set<number>();

    bundlePurchases.forEach(bp => {
      const chapters = bp.bundleOffer.includedChapters as number[];
      chapters.forEach(ch => purchasedChapters.add(ch));
    });

    // Build progress map
    const progressMap = new Map(chapterProgress.map(cp => [cp.chapterNumber, cp]));

    // Determine unlock status for each chapter
    const chapterStatuses = modules.map((module, index) => {
      const chapterNum = module.chapterNumber;
      if (!chapterNum) {
        return null;
      }
      const progress = progressMap.get(chapterNum);
      const isPurchased = purchasedModuleIds.has(module.id) || purchasedChapters.has(chapterNum);
      const isFreeIntro = module.isFreeIntro;

      let unlockStatus = 'LOCKED';
      let unlockReason = '';
      let canUnlock = false;

      if (isFreeIntro) {
        unlockStatus = 'UNLOCKED';
        unlockReason = 'Free introduction module';
      } else if (!isPurchased) {
        unlockStatus = 'LOCKED';
        unlockReason = 'Not purchased';
        canUnlock = true;
      } else if (index === 0 || isFreeIntro) {
        // First chapter or free intro
        unlockStatus = 'UNLOCKED';
        unlockReason = 'Purchased';
      } else {
        // Check if previous chapter is completed
        const previousChapter = modules[index - 1];
        if (previousChapter && previousChapter.chapterNumber) {
          const previousProgress = progressMap.get(previousChapter.chapterNumber);

          if (previousProgress?.isChapterCompleted) {
            unlockStatus = 'UNLOCKED';
            unlockReason = 'Previous chapter completed';
          } else {
            unlockStatus = 'LOCKED';
            unlockReason = 'Previous chapter not completed';
            canUnlock = false;
          }
        }
      }

      return {
        chapterNumber: chapterNum,
        title: module.title,
        price: module.chapterPrice,
        isPurchased,
        isFreeIntro,
        unlockStatus,
        unlockReason,
        canUnlock,
        progress: progress ? {
          completionPercentage: progress.completionPercentage,
          isCompleted: progress.isChapterCompleted,
          lessonsCompleted: progress.lessonsCompleted,
          totalLessons: progress.totalLessons,
          videosWatched: progress.videosWatched,
          totalVideos: progress.totalVideos,
          quizzesCompleted: progress.quizzesCompleted,
          totalQuizzes: progress.totalQuizzes
        } : null
      };
    }).filter(Boolean);

    return NextResponse.json({
      course: {
        slug: courseSlug,
        title: course.title
      },
      chapters: chapterStatuses
    });

  } catch (error) {
    console.error('Error fetching chapter status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
