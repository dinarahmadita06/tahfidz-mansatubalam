export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch tasmi results for certificate management
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya koordinator yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isPassed = searchParams.get('isPassed');
    const assessed = searchParams.get('assessed');
    const kelasId = searchParams.get('kelasId');
    const query = searchParams.get('query');
    const periode = searchParams.get('periode'); // Year
    const jenisKelamin = searchParams.get('jenisKelamin');

    // Build where clause
    const whereClause = {
      statusPendaftaran: 'SELESAI',
    };

    if (isPassed === 'true') {
      whereClause.isPassed = true;
    } else if (isPassed === 'false') {
      whereClause.isPassed = false;
    }

    if (assessed === 'true') {
      whereClause.assessedAt = { not: null };
    }

    if (periode) {
      const year = parseInt(periode);
      whereClause.tanggalUjian = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    if (kelasId || jenisKelamin || query) {
      whereClause.siswa = {};
      
      if (kelasId) {
        whereClause.siswa.kelasId = kelasId;
      }
      
      if (jenisKelamin) {
        whereClause.siswa.jenisKelamin = jenisKelamin;
      }
      
      if (query) {
        whereClause.siswa.user = {
          name: { contains: query, mode: 'insensitive' },
        };
      }
    }

    const tasmiResults = await prisma.tasmi.findMany({
      where: whereClause,
      include: {
        siswa: {
          select: {
            id: true,
            nisn: true,
            jenisKelamin: true,
            user: {
              select: {
                name: true,
              },
            },
            kelas: {
              select: {
                nama: true,
              },
            },
          },
        },
        guruPenguji: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        certificate: true,
      },
      orderBy: {
        assessedAt: 'desc',
      },
    });

    return NextResponse.json({ tasmiResults });
  } catch (error) {
    console.error('Error fetching tasmi results:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
