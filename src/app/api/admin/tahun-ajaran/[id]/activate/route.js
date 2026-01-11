export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id }
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if already active
    if (tahunAjaran.isActive) {
      return NextResponse.json(
        { error: 'Tahun ajaran sudah aktif' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const updatedTahunAjaran = await prisma.$transaction(async (tx) => {
      // 1. Deactivate all other active tahun ajaran
      await tx.tahunAjaran.updateMany({
        where: {
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });

      // 2. Activate the selected tahun ajaran
      return await tx.tahunAjaran.update({
        where: { id },
        data: { isActive: true },
        include: {
          _count: {
            select: {
              kelas: true
            }
          }
        }
      });
    });

    // Invalidate cache
    invalidateCache('admin-tahun-ajaran-list');
    invalidateCache('admin-tahun-ajaran-summary');

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'UPDATE',
      module: 'TAHUN_AJARAN',
      description: `Mengaktifkan tahun ajaran ${updatedTahunAjaran.nama} - Semester ${updatedTahunAjaran.semester}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        tahunAjaranId: updatedTahunAjaran.id,
        previousStatus: 'inactive',
        newStatus: 'active'
      }
    });

    return NextResponse.json({
      message: 'Tahun ajaran berhasil diaktifkan',
      data: updatedTahunAjaran
    });
  } catch (error) {
    console.error('Error activating tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Gagal mengaktifkan periode', details: error.message },
      { status: 500 }
    );
  }
}
