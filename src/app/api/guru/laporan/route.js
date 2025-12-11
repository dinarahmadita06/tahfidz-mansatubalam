import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const kelasId = searchParams.get('kelasId');
    const siswaId = searchParams.get('siswaId');

    // Build where clause
    let whereClause = {
      guruId: session.user.guruId
    };

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Add kelas filter if provided
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      };
    }

    // Add siswa filter if provided
    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    const laporan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true
              }
            },
            kelas: {
              select: {
                nama: true
              }
            }
          }
        },
        // Removed surah: true since surah is a string field, not a relation
        penilaian: true
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan' },
      { status: 500 }
    );
  }
}
