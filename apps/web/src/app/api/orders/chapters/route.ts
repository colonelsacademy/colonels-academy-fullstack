import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@colonels-academy/database';
import { getServerSession } from '@/lib/auth';

/**
 * POST /api/orders/chapters
 * 
 * Create a chapter purchase order
 * Body: { moduleId: string, paymentMethod: 'ESEWA' | 'KHALTI' }
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
    const { moduleId, paymentMethod } = body;

    if (!moduleId || !paymentMethod) {
      return NextResponse.json(
        { error: 'moduleId and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Get module details
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        }
      }
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    if (module.isFreeIntro) {
      return NextResponse.json(
        { error: 'This module is free and does not require purchase' },
        { status: 400 }
      );
    }

    if (!module.chapterPrice || !module.chapterNumber) {
      return NextResponse.json(
        { error: 'This module is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.chapterPurchase.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: module.id
        }
      }
    });

    if (existingPurchase && existingPurchase.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Chapter already purchased' },
        { status: 400 }
      );
    }

    // Create or update chapter purchase
    const chapterPurchase = await prisma.chapterPurchase.upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: module.id
        }
      },
      update: {
        paymentMethod,
        paymentStatus: 'PENDING',
        amount: module.chapterPrice
      },
      create: {
        userId: session.user.id,
        courseId: module.courseId,
        moduleId: module.id,
        chapterNumber: module.chapterNumber,
        amount: module.chapterPrice,
        paymentMethod,
        paymentStatus: 'PENDING'
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
        courseId: module.courseId,
        moduleId: module.id,
        chapterNumber: module.chapterNumber,
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

    // Return payment initiation data
    const response = {
      purchaseId: chapterPurchase.id,
      amount: chapterPurchase.amount,
      currency: 'NPR',
      chapter: {
        number: module.chapterNumber,
        title: module.title
      },
      course: {
        slug: module.course.slug,
        title: module.course.title
      },
      paymentMethod: chapterPurchase.paymentMethod,
      // Payment gateway URLs would be added here
      paymentUrl: `/payment/${paymentMethod.toLowerCase()}?purchaseId=${chapterPurchase.id}`
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
