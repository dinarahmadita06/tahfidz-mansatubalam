import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/siswa/buku-digital
 * Fetch buku digital accessible to the current student
 * ✅ Students can ONLY see materials from:
 *   1. Their own class (siswa.kelasId)
 *   2. Teachers who teach their class (via GuruKelas)
 * ✅ Prevents data leakage between classes
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Get student from session
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { id: true, kelasId: true }
    });

    if (!siswa || !siswa.kelasId) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Siswa tidak memiliki kelas yang ditugaskan'
      });
    }

    // ✅ Get all teachers who teach this student's class
    const teachersInClass = await prisma.guruKelas.findMany({
      where: {
        kelasId: siswa.kelasId,
        isActive: true
      },
      select: { guruId: true }
    });

    const guruIds = teachersInClass.map(gk => gk.guruId);

    // ✅ Get buku digital ONLY from:
    //    - classId matches student's class
    //    - uploaded by teachers who teach that class
    const bukuDigitalList = await prisma.bukuDigital.findMany({
      where: {
        classId: siswa.kelasId,
        guruId: { in: guruIds }
      },
      select: {
        id: true,
        guruId: true,
        classId: true,
        judul: true,
        deskripsi: true,
        kategori: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        guru: {
          select: {
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

    // Transform to match expected format (add jenisMateri)
    const transformedBukuDigital = bukuDigitalList.map(buku => ({
      id: buku.id,
      guruId: buku.guruId,
      judul: buku.judul,
      deskripsi: buku.deskripsi,
      jenisMateri: 'PDF',
      fileUrl: buku.fileUrl,
      youtubeUrl: null,
      kategori: buku.kategori,
      fileName: buku.fileName,
      fileSize: buku.fileSize,
      createdAt: buku.createdAt,
      guru: buku.guru,
    }));

    return NextResponse.json({
      success: true,
      data: transformedBukuDigital,
      count: transformedBukuDigital.length,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Gagal memuat materi digital', details: error.message },
      { status: 500 }
    );
  }
}
