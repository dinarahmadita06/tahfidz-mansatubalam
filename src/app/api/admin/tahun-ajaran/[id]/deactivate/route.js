export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

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

    // Check if already inactive
    if (!tahunAjaran.isActive) {
      return NextResponse.json(
        { error: 'Tahun ajaran sudah dalam status nonaktif' },
        { status: 400 }
      );
    }

    // Deactivate the tahun ajaran
    const updatedTahunAjaran = await prisma.tahunAjaran.update({
      where: { id },
      data: { isActive: false }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'UPDATE',
      module: 'TAHUN_AJARAN',
      description: `Menonaktifkan tahun ajaran ${updatedTahunAjaran.nama} - Semester ${updatedTahunAjaran.semester}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        tahunAjaranId: updatedTahunAjaran.id,
        previousStatus: 'active',
        newStatus: 'inactive'
      }
    });

    return NextResponse.json({
      message: 'Tahun ajaran berhasil dinonaktifkan',
      data: updatedTahunAjaran
    });
  } catch (error) {
    console.error('Error deactivating tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Gagal menonaktifkan tahun ajaran' },
      { status: 500 }
    );
  }
}
