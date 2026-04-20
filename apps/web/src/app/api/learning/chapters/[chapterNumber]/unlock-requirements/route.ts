import { NextRequest, NextResponse } from 'next/server';
import { db } from '@colonels-academy/database';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/learning/chapters/:chapterNumber/unlock-requirements?courseSlug=xxx
 * 
 * Get unlock requirements for a specific chapter
 * Returns what needs to be completed to unlock the chapter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterNumber: string }> }
) {
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
    const { chapterNumber } = await params;

    if (!courseSlug) {
      return NextResponse.json(
        { error: 'courseSlug is required' },
        { status: 400 }
      );
    }

    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum)) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }

    // Get course
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get the chapter module
    const module = await db.module.findFirst({
      where: {
        courseId: course.id,
        chapterNumber: chapterNum
      },
      select: {
        id: true,
        title: true,
        chapterNumber: true,
        isFreeIntro: true,
        chapterPrice: true,
        isLocked: true
      }
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // If free intro, no requirements
    if (module.isFreeIntro) {
      return NextResponse.json({
        chapter: {
          number: module.chapterNumber,
          title: module.title
        },
        requirements: {
          type: 'FREE_INTRO',
          message: 'This is a free introduction module - no requirements to unlock'
        }
      });
    }

    // Check if purchased
    const purchase = await db.chapterPurchase.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: module.id
        }
      },
      select: {
        paymentStatus: true
      }
    });

    const bundlePurchase = await db.bundlePurchase.findFirst({
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

    const isPurchased = (purchase?.paymentStatus === 'COMPLETED') || 
      (bundlePurchase && (bundlePurchase.bundleOffer.includedChapters as number[]).includes(chapterNum));

    if (!isPurchased) {
      return NextResponse.json({
        chapter: {
          number: module.chapterNumber,
          title: module.title,
          price: module.chapterPrice
        },
        requirements: {
          type: 'PURCHASE_REQUIRED',
          message: 'This chapter must be purchased before access',
          action: 'PURCHASE'
        }
      });
    }

    // If first chapter, no prerequisites
    if (chapterNum === 1) {
      return NextResponse.json({
        chapter: {
          number: module.chapterNumber,
          title: module.title
        },
        requirements: {
          type: 'NO_PREREQUISITES',
          message: 'This is the first chapter - no prerequisites required',
          canUnlock: true
        }
      });
    }

    // Get previous chapter progress
    const previousModule = await db.module.findFirst({
      where: {
        courseId: course.id,
        chapterNumber: chapterNum - 1
      },
      select: { id: true }
    });

    if (!previousModule) {
      return NextResponse.json(
        { error: 'Previous chapter not found' },
        { status: 404 }
      );
    }

    const previousProgress = await db.chapterProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: previousModule.id
        }
      }
    });

    if (!previousProgress) {
      return NextResponse.json({
        chapter: {
          number: module.chapterNumber,
          title: module.title
        },
        requirements: {
          type: 'PREREQUISITE_NOT_STARTED',
          message: 'Complete the previous chapter to unlock this one',
          prerequisite: {
            chapterNumber: chapterNum - 1,
            status: 'NOT_STARTED'
          },
          action: 'COMPLETE_PREVIOUS'
        }
      });
    }

    if (previousProgress.isChapterCompleted) {
      return NextResponse.json({
        chapter: {
          number: module.chapterNumber,
          title: module.title
        },
        requirements: {
          type: 'PREREQUISITES_MET',
          message: 'All requirements met - chapter is unlocked',
          canUnlock: true,
          prerequisite: {
            chapterNumber: chapterNum - 1,
            status: 'COMPLETED',
            completionPercentage: previousProgress.completionPercentage
          }
        }
      });
    }

    // Previous chapter in progress
    return NextResponse.json({
      chapter: {
        number: module.chapterNumber,
        title: module.title
      },
      requirements: {
        type: 'PREREQUISITE_IN_PROGRESS',
        message: 'Complete the previous chapter to unlock this one',
        prerequisite: {
          chapterNumber: chapterNum - 1,
          status: 'IN_PROGRESS',
          completionPercentage: previousProgress.completionPercentage,
          lessonsCompleted: previousProgress.lessonsCompleted,
          totalLessons: previousProgress.totalLessons
        },
        action: 'COMPLETE_PREVIOUS'
      }
    });

  } catch (error) {
    console.error('Error fetching unlock requirements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
