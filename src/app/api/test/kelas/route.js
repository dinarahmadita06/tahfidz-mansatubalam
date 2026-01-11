export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all kelas without any filter
    const allKelas = await prisma.kelas.findMany({
      include: {
        tahunAjaran: {
          select: {
            nama: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            siswa: true,
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    return NextResponse.json({
      message: 'Test endpoint untuk cek semua kelas di database',
      totalKelas: allKelas.length,
      kelas: allKelas,
      user: {
        name: session.user.name,
        role: session.user.role,
        guruId: session.user.guruId
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kelas', details: error.message },
      { status: 500 }
    );
  }
}
