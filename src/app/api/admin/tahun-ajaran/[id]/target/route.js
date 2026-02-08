export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { invalidateCache } from '@/lib/cache';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { targetHafalan } = body;

    // Validasi input
    if (targetHafalan === undefined || targetHafalan === null) {
      return NextResponse.json(
        { error: 'Target hafalan harus diisi' },
        { status: 400 }
      );
    }

    const numTarget = parseInt(targetHafalan);
    if (isNaN(numTarget) || numTarget < 1 || numTarget > 30) {
      return NextResponse.json(
        { error: 'Target hafalan harus antara 1-30 juz' },
        { status: 400 }
      );
    }

    // Cek tahun ajaran aktif
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id }
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!tahunAjaran.isActive) {
      return NextResponse.json(
        { error: 'Hanya tahun ajaran aktif yang dapat diperbarui' },
        { status: 400 }
      );
    }

    // Update target hafalan
    const updated = await prisma.tahunAjaran.update({
      where: { id },
      data: {
        targetHafalan: numTarget
      }
    });

    // Invalidate all related caches so dashboard shows updated target immediately
    invalidateCache('admin-tahun-ajaran-list');
    invalidateCache('admin-tahun-ajaran-summary');
    invalidateCache('admin-dashboard-summary'); // Dashboard cache
    invalidateCache('kelas-list'); // Kelas list cache (affects target juz on kelas)
    invalidateCache('tahun-ajaran-list'); // Public tahun ajaran list cache

    return NextResponse.json({
      success: true,
      message: 'Target hafalan berhasil diperbarui',
      data: updated
    });

  } catch (error) {
    console.error('Error updating target hafalan:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui target hafalan', details: error.message },
      { status: 500 }
    );
  }
}
