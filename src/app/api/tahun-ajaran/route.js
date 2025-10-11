import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tahunAjaran = await prisma.tahunAjaran.findMany({
      orderBy: [
        { isActive: 'desc' },
        { tanggalMulai: 'desc' }
      ],
      include: {
        _count: {
          select: {
            kelas: true
          }
        }
      }
    });

    return NextResponse.json(tahunAjaran);
  } catch (error) {
    console.error('Error fetching tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tahun ajaran' },
      { status: 500 }
    );
  }
}
