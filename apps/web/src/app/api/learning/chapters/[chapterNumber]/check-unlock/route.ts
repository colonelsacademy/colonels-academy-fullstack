import { NextRequest, NextResponse } from 'next/server';
import { db } from '@colonels-academy/database';
import { getServerSession } from '@/lib/auth';

/**
 * POST /api/learning/chapters/:chapterNumber/check-unlock?courseSlug=xxx
 * 
 * Check if a chapter should be unlocked based on completion criteria
 * This endpoint is called after completing a chapter to check if next chapter should unlock
 */
export async function POST(
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

    // Get current chapter progress
    const currentModule = await db.module.findFirst({
      where: {
        courseId: course.id,
        chapterNumber: chapterNum
      },
      select: { id: true }
    });

    if (!currentModule) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    const currentProgress = await db.chapterProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: currentModule.id
        }
      }
    });

    if (!currentProgress) {
      return NextResponse.json(
        { error: 'Chapter progress not found' },
        { status: 404 }
      );
    }

    // Check completion criteria
    const completionCriteria = {
      allVideosWatched: currentProgress.videosWatched >= currentProgress.totalVideos,
      allQuizzesPassed: currentProgress.quizzesCompleted >= currentProgress.totalQuizzes && 
                        currentProgress.allQuizzesPassed,
      allLessonsCompleted: currentProgress.lessonsCompleted >= currentProgress.totalLessons,
      completionPercentage: currentProgress.completionPercentage >= 70
    };

    const isChapterComplete = 
      completionCriteria.allVideosWatched &&
      completionCriteria.allQuizzesPassed &&
      completionCriteria.allLessonsCompleted;

    // Update chapter completion status if criteria met
    if (isChapterComplete && !currentProgress.isChapterCompleted) {
      await db.chapterProgress.update({
        where: { id: currentProgress.id },
        data: {
          isChapterCompleted: true,
          completionDate: new Date(),
          nextChapterUnlocked: true,
          unlockedDate: new Date()
        }
      });
    }

    // Check if next chapter should be unlocked
    let nextChapterUnlocked = false;
    let nextChapterNumber = chapterNum + 1;

    if (isChapterComplete) {
      // Get next chapter
      const nextModule = await db.module.findFirst({
        where: {
          courseId: course.id,
          chapterNumber: nextChapterNumber
        },
        select: { id: true, isLocked: true }
      });

      if (nextModule && nextModule.isLocked) {
        // Unlock next chapter
        await db.module.update({
          where: { id: nextModule.id },
          data: { isLocked: false }
        });

        // Initialize progress for next chapter
        const nextModuleWithLessons = await db.module.findUnique({
          where: { id: nextModule.id },
          select: {
            id: true,
            chapterNumber: true,
            courseId: true
          }
        });

        if (nextModuleWithLessons) {
          const totalLessons = await db.lesson.count({
            where: { moduleId: nextModule.id, isRequired: true }
          });

          const totalVideos = await db.lesson.count({
            where: { moduleId: nextModule.id, contentType: 'VIDEO' }
          });

          const totalQuizzes = await db.lesson.count({
            where: { moduleId: nextModule.id, contentType: 'QUIZ' }
          });

          const totalAssignments = await db.lesson.count({
            where: { moduleId: nextModule.id, learningMode: 'PRACTICE' }
          });

          await db.chapterProgress.upsert({
            where: {
              userId_moduleId: {
                userId: session.user.id,
                moduleId: nextModule.id
              }
            },
            update: {},
            create: {
              userId: session.user.id,
              courseId: course.id,
              moduleId: nextModule.id,
              chapterNumber: nextChapterNumber,
              totalLessons,
              totalVideos,
              totalQuizzes,
              totalAssignments
            }
          });
        }

        nextChapterUnlocked = true;
      }
    }

    return NextResponse.json({
      chapter: {
        number: chapterNum,
        isCompleted: isChapterComplete
      },
      completionCriteria,
      nextChapter: {
        number: nextChapterNumber,
        unlocked: nextChapterUnlocked
      },
      message: isChapterComplete
        ? nextChapterUnlocked
          ? `Chapter ${chapterNum} completed! Chapter ${nextChapterNumber} is now unlocked.`
          : `Chapter ${chapterNum} completed!`
        : `Chapter ${chapterNum} not yet complete. Keep working!`
    });

  } catch (error) {
    console.error('Error checking chapter unlock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
