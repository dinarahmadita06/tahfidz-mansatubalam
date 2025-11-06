import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch tasmi data for a specific child
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANGTUA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya orang tua yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get anakId from query params
    const { searchParams } = new URL(request.url);
    const anakId = searchParams.get('anakId');

    if (!anakId) {
      return NextResponse.json(
        { message: 'anakId diperlukan' },
        { status: 400 }
      );
    }

    // Verify that this child belongs to this parent
    const orangtua = await prisma.orangTua.findUnique({
      where: { userId: session.user.id },
      include: {
        anak: {
          where: { id: anakId },
        },
      },
    });

    if (!orangtua || orangtua.anak.length === 0) {
      return NextResponse.json(
        { message: 'Anak tidak ditemukan atau bukan anak Anda' },
        { status: 404 }
      );
    }

    // Fetch tasmi data for this child
    const tasmi = await prisma.tasmi.findMany({
      where: {
        siswaId: anakId,
      },
      include: {
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

    return NextResponse.json({ tasmi });
  } catch (error) {
    console.error('Error fetching tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
