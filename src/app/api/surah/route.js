export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const surah = await prisma.surah.findMany({
      orderBy: {
        nomor: 'asc',
      },
    });

    return NextResponse.json(surah);
  } catch (error) {
    console.error('Error fetching surah:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surah' },
      { status: 500 }
    );
  }
}
