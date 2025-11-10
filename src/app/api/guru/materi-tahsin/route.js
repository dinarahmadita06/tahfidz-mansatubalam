import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch materi tahsin (with optional kelasId filter)
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

    // If kelasId provided, filter by kelas
    if (kelasId) {
      whereClause.kelasId = kelasId;
    }

    // Fetch materi tahsin data
    const materi = await prisma.materiTahsin.findMany({
      where: whereClause,
      include: {
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ materi });
  } catch (error) {
    console.error('Error fetching materi tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new materi tahsin
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
      guruId,
      kelasId,
      judul,
      level,
      jenisMateri,
      fileUrl,
      youtubeUrl,
      deskripsi,
    } = body;

    // Validation
    if (!guruId || !judul || !level || !jenisMateri) {
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

    // Validate jenis materi enum
    const validJenis = ['PDF', 'YOUTUBE', 'VIDEO'];
    if (!validJenis.includes(jenisMateri)) {
      return NextResponse.json(
        { message: 'Jenis materi tidak valid' },
        { status: 400 }
      );
    }

    // Validate required fields based on jenis materi
    if (jenisMateri === 'YOUTUBE') {
      if (!youtubeUrl) {
        return NextResponse.json(
          { message: 'URL YouTube wajib diisi untuk jenis materi YouTube' },
          { status: 400 }
        );
      }
    } else {
      if (!fileUrl) {
        return NextResponse.json(
          { message: 'File wajib diunggah untuk jenis materi PDF atau Video' },
          { status: 400 }
        );
      }
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

    // Create materi tahsin
    const materi = await prisma.materiTahsin.create({
      data: {
        guruId,
        kelasId: kelasId || null,
        judul,
        level,
        jenisMateri,
        fileUrl: fileUrl || null,
        youtubeUrl: youtubeUrl || null,
        deskripsi: deskripsi || null,
      },
      include: {
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
    });

    return NextResponse.json(
      { message: 'Materi tahsin berhasil ditambahkan', materi },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating materi tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
