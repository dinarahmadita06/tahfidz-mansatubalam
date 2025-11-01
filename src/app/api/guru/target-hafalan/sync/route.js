import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Sinkronkan target kelas dengan target sekolah
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari data guru
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { success: false, message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ambil kelas yang diampu guru (yang aktif)
    const guruKelas = await prisma.guruKelas.findFirst({
      where: {
        guruId: guru.id,
        isActive: true
      },
      include: {
        kelas: true
      }
    });

    if (!guruKelas) {
      return NextResponse.json(
        { success: false, message: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Target sekolah default adalah 2 juz
    const targetSekolah = 2;

    // Update target kelas ke target sekolah
    const updatedKelas = await prisma.kelas.update({
      where: { id: guruKelas.kelasId },
      data: {
        targetJuz: targetSekolah
      }
    });

    return NextResponse.json({
      success: true,
      message: `Target kelas berhasil disinkronkan ke ${targetSekolah} juz`,
      data: updatedKelas
    });

  } catch (error) {
    console.error('Error syncing target:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyinkronkan target' },
      { status: 500 }
    );
  }
}
