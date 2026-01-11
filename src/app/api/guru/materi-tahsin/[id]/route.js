export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Delete materi tahsin
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

    // Check if materi exists and belongs to this guru
    const existingMateri = await prisma.materiTahsin.findUnique({
      where: { id },
    });

    if (!existingMateri) {
      return NextResponse.json(
        { message: 'Data materi tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingMateri.guruId !== guru.id) {
      return NextResponse.json(
        { message: 'Unauthorized - Anda tidak dapat menghapus materi ini' },
        { status: 403 }
      );
    }

    // Delete materi tahsin
    await prisma.materiTahsin.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Materi tahsin berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting materi tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
