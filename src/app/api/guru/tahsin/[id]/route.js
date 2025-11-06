import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Update tahsin
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const {
      tanggal,
      surah,
      ayat,
      tajwid,
      makhraj,
      kelancaran,
      rataRata,
      catatan,
    } = body;

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

    // Check if tahsin exists and belongs to this guru
    const existingTahsin = await prisma.tahsin.findUnique({
      where: { id },
    });

    if (!existingTahsin) {
      return NextResponse.json(
        { message: 'Data tahsin tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingTahsin.guruId !== guru.id) {
      return NextResponse.json(
        { message: 'Unauthorized - Anda tidak dapat mengedit tahsin ini' },
        { status: 403 }
      );
    }

    // Validation
    if (
      typeof tajwid !== 'number' ||
      typeof makhraj !== 'number' ||
      typeof kelancaran !== 'number' ||
      tajwid < 0 ||
      tajwid > 100 ||
      makhraj < 0 ||
      makhraj > 100 ||
      kelancaran < 0 ||
      kelancaran > 100
    ) {
      return NextResponse.json(
        { message: 'Nilai harus antara 0-100' },
        { status: 400 }
      );
    }

    // Update tahsin
    const tahsin = await prisma.tahsin.update({
      where: { id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : undefined,
        surah: surah || undefined,
        ayat: ayat ? parseInt(ayat) : undefined,
        tajwid,
        makhraj,
        kelancaran,
        rataRata,
        catatan,
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

    return NextResponse.json({
      message: 'Tahsin berhasil diperbarui',
      tahsin,
    });
  } catch (error) {
    console.error('Error updating tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete tahsin
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params;

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

    // Check if tahsin exists and belongs to this guru
    const existingTahsin = await prisma.tahsin.findUnique({
      where: { id },
    });

    if (!existingTahsin) {
      return NextResponse.json(
        { message: 'Data tahsin tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingTahsin.guruId !== guru.id) {
      return NextResponse.json(
        { message: 'Unauthorized - Anda tidak dapat menghapus tahsin ini' },
        { status: 403 }
      );
    }

    // Delete tahsin
    await prisma.tahsin.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Tahsin berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
