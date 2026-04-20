import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@colonels-academy/database';
import { getServerSession } from '@/lib/auth';

/**
 * POST /api/orders/bundles
 * 
 * Create a bundle purchase order
 * Body: { bundleOfferId: string, paymentMethod: 'ESEWA' | 'KHALTI' }
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
    const { bundleOfferId, paymentMethod } = body;

    if (!bundleOfferId || !paymentMethod) {
      return NextResponse.json(
        { error: 'bundleOfferId and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Get bundle offer details
    const bundleOffer = await prisma.courseBundleOffer.findUnique({
      where: { id: bundleOfferId },
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

    if (!bundleOffer) {
      return NextResponse.json(
        { error: 'Bundle offer not found' },
        { status: 404 }
      );
    }

    if (!bundleOffer.isActive) {
      return NextResponse.json(
        { error: 'This bundle offer is no longer active' },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.bundlePurchase.findUnique({
      where: {
        userId_bundleOfferId: {
          userId: session.user.id,
          bundleOfferId: bundleOffer.id
        }
      }
    });

    if (existingPurchase && existingPurchase.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Bundle already purchased' },
        { status: 400 }
      );
    }

    // Create or update bundle purchase
    const bundlePurchase = await prisma.bundlePurchase.upsert({
      where: {
        userId_bundleOfferId: {
          userId: session.user.id,
          bundleOfferId: bundleOffer.id
        }
      },
      update: {
        paymentMethod,
        paymentStatus: 'PENDING',
        amount: bundleOffer.bundlePrice
      },
      create: {
        userId: session.user.id,
        bundleOfferId: bundleOffer.id,
        courseId: bundleOffer.courseId,
        amount: bundleOffer.bundlePrice,
        paymentMethod,
        paymentStatus: 'PENDING',
        chaptersUnlocked: bundleOffer.includedChapters
      }
    });

    // Return payment initiation data
    const response = {
      purchaseId: bundlePurchase.id,
      amount: bundlePurchase.amount,
      currency: 'NPR',
      bundle: {
        type: bundleOffer.bundleType,
        title: bundleOffer.title,
        chaptersIncluded: bundleOffer.includedChapters as number[]
      },
      course: {
        slug: bundleOffer.course.slug,
        title: bundleOffer.course.title
      },
      paymentMethod: bundlePurchase.paymentMethod,
      // Payment gateway URLs would be added here
      paymentUrl: `/payment/${paymentMethod.toLowerCase()}?purchaseId=${bundlePurchase.id}&type=bundle`
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating bundle purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
