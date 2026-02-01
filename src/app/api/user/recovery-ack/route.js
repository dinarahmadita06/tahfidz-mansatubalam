import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Update user to mark recovery code as acknowledged/setup
    await prisma.user.update({
      where: { id: userId },
      data: {
        isRecoveryCodeSetup: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Recovery code acknowledged successfully' 
    });
    
  } catch (error) {
    console.error('Recovery ACK error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge recovery code' },
      { status: 500 }
    );
  }
}
