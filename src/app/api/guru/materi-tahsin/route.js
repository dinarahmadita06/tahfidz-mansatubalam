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

    // Get form data for file uploads or JSON for YouTube links
    const contentType = request.headers.get('content-type');
    let formData;
    let judul, jenisMateri, youtubeUrl, deskripsi, kelasId;
    let fileUrl = null;

    if (contentType && contentType.includes('multipart/form-data')) {
      // File upload case
      formData = await request.formData();
      judul = formData.get('judul');
      jenisMateri = formData.get('jenisMateri');
      youtubeUrl = formData.get('youtubeUrl');
      deskripsi = formData.get('deskripsi');
      kelasId = formData.get('kelasId');

      // Handle file upload if it's not YouTube
      if (jenisMateri !== 'YOUTUBE') {
        const file = formData.get('file');
        
        // Validate required fields
        if (!file || !judul || !jenisMateri) {
          return NextResponse.json(
            { message: 'File, judul, dan jenis materi harus diisi.' },
            { status: 400 }
          );
        }

        // Validate file type based on jenisMateri
        if (jenisMateri === 'PDF' && file.type !== 'application/pdf') {
          return NextResponse.json(
            { message: 'Hanya file PDF yang diterima untuk jenis materi PDF.' },
            { status: 400 }
          );
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          return NextResponse.json(
            { message: 'Ukuran file terlalu besar. Maksimal 50MB.' },
            { status: 400 }
          );
        }

        // Upload file to Vercel Blob
        const { put } = await import('@vercel/blob');
        const fileName = `materi-tahsin-${Date.now()}-${file.name}`;
        const blob = await put(fileName, file, {
          access: 'public',
          contentType: file.type
        });
        
        fileUrl = blob.url;
      }
    } else {
      // JSON case (for YouTube links)
      const body = await request.json();
      judul = body.judul;
      jenisMateri = body.jenisMateri;
      youtubeUrl = body.youtubeUrl;
      deskripsi = body.deskripsi;
      kelasId = body.kelasId;
      fileUrl = body.fileUrl;

      // Validate required fields
      if (!judul || !jenisMateri) {
        return NextResponse.json(
          { message: 'Judul dan jenis materi harus diisi.' },
          { status: 400 }
        );
      }
    }

    // Validate jenis materi enum
    const validJenis = ['PDF', 'YOUTUBE'];
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
          { message: 'File wajib diunggah untuk jenis materi selain YouTube' },
          { status: 400 }
        );
      }
    }

    // Get guru from session
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create materi tahsin
    const materi = await prisma.materiTahsin.create({
      data: {
        guruId: guru.id,  // Use guru.id from session
        kelasId: kelasId || null,
        judul,
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
