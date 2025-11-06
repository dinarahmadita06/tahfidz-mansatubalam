import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch siswa's own tasmi history
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Fetch tasmi history
    const tasmi = await prisma.tasmi.findMany({
      where: {
        siswaId: siswa.id,
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

// POST - Register for tasmi
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jumlahJuz } = body;

    // Validation
    if (!jumlahJuz || jumlahJuz < 2) {
      return NextResponse.json(
        { message: 'Minimal hafalan 2 juz untuk mendaftar Tasmi\'' },
        { status: 400 }
      );
    }

    if (jumlahJuz > 30) {
      return NextResponse.json(
        { message: 'Jumlah juz maksimal 30' },
        { status: 400 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if already has pending tasmi
    const pendingTasmi = await prisma.tasmi.findFirst({
      where: {
        siswaId: siswa.id,
        statusPendaftaran: 'MENUNGGU',
      },
    });

    if (pendingTasmi) {
      return NextResponse.json(
        { message: 'Anda masih memiliki pendaftaran yang menunggu verifikasi' },
        { status: 400 }
      );
    }

    // Create tasmi registration
    const tasmi = await prisma.tasmi.create({
      data: {
        siswaId: siswa.id,
        jumlahJuz: parseInt(jumlahJuz),
        statusPendaftaran: 'MENUNGGU',
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
      },
    });

    return NextResponse.json(
      { message: 'Pendaftaran Tasmi\' berhasil', tasmi },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
