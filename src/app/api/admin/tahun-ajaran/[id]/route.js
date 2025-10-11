import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// PUT - Update tahun ajaran
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, semester, tanggalMulai, tanggalSelesai, isActive } = body;

    // Check if tahun ajaran exists
    const existing = await prisma.tahunAjaran.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // If setting this as active, deactivate other active tahun ajaran
    if (isActive && !existing.isActive) {
      await prisma.tahunAjaran.updateMany({
        where: {
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    // Prepare update data
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (semester !== undefined) updateData.semester = semester;
    if (tanggalMulai !== undefined) updateData.tanggalMulai = new Date(tanggalMulai);
    if (tanggalSelesai !== undefined) updateData.tanggalSelesai = new Date(tanggalSelesai);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update tahun ajaran
    const updated = await prisma.tahunAjaran.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            kelas: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'UPDATE',
      module: 'TAHUN_AJARAN',
      description: `Mengupdate data tahun ajaran ${updated.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        tahunAjaranId: updated.id,
        isActive: updated.isActive
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate tahun ajaran' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tahun ajaran
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id },
      include: {
        kelas: true
      }
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if tahun ajaran has kelas
    if (tahunAjaran.kelas.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus tahun ajaran yang memiliki kelas' },
        { status: 400 }
      );
    }

    // Store data for logging
    const tahunAjaranNama = tahunAjaran.nama;

    // Delete tahun ajaran
    await prisma.tahunAjaran.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'TAHUN_AJARAN',
      description: `Menghapus tahun ajaran ${tahunAjaranNama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        deletedTahunAjaranId: id,
        deletedTahunAjaranNama: tahunAjaranNama
      }
    });

    return NextResponse.json({ message: 'Tahun ajaran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus tahun ajaran' },
      { status: 500 }
    );
  }
}
