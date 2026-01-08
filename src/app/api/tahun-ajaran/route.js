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
      select: {
        id: true,
        nama: true,
        semester: true,
        isActive: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        targetHafalan: true
      },
      orderBy: [
        { isActive: 'desc' },
        { tanggalMulai: 'desc' }
      ]
    });

    return NextResponse.json({ data: tahunAjaran });
  } catch (error) {
    console.error('Error fetching tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tahun ajaran' },
      { status: 500 }
    );
  }
}
