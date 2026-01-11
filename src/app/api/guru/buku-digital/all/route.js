export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/guru/buku-digital/all
 * Fetch all buku digital for classes the guru teaches
 * (NOT all materials in the system - only for their classes)
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

    // ✅ Get guru from session
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // ✅ Get classes this guru teaches
    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guruId: guru.id,
        isActive: true
      },
      select: { kelasId: true }
    });

    const classIds = guruKelas.map(gk => gk.kelasId);

    // ✅ Get materials only from classes this guru teaches
    // (uploaded by ANY guru, not just themselves)
    const bukuDigitalList = await prisma.bukuDigital.findMany({
      where: {
        classId: { in: classIds }
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
        kelas: {
          select: {
            nama: true,
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