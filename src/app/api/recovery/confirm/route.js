import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/recovery/confirm
 * Mark recovery code onboarding as completed
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Update user to mark recovery onboarding as completed
    await prisma.user.update({
      where: { id: userId },
      data: {
        recoveryOnboardingCompleted: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Recovery onboarding completed'
    });

  } catch (error) {
    console.error('Error confirming recovery setup:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
