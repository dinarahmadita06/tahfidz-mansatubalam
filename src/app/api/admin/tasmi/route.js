import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all tasmi for admin/coordinator
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
    const status = searchParams.get('status'); // Filter by status
    const bulan = searchParams.get('bulan'); // Filter by month
    const tahun = searchParams.get('tahun'); // Filter by year

    // Build where clause
    const whereClause = {};

    if (status) {
      whereClause.statusPendaftaran = status;
    }

    // Filter by month and year for tanggalUjian
    if (bulan && tahun) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0, 23, 59, 59);

      whereClause.tanggalUjian = {
        gte: startDate,
        lte: endDate,
      };
    } else if (tahun) {
      const startDate = new Date(parseInt(tahun), 0, 1);
      const endDate = new Date(parseInt(tahun), 11, 31, 23, 59, 59);

      whereClause.tanggalUjian = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Fetch all tasmi
    const tasmi = await prisma.tasmi.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            kelas: {
              select: {
                nama: true,
              },
            },
          },
        },
        guruPengampu: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        guruVerifikasi: {
          include: {
            user: {
              select: {
                name: true,
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
      },
      orderBy: [
        { tanggalUjian: 'asc' },
        { tanggalDaftar: 'desc' },
      ],
    });

    return NextResponse.json({ tasmi });
  } catch (error) {
    console.error('Error fetching tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
