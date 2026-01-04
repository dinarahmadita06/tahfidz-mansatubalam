import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

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
      level,
      materiHariIni,
      bacaanDipraktikkan,
      catatan,
      statusPembelajaran,
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

    // Validation for level if provided
    if (level) {
      const validLevels = ['DASAR', 'MENENGAH', 'LANJUTAN'];
      if (!validLevels.includes(level)) {
        return NextResponse.json(
          { message: 'Level tidak valid' },
          { status: 400 }
        );
      }
    }

    // Validation for status pembelajaran if provided
    if (statusPembelajaran) {
      const validStatus = ['LANJUT', 'PERBAIKI'];
      if (!validStatus.includes(statusPembelajaran)) {
        return NextResponse.json(
          { message: 'Status pembelajaran tidak valid' },
          { status: 400 }
        );
      }
    }

    // Update tahsin
    const tahsin = await prisma.tahsin.update({
      where: { id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : undefined,
        level: level || undefined,
        materiHariIni: materiHariIni || undefined,
        bacaanDipraktikkan: bacaanDipraktikkan || undefined,
        catatan: catatan !== undefined ? catatan : undefined,
        statusPembelajaran: statusPembelajaran || undefined,
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

    // Log activity - Edit Tahsin
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_EDIT_TAHSIN,
      title: 'Edit hasil tahsin',
      description: `Edit tahsin untuk ${existingTahsin.siswa.user.name} - Level ${level || existingTahsin.level}`,
      targetUserId: existingTahsin.siswaId,
      targetRole: 'SISWA',
      targetName: existingTahsin.siswa.user.name,
      metadata: {
        tahsinId: tahsin.id,
        level: level || existingTahsin.level,
        statusPembelajaran: statusPembelajaran || existingTahsin.statusPembelajaran,
      },
    }).catch(err => console.error('Activity log error:', err));

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

    // Log activity - Hapus Tahsin
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_HAPUS_TAHSIN,
      title: 'Hapus data tahsin',
      description: `Menghapus tahsin untuk ${existingTahsin.siswa.user.name}`,
      targetUserId: existingTahsin.siswaId,
      targetRole: 'SISWA',
      targetName: existingTahsin.siswa.user.name,
      metadata: {
        tahsinId: existingTahsin.id,
        level: existingTahsin.level,
        deletedAt: new Date(),
      },
    }).catch(err => console.error('Activity log error:', err));

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
