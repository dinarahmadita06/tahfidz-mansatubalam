export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// GET - Fetch all tasmi registrations (for Guru ONLY - includes full grading data)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Find the Guru profile ID for filtering
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!guru) {
      return NextResponse.json({ tasmi: [] });
    }

    // Build where clause with filters
    const whereClause = {
      guruPengampuId: guru.id
    };

    // Filter by kelas (WAJIB untuk isolasi data per kelas)
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      };
    }

    // Filter by status
    if (status && status !== 'ALL') {
      whereClause.statusPendaftaran = status;
    }

    // Search by siswa name
    if (search) {
      if (!whereClause.siswa) {
        whereClause.siswa = {};
      }
      whereClause.siswa.user = {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      };
    }

    // Fetch tasmi registrations where THIS guru is the chosen pengampu
    const tasmiList = await prisma.tasmi.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
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
      orderBy: {
        tanggalDaftar: 'desc',
      },
    });

    console.log(`[DEBUG/TASMI] API GET Guru ${guru.id}: ${tasmiList.length} records found`);

    return NextResponse.json({ tasmi: tasmiList });
  } catch (error) {
    console.error('Error fetching tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
