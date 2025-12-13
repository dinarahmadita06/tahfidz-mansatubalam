import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, email, password, nip, jenisKelamin, noHP, noTelepon, alamat } = await request.json();

    // Cari guru
    const guru = await prisma.guru.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!guru) {
      return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 });
    }

    // Normalize jenisKelamin dari L/P ke LAKI_LAKI/PEREMPUAN
    let normalizedJenisKelamin = guru.jenisKelamin; // Keep existing if not provided
    if (jenisKelamin) {
      const jkUpper = String(jenisKelamin).toUpperCase().trim();
      if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE') {
        normalizedJenisKelamin = 'PEREMPUAN';
      } else if (jkUpper === 'LAKI_LAKI' || jkUpper === 'LAKI-LAKI' || jkUpper === 'L' || jkUpper === 'MALE') {
        normalizedJenisKelamin = 'LAKI_LAKI';
      }
    }

    // Update data
    const updateData = {
      nip: nip || null,
      jenisKelamin: normalizedJenisKelamin,
      noTelepon: noTelepon || noHP,
      alamat,
      user: {
        update: {
          name,
          email
        }
      }
    };

    // Update password jika disediakan
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.user.update.password = hashedPassword;
    }

    const updatedGuru = await prisma.guru.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
      module: 'GURU',
      description: `Mengupdate data guru ${updatedGuru.user.name} (NIP: ${updatedGuru.nip || '-'})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        guruId: updatedGuru.id
      }
    });

    // Invalidate cache
    invalidateCache('guru-list');

    return NextResponse.json(updatedGuru);
  } catch (error) {
    console.error('Error updating guru:', error);
    return NextResponse.json(
      { error: 'Failed to update guru' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get guru data before deletion
    const guru = await prisma.guru.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!guru) {
      return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 });
    }

    // Cek apakah guru masih mengampu kelas
    const guruKelas = await prisma.guruKelas.count({
      where: {
        guruId: id,
        isActive: true
      }
    });

    if (guruKelas > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus guru yang masih aktif mengampu kelas' },
        { status: 400 }
      );
    }

    // Store data for logging
    const guruName = guru.user.name;
    const guruNip = guru.nip;

    // Delete guru (akan cascade delete user juga)
    await prisma.guru.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'GURU',
      description: `Menghapus data guru ${guruName} (NIP: ${guruNip || '-'})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        deletedGuruId: id,
        deletedGuruName: guruName
      }
    });

    // Invalidate cache
    invalidateCache('guru-list');

    return NextResponse.json({ message: 'Guru berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting guru:', error);
    return NextResponse.json(
      { error: 'Failed to delete guru' },
      { status: 500 }
    );
  }
}
