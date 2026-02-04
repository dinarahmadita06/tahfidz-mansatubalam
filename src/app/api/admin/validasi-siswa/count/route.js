export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count siswa with pending status
    const pendingCount = await prisma.siswa.count({
      where: { status: 'pending' }
    });

    return NextResponse.json({ 
      pending: pendingCount 
    });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch pending count',
      pending: 0 
    }, { status: 500 });
  }
}
