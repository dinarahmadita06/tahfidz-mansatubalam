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

    // Find the Guru profile ID for filtering
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!guru) {
      return NextResponse.json({ tasmi: [] });
    }

    // Fetch tasmi registrations where THIS guru is the chosen pengampu
    const tasmiList = await prisma.tasmi.findMany({
      where: {
        guruPengampuId: guru.id
      },
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
