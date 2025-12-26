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
      orderBy: {
        tanggalDaftar: 'desc',
      },
    });

    // Calculate total juz hafalan from DISTINCT juz in Hafalan table
    const hafalanData = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id,
      },
      select: {
        juz: true,
      },
      distinct: ['juz'],
    });

    const totalJuzHafalan = hafalanData.length;

    // Target juz sekolah (default 3, could be from settings in the future)
    const targetJuzSekolah = 3;

    return NextResponse.json({
      tasmi,
      totalJuzHafalan,
      targetJuzSekolah,
    });
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
    const { jumlahHafalan, juzYangDitasmi, guruId, jamTasmi, tanggalTasmi, catatan } = body;

    // Validation
    if (!jumlahHafalan || !juzYangDitasmi || !jamTasmi || !tanggalTasmi || !guruId) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi (jumlah hafalan, juz yang ditasmi, jam, tanggal, dan guru)' },
        { status: 400 }
      );
    }

    if (jumlahHafalan > 30) {
      return NextResponse.json(
        { message: 'Jumlah hafalan maksimal 30 juz' },
        { status: 400 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      include: {
        kelas: {
          include: {
            guruKelas: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!siswa.kelas) {
      return NextResponse.json(
        { message: 'Anda belum terdaftar di kelas manapun' },
        { status: 400 }
      );
    }

    // Verify that the selected guru exists
    const guruExists = await prisma.guru.findUnique({
      where: { id: guruId },
    });

    if (!guruExists) {
      return NextResponse.json(
        { message: 'Guru yang dipilih tidak valid' },
        { status: 400 }
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
        jumlahHafalan: parseInt(jumlahHafalan),
        juzYangDitasmi,
        jamTasmi,
        tanggalTasmi: new Date(tanggalTasmi),
        guruPengampuId: guruId,
        catatan,
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
        guruPengampu: {
          include: {
            user: {
              select: {
                name: true,
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
