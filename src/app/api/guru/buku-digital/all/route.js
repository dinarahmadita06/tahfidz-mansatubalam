import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/guru/buku-digital/all
 * Fetch all buku digital from all gurus for the guru dashboard
 * Gurus can see all materials in the system
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
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
    console.error('Error fetching all buku digital:', error);
    return NextResponse.json(
      { error: 'Gagal memuat buku digital', details: error.message },
      { status: 500 }
    );
  }
}