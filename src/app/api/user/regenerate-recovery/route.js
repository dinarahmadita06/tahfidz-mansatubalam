import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // Generate new 9-digit recovery code
    const newRecoveryCode = Math.floor(100000000 + Math.random() * 900000000).toString();
    const hashedCode = await bcrypt.hash(newRecoveryCode, 10);

    // Reset recovery code setup flag so modal will show again
    await prisma.user.update({
      where: { id: userId },
      data: {
        recoveryCodeHash: hashedCode,
        isRecoveryCodeSetup: false, // Trigger modal again
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Recovery code regenerated successfully',
      // Don't return the code, it will be shown in modal
    });
    
  } catch (error) {
    console.error('Recovery regenerate error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate recovery code' },
      { status: 500 }
    );
  }
}
