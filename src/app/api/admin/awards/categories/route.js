export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.awardCategory.findMany({
      orderBy: { categoryName: 'asc' }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
