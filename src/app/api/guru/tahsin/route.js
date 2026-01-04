import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

// GET - Fetch tahsin data (with optional kelasId filter)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Build where clause
    const whereClause = {
      guruId: guru.id,
    };

    // If kelasId provided, filter by siswa in that kelas
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId,
      };
    }

    // Fetch tahsin data
    const tahsin = await prisma.tahsin.findMany({
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
        guru: {
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
        tanggal: 'desc',
      },
    });

    return NextResponse.json({ tahsin });
  } catch (error) {
    console.error('Error fetching tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new tahsin
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      siswaId,
      guruId,
      tanggal,
      level,
      materiHariIni,
      bacaanDipraktikkan,
      catatan,
      statusPembelajaran,
    } = body;

    // Validation
    if (!siswaId || !guruId || !tanggal || !level || !materiHariIni || !bacaanDipraktikkan || !statusPembelajaran) {
      return NextResponse.json(
        { message: 'Data tidak lengkap. Pastikan semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Validate level enum
    const validLevels = ['DASAR', 'MENENGAH', 'LANJUTAN'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { message: 'Level tidak valid' },
        { status: 400 }
      );
    }

    // Validate status pembelajaran enum
    const validStatus = ['LANJUT', 'PERBAIKI'];
    if (!validStatus.includes(statusPembelajaran)) {
      return NextResponse.json(
        { message: 'Status pembelajaran tidak valid' },
        { status: 400 }
      );
    }

    // Verify guru ownership
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru || guru.id !== guruId) {
      return NextResponse.json(
        { message: 'Unauthorized - Guru tidak valid' },
        { status: 401 }
      );
    }

    // Create tahsin
    const tahsin = await prisma.tahsin.create({
      data: {
        siswaId,
        guruId,
        tanggal: new Date(tanggal),
        level,
        materiHariIni,
        bacaanDipraktikkan,
        catatan: catatan || null,
        statusPembelajaran,
      },
      include: {
        siswa: {
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

    // Log activity - Input Tahsin
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_INPUT_TAHSIN,
      title: 'Input hasil tahsin',
      description: `Input tahsin untuk ${tahsin.siswa.user.name} - Level ${level}`,
      targetUserId: siswaId,
      targetRole: 'SISWA',
      targetName: tahsin.siswa.user.name,
      metadata: {
        tahsinId: tahsin.id,
        level,
        statusPembelajaran,
        tanggal: tahsin.tanggal,
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json(
      { message: 'Tahsin berhasil ditambahkan', tahsin },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
