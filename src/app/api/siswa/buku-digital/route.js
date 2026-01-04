import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/siswa/buku-digital
 * Fetch all buku digital accessible to the student
 * Students can see all buku digital but cannot create/edit/delete
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
    // Students can view all books in the system
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: bukuDigitalList,
      count: bukuDigitalList.length,
    });
  } catch (error) {
    console.error('Error fetching buku digital:', error);
    return NextResponse.json(
      { error: 'Gagal memuat buku digital', details: error.message },
      { status: 500 }
    );
  }
}
