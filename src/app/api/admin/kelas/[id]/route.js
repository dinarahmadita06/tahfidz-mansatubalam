import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// PUT - Update kelas
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, tingkat, tahunAjaranId, targetJuz } = body;

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id }
    });

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if tahun ajaran exists if provided
    if (tahunAjaranId) {
      const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id: tahunAjaranId }
      });

      if (!tahunAjaran) {
        return NextResponse.json(
          { error: 'Tahun ajaran tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    // Update kelas
    const updatedKelas = await prisma.kelas.update({
      where: { id },
      data: {
        nama,
        tingkat,
        tahunAjaranId,
        targetJuz
      },
      include: {
        tahunAjaran: {
          select: {
            nama: true,
            semester: true
          }
        },
        _count: {
          select: {
            siswa: true
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
      module: 'KELAS',
      description: `Mengupdate data kelas ${updatedKelas.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: updatedKelas.id
      }
    });

    return NextResponse.json(updatedKelas);
  } catch (error) {
    console.error('Error updating kelas:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate kelas' },
      { status: 500 }
    );
  }
}

// DELETE - Delete kelas
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        siswa: true,
        guruKelas: true,
        hafalan: true
      }
    });

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if kelas has students
    if (kelas.siswa.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas yang memiliki siswa' },
        { status: 400 }
      );
    }

    // Check if kelas has hafalan records
    if (kelas.hafalan.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas yang memiliki data hafalan' },
        { status: 400 }
      );
    }

    // Store data for logging
    const kelasNama = kelas.nama;

    // Delete kelas (will also delete guruKelas records due to cascade)
    await prisma.kelas.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'KELAS',
      description: `Menghapus kelas ${kelasNama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        deletedKelasId: id,
        deletedKelasNama: kelasNama
      }
    });

    return NextResponse.json({ message: 'Kelas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kelas:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kelas' },
      { status: 500 }
    );
  }
}
