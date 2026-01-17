export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache, invalidateCacheByPrefix } from '@/lib/cache';
import { generateNextTeacherUsername } from '@/lib/passwordUtils';

export async function PUT(request, { params }) {
  const { id } = await params; // Move id extraction to top level
  
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        message: 'Unauthorized', 
        details: 'Admin access required' 
      }, { status: 401 });
    }
    
    // Parse request body with validation
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('❌ PUT /api/guru/[id] - Invalid JSON:', e.message);
      return NextResponse.json({ 
        message: 'Request body harus berupa JSON yang valid',
        details: e.message
      }, { status: 400 });
    }

    let { name, password, username, nip, jenisKelamin, tanggalLahir, kelasIds } = body;

    // Clean kelasIds - remove null, undefined, empty strings
    if (kelasIds && Array.isArray(kelasIds)) {
      kelasIds = kelasIds.filter(id => id && id.trim() !== '');
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        message: 'Nama guru wajib diisi',
        field: 'name',
        details: 'Name field is required'
      }, { status: 400 });
    }

    console.log(`📝 PUT /api/guru/${id} - Updating guru: ${name}`);

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
      console.warn(`⚠️ PUT /api/guru/${id} - Guru not found`);
      return NextResponse.json({ 
        message: 'Guru tidak ditemukan',
        details: 'Guru with specified ID does not exist'
      }, { status: 404 });
    }

    // Validate kelasIds if provided
    if (kelasIds && Array.isArray(kelasIds) && kelasIds.length > 0) {
      // Ensure all kelasIds are valid strings (not null/undefined)
      const cleanKelasIds = kelasIds.filter(kelasId => kelasId && typeof kelasId === 'string' && kelasId.trim() !== '');
      
      if (cleanKelasIds.length !== kelasIds.length) {
        console.warn(`⚠️ PUT /api/guru/${id} - Invalid kelas IDs found (null/empty):`, kelasIds);
        return NextResponse.json({
          message: 'Kelas IDs tidak valid. Tidak boleh kosong atau null.',
          field: 'kelasIds',
          details: 'Invalid kelas IDs detected'
        }, { status: 400 });
      }
      
      // Check if all kelas exist and are AKTIF
      const validKelas = await prisma.kelas.findMany({
        where: {
          id: { in: cleanKelasIds },
          status: 'AKTIF'
        },
        select: { id: true, nama: true }
      });

      if (validKelas.length !== cleanKelasIds.length) {
        const validIds = validKelas.map(k => k.id);
        const invalidIds = cleanKelasIds.filter(kid => !validIds.includes(kid));
        console.warn(`⚠️ PUT /api/guru/${id} - Invalid kelas IDs:`, invalidIds);
        return NextResponse.json({
          message: `Kelas dengan ID tidak valid atau tidak aktif: ${invalidIds.join(', ')}`,
          field: 'kelasIds',
          invalidIds,
          details: 'Some class IDs are invalid or inactive'
        }, { status: 400 });
      }

      // Check if any class already has a Pembina (who is NOT this guru)
      const kelasWithPembina = await prisma.kelas.findMany({
        where: {
          id: { in: cleanKelasIds },
          status: 'AKTIF'
        },
        include: {
          guruKelas: {
            where: { peran: 'utama', isActive: true },
            include: { guru: { include: { user: { select: { name: true } } } } }
          }
        }
      });

      for (const k of kelasWithPembina) {
        if (k.guruKelas.length > 0 && k.guruKelas[0].guruId !== id) {
          console.warn(`⚠️ PUT /api/guru/${id} - Kelas ${k.nama} already has pembina: ${k.guruKelas[0].guru.user.name}`);
          return NextResponse.json({
            error: `Kelas ${k.nama} sudah memiliki Guru Pembina: ${k.guruKelas[0].guru.user.name}`,
            field: 'kelasIds',
            kelasNama: k.nama
          }, { status: 409 });
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
      } else {
        return NextResponse.json({
          message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)',
          field: 'jenisKelamin',
          received: jenisKelamin,
          details: 'Gender must be L (Male) or P (Female)'
        }, { status: 400 });
      }
    }

    // Check NIP uniqueness if provided
    if (nip && nip.trim() !== '') {
      const existingGuruWithNIP = await prisma.guru.findFirst({
        where: { 
          nip: nip.trim(),
          id: { not: id }
        },
        include: {
          user: { select: { name: true } }
        }
      });

      if (existingGuruWithNIP) {
        console.warn(`⚠️ PUT /api/guru/${id} - NIP already exists: ${nip}`);
        return NextResponse.json({ 
          error: `NIP ${nip} sudah digunakan oleh ${existingGuruWithNIP.user.name}`,
          field: 'nip'
        }, { status: 409 });
      }
    }

    // Check if username already exists for another user
    if (username && username.trim() !== '') {
      const existingUserWithUsername = await prisma.user.findFirst({
        where: { 
          username: username.trim(),
          id: { not: guru.userId }
        }
      });

      if (existingUserWithUsername) {
        console.warn(`⚠️ PUT /api/guru/${id} - Username already exists: ${username}`);
        return NextResponse.json({ 
          error: `Username ${username} sudah digunakan oleh pengguna lain`,
          field: 'username'
        }, { status: 409 });
      }
    }

    // Normalize tanggal lahir (YYYY-MM-DD string to Date at UTC midnight)
    let tanggalLahirDate = guru.tanggalLahir; // Keep existing if not provided
    if (tanggalLahir) {
      try {
        const dateStr = String(tanggalLahir).trim();
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          // YYYY-MM-DD format - create at UTC midnight
          const [y, m, d] = dateStr.split('-').map(Number);
          tanggalLahirDate = new Date(Date.UTC(y, m - 1, d));
        } else {
          // Try other formats
          const tempDate = new Date(tanggalLahir);
          if (!isNaN(tempDate.getTime())) {
            const y = tempDate.getFullYear();
            const m = tempDate.getMonth();
            const d = tempDate.getDate();
            tanggalLahirDate = new Date(Date.UTC(y, m, d));
          } else {
            throw new Error('Invalid date format');
          }
        }
      } catch (e) {
        console.error(`❌ PUT /api/guru/${id} - Invalid tanggalLahir:`, tanggalLahir, e.message);
        return NextResponse.json({
          message: 'Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD',
          field: 'tanggalLahir',
          received: tanggalLahir,
          details: 'Date format should be YYYY-MM-DD'
        }, { status: 400 });
      }
    }

    // Update data
    const updateData = {
      nip: nip !== undefined ? (nip ? nip.trim() : null) : guru.nip,
      jenisKelamin: normalizedJenisKelamin,
      tanggalLahir: tanggalLahirDate,
      user: {
        update: {
          name: name.trim(),
          ...(username && username.trim() && { username: username.trim() })
        }
      }
    };

    console.log(`📝 PUT /api/guru/${id} - Update data prepared:`, {
      nip: updateData.nip,
      jenisKelamin: updateData.jenisKelamin,
      tanggalLahir: updateData.tanggalLahir,
      userName: updateData.user.update.name
    });



    // Update password jika disediakan
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ 
          message: 'Password minimal 8 karakter',
          field: 'password',
          details: 'Password must be at least 8 characters'
        }, { status: 400 });
      }
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
      if (kelasIds && Array.isArray(kelasIds) && kelasIds.length > 0) {
        const cleanKelasIds = kelasIds.filter(kelasId => kelasId && typeof kelasId === 'string' && kelasId.trim() !== '');
        
        // Clear all classes where this guru was Pembina or pendamping
        await tx.guruKelas.deleteMany({
          where: { guruId: id }
        });

        // Set as Pembina for selected classes
        if (cleanKelasIds.length > 0) {
          const guruKelasData = cleanKelasIds.map(kelasId => ({
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
          await Promise.all(cleanKelasIds.map(kid => 
            tx.kelas.update({
              where: { id: kid },
              data: { guruTahfidzId: updated.userId }
            })
          ));
        }
      } else {
        // If no kelasIds provided or empty array, clear all kelas assignments
        await tx.guruKelas.deleteMany({
          where: { guruId: id }
        });
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
    invalidateCacheByPrefix('kelas-list');  // Invalidate all kelas cache variants for pembina sync

    console.log(`✅ PUT /api/guru/${id} - Successfully updated guru: ${updatedGuru.user.name}`);
    return NextResponse.json({ 
      data: updatedGuru,
      message: 'Guru berhasil diupdate'
    }, { status: 200 });
    
  } catch (error) {
    console.error(`❌ PUT /api/guru/${id} - Error:`, error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      console.error(`❌ PUT /api/guru/${id} - Unique constraint violation on field: ${field}`);
      return NextResponse.json({
        message: `Nilai untuk ${field} sudah digunakan oleh pengguna lain`,
        field: field,
        details: 'Unique constraint violation',
        code: 'UNIQUE_CONSTRAINT_VIOLATION'
      }, { status: 409 });
    }
    
    if (error.code === 'P2025') {
      // Record not found
      console.error(`❌ PUT /api/guru/${id} - Record not found:`, error.meta);
      return NextResponse.json({
        message: 'Data tidak ditemukan. Mungkin sudah dihapus.',
        details: 'Record not found',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }
    
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      console.error(`❌ PUT /api/guru/${id} - Foreign key constraint:`, error.meta);
      return NextResponse.json({
        message: 'Data terkait tidak ditemukan. Pastikan kelas yang dipilih masih ada.',
        field: error.meta?.field_name,
        details: 'Foreign key constraint violation',
        code: 'FOREIGN_KEY_CONSTRAINT'
      }, { status: 400 });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError' || error.message?.includes('Invalid')) {
      console.error(`❌ PUT /api/guru/${id} - Validation error:`, error.message);
      return NextResponse.json({
        message: error.message || 'Data tidak valid',
        details: 'Validation error',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }
    
    // Generic error (hide sensitive details)
    console.error(`❌ PUT /api/guru/${id} - Unexpected error:`, {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json({
      message: 'Gagal mengupdate data guru. Silakan coba lagi atau hubungi administrator.',
      details: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
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
      return NextResponse.json({ 
        message: 'Guru tidak ditemukan',
        details: 'Guru with specified ID does not exist'
      }, { status: 404 });
    }

    // Cek apakah guru masih mengampu kelas
    const guruKelas = await prisma.guruKelas.count({
      where: {
        guruId: id,
        isActive: true
      }
    });

    if (guruKelas > 0) {
      return NextResponse.json({
        message: 'Tidak dapat menghapus guru yang masih aktif mengampu kelas',
        details: 'Teacher is still assigned to active classes'
      }, { status: 400 });
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

    return NextResponse.json({ 
      message: 'Guru berhasil dihapus',
      data: { deletedId: id, deletedName: guruName }
    });
  } catch (error) {
    console.error('Error deleting guru:', error);
    return NextResponse.json({
      message: 'Gagal menghapus data guru',
      details: 'Failed to delete guru',
      code: 'DELETE_ERROR'
    }, { status: 500 });
  }
}
