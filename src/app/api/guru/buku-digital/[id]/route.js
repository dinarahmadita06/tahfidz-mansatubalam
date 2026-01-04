import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

// GET - Fetch single buku digital
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const bukuDigital = await prisma.bukuDigital.findUnique({
      where: { id },
      include: {
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!bukuDigital) {
      return NextResponse.json(
        { error: 'Buku digital tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bukuDigital
    });
  } catch (error) {
    console.error('Error fetching buku digital:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buku digital' },
      { status: 500 }
    );
  }
}

// DELETE - Delete buku digital
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get buku digital to verify ownership and get details for logging
    const bukuDigital = await prisma.bukuDigital.findUnique({
      where: { id },
      include: {
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    });

    if (!bukuDigital) {
      return NextResponse.json(
        { error: 'Buku digital tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify ownership - guru can only delete their own books
    if (bukuDigital.guru.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk menghapus buku ini' },
        { status: 403 }
      );
    }

    // Delete the buku digital
    await prisma.bukuDigital.delete({
      where: { id }
    });

    // ✅ Log activity - Delete buku digital
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_HAPUS_BUKU_DIGITAL,
      title: 'Hapus buku digital',
      description: `Menghapus buku digital "${bukuDigital.judul}"`,
      metadata: {
        bukuId: bukuDigital.id,
        judul: bukuDigital.judul,
        kategori: bukuDigital.kategori,
        fileName: bukuDigital.fileName,
        deletedAt: new Date().toISOString(),
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json({
      success: true,
      message: 'Buku digital berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting buku digital:', error);
    return NextResponse.json(
      { error: 'Failed to delete buku digital', details: error.message },
      { status: 500 }
    );
  }
}
