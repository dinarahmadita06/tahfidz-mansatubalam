import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/siswa/buku-digital
 * Fetch all buku digital and materi tahsin accessible to the student
 * Students can see all materials but cannot create/edit/delete
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

    // Get all buku digital from all gurus (shared resources)
    const bukuDigitalList = await prisma.bukuDigital.findMany({
      select: {
        id: true,
        guruId: true,
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
    });

    // Get all materi tahsin from all gurus (shared resources)
    const materiTahsinList = await prisma.materiTahsin.findMany({
      select: {
        id: true,
        guruId: true,
        judul: true,
        deskripsi: true,
        jenisMateri: true,
        fileUrl: true,
        youtubeUrl: true,
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
    });

    // Transform bukuDigital to match materiTahsin structure with PDF type
    const transformedBukuDigital = bukuDigitalList.map(buku => ({
      id: buku.id,
      guruId: buku.guruId,
      judul: buku.judul,
      deskripsi: buku.deskripsi,
      jenisMateri: 'PDF', // Default type for buku digital
      fileUrl: buku.fileUrl,
      youtubeUrl: null,
      kategori: buku.kategori,
      fileName: buku.fileName,
      fileSize: buku.fileSize,
      createdAt: buku.createdAt,
      guru: buku.guru,
    }));

    // Transform materiTahsin items (they already have the right structure)
    const transformedMateriTahsin = materiTahsinList.map(materi => ({
      id: materi.id,
      guruId: materi.guruId,
      judul: materi.judul,
      deskripsi: materi.deskripsi,
      jenisMateri: materi.jenisMateri,
      fileUrl: materi.fileUrl,
      youtubeUrl: materi.youtubeUrl,
      kategori: materi.jenisMateri === 'YOUTUBE' ? 'YOUTUBE' : 'UMUM', // Use special category for YouTube
      fileName: materi.fileName,
      fileSize: materi.fileSize,
      createdAt: materi.createdAt,
      guru: materi.guru,
    }));

    // Combine both lists
    const allMaterials = [...transformedBukuDigital, ...transformedMateriTahsin];

    // Sort by creation date (newest first)
    allMaterials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      data: allMaterials,
      count: allMaterials.length,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Gagal memuat materi digital', details: error.message },
      { status: 500 }
    );
  }
}
