import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Approving all parent accounts...');

    // 1. Approve all pending parents
    const orangtuaResult = await prisma.orangTua.updateMany({
      where: { status: 'pending' },
      data: { status: 'approved' },
    });

    // 2. Activate all parent users
    const userResult = await prisma.user.updateMany({
      where: { role: 'ORANG_TUA' },
      data: { isActive: true },
    });

    // 3. Count active parents
    const activeParents = await prisma.orangTua.count({
      where: { 
        status: 'approved',
        user: { isActive: true }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'All parent accounts approved',
      data: {
        approvedParents: orangtuaResult.count,
        activatedUsers: userResult.count,
        totalActiveParents: activeParents
      }
    });

  } catch (error) {
    console.error('Error approving parents:', error);
    return NextResponse.json(
      { error: 'Failed to approve parent accounts', details: error.message },
      { status: 500 }
    );
  }
}
