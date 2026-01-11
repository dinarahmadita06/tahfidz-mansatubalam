export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';
import { generateNextTeacherUsername } from '@/lib/passwordUtils';

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    let { name, email, password, username, nip, jenisKelamin, tanggalLahir, kelasIds } = await request.json();

    // Cari guru
    const guru = await prisma.guru.findUnique({
      where: { id },
      include: { 
        user: true,
        guruKelas: {
          where: { isActive: true, peran: 'utama' }
        }
      }
    });

    if (!guru) {
      return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 });
    }

    // Validate kelasIds if provided
    if (kelasIds && Array.isArray(kelasIds)) {
      const kelasWithPembina = await prisma.kelas.findMany({
        where: {
          id: { in: kelasIds },
          status: 'AKTIF'
        },
        include: {
          guruKelas: {
            where: { peran: 'utama', isActive: true },
            include: { guru: { include: { user: { select: { name: true } } } } }
          }
        }
      });

      // Check if any class already has a Pembina (who is NOT this guru)
      for (const k of kelasWithPembina) {
        if (k.guruKelas.length > 0 && k.guruKelas[0].guruId !== id) {
          return NextResponse.json({
            error: `Kelas ${k.nama} sudah memiliki Guru Pembina: ${k.guruKelas[0].guru.user.name}`
          }, { status: 400 });
        }
      }
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

    // Check if username already exists for another user
    if (username) {
      try {
        const existingUserWithUsername = await prisma.user.findUnique({
          where: { username }
        });

        if (existingUserWithUsername && existingUserWithUsername.id !== guru.userId) {
          return NextResponse.json({ error: 'Username sudah terdaftar oleh pengguna lain' }, { status: 400 });
        }
      } catch (error) {
        console.warn('⚠️ Username field not available in database, skipping username uniqueness check');
        // Continue without username check if field doesn't exist
      }
    }

    // Check if email already exists for another user (only if email is provided)
    if (email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== guru.userId) {
        return NextResponse.json({ error: 'Email sudah terdaftar oleh pengguna lain' }, { status: 400 });
      }
    }

    // If no email provided, use the existing email
    if (!email) {
      email = guru.user.email; // Keep existing email if not provided in update
    }

    // Update data
    const updateData = {
      nip: nip !== undefined ? nip || null : undefined,
      jenisKelamin: normalizedJenisKelamin,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      user: {
        update: {
          name,
          email,
          ...(username && { username }) // Only update username if provided (with error handling)
        }
      }
    };



    // Update password jika disediakan
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.user.update.password = hashedPassword;
    }

    const updatedGuru = await prisma.$transaction(async (tx) => {
      // 1. Update Profile
      const updated = await tx.guru.update({
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

      // 2. Handle Kelas Sync if provided
      if (kelasIds && Array.isArray(kelasIds)) {
        // Clear all classes where this guru was Pembina or pendamping
        await tx.guruKelas.deleteMany({
          where: { guruId: id }
        });

        // Set as Pembina for selected classes
        if (kelasIds.length > 0) {
          const guruKelasData = kelasIds.map(kelasId => ({
            guruId: id,
            kelasId: kelasId,
            peran: 'utama',
            isActive: true
          }));

          await tx.guruKelas.createMany({
            data: guruKelasData,
            skipDuplicates: true
          });

          // Sync Kelas.guruTahfidzId for legacy compatibility
          await Promise.all(kelasIds.map(kid => 
            tx.kelas.update({
              where: { id: kid },
              data: { guruTahfidzId: updated.userId }
            })
          ));
        }
      }

      return updated;
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
