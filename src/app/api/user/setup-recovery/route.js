import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateRecoveryCode, hashRecoveryCode, formatRecoveryCode } from '@/lib/recovery';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new code
    const rawCode = generateRecoveryCode();
    const hashedCode = await hashRecoveryCode(rawCode);

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        recoveryCodeHash: hashedCode,
        isRecoveryCodeSetup: true
      }
    });

    return NextResponse.json({
      success: true,
      recoveryCode: formatRecoveryCode(rawCode),
      message: 'Recovery code generated successfully'
    });
  } catch (error) {
    console.error('Error setting up recovery code:', error);
    return NextResponse.json({ error: 'Failed to setup recovery code' }, { status: 500 });
  }
}
