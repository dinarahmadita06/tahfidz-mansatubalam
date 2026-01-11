export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { generateSiswaEmail } from '@/lib/siswaUtils';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';

// PUT - Update siswa
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      password,
      nisn,
      nis,
      kelasId,
      tahunAjaranMasukId,
      kelasAngkatan,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      alamat,
      noHP,
      noTelepon,
      orangTuaId,
      isActive
    } = body;

    // Find siswa
    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // Check for duplicate NISN (excluding current siswa)
    if (nisn && nisn !== siswa.nisn) {
      const existingNisn = await prisma.siswa.findFirst({
        where: { nisn, id: { not: id } }
      });
      if (existingNisn) {
        return NextResponse.json({ error: 'NISN sudah terdaftar' }, { status: 400 });
      }
    }

    // Check for duplicate NIS (excluding current siswa)
    if (nis && nis !== siswa.nis) {
      const existingNis = await prisma.siswa.findFirst({
        where: { nis, id: { not: id } }
      });
      if (existingNis) {
        return NextResponse.json({ error: 'NIS sudah terdaftar' }, { status: 400 });
      }
    }

    // Auto-regenerate email if name or NIS changed
    let newEmail = siswa.user.email;
    const nameChanged = name && name !== siswa.user.name;
    const nisChanged = nis && nis !== siswa.nis;

    if (nameChanged || nisChanged) {
      const finalName = name || siswa.user.name;
      const finalNis = nis || siswa.nis;
      newEmail = generateSiswaEmail(finalName, finalNis);

      // Check for duplicate email (excluding current user)
      const existingEmail = await prisma.user.findFirst({
        where: { email: newEmail, id: { not: siswa.userId } }
      });
      if (existingEmail) {
        return NextResponse.json({ error: 'Email sudah terdaftar (kombinasi Nama dan NIS sudah digunakan)' }, { status: 400 });
      }
    }

    // Prepare update data - only include fields that are provided
    const siswaUpdateData = {};

    if (nisn !== undefined) siswaUpdateData.nisn = nisn;
    if (nis !== undefined) siswaUpdateData.nis = nis;
    if (jenisKelamin !== undefined) siswaUpdateData.jenisKelamin = jenisKelamin;
    if (tempatLahir !== undefined) siswaUpdateData.tempatLahir = tempatLahir;
    if (tanggalLahir !== undefined) siswaUpdateData.tanggalLahir = new Date(tanggalLahir);
    if (alamat !== undefined) siswaUpdateData.alamat = alamat;
    
    // Use relational connect for tahunAjaranMasuk instead of scalar field
    if (tahunAjaranMasukId) {
      siswaUpdateData.tahunAjaranMasuk = {
        connect: {
          id: tahunAjaranMasukId
        }
      };
    } else if (tahunAjaranMasukId === null) {
      siswaUpdateData.tahunAjaranMasuk = {
        disconnect: true
      };
    }

    if (kelasAngkatan !== undefined) siswaUpdateData.kelasAngkatan = kelasAngkatan || null;
    // Support both noHP and noTelepon
    if (noHP !== undefined) siswaUpdateData.noTelepon = noHP;
    if (noTelepon !== undefined) siswaUpdateData.noTelepon = noTelepon;
    if (orangTuaId !== undefined) siswaUpdateData.orangTuaId = orangTuaId || null;

    // Add kelas connection if kelasId is provided
    if (kelasId) {
      siswaUpdateData.kelas = {
        connect: {
          id: kelasId
        }
      };
    }

    const userUpdateData = {};

    if (name !== undefined) userUpdateData.name = name;
    // Always update email if name or NIS changed
    if (newEmail !== siswa.user.email) userUpdateData.email = newEmail;
    if (isActive !== undefined) userUpdateData.isActive = isActive;

    // Update password if provided
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Update siswa and user
    const updatedSiswa = await prisma.siswa.update({
      where: { id },
      data: {
        ...siswaUpdateData,
        user: {
          update: userUpdateData
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        },
        kelas: {
          select: {
            nama: true
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
      module: 'SISWA',
      description: `Mengupdate data siswa ${updatedSiswa.user.name} (NISN: ${updatedSiswa.nisn})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId: updatedSiswa.id,
        updatedFields: Object.keys({...siswaUpdateData, ...userUpdateData})
      }
    });

    // Invalidate cache
    if (updatedSiswa.kelas?.id) {
      invalidateCache(`siswa-list-kelasId-${updatedSiswa.kelas.id}`);
      console.log('🗑️ Cache invalidated for kelas:', updatedSiswa.kelas.id);
    }
    invalidateCache('siswa-list-all');

    return NextResponse.json(updatedSiswa);
  } catch (error) {
    console.error('Error updating siswa:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate siswa' },
      { status: 500 }
    );
  }
}

// PATCH - Update siswa (alias for PUT, supports partial updates)
export async function PATCH(request, { params }) {
  return PUT(request, { params });
}

// DELETE - Delete siswa
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: {
        hafalan: true,
        presensi: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // Check if siswa has hafalan records
    if (siswa.hafalan.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus siswa yang memiliki data hafalan' },
        { status: 400 }
      );
    }

    // Store siswa name before deletion
    const siswaName = siswa.user.name;
    const siswaNisn = siswa.nisn;

    // Delete siswa (will cascade delete user)
    await prisma.siswa.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'SISWA',
      description: `Menghapus data siswa ${siswaName} (NISN: ${siswaNisn})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        deletedSiswaId: id,
        deletedSiswaName: siswaName,
        deletedSiswaNisn: siswaNisn
      }
    });

    return NextResponse.json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting siswa:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus siswa' },
      { status: 500 }
    );
  }
}
