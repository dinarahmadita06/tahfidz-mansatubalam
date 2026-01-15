export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';
import { generateSiswaEmail, generateOrangTuaEmail } from '@/lib/siswaUtils';

/**
 * POST /api/admin/siswa/import-simple
 * 
 * Simplified student import with ONLY 6 required columns:
 * 1. Nama Lengkap Siswa
 * 2. NISN
 * 3. NIS
 * 4. Tanggal Lahir (YYYY-MM-DD)
 * 5. Jenis Kelamin (L or P)
 * 6. Nama Wali
 * 
 * All imported students are automatically:
 * - Assigned to the active academic year (tahun ajaran aktif)
 * - Given auto-generated accounts
 * - Set to 'approved' status
 * 
 * Password generation:
 * - Student: NISN (plain)
 * - Parent: DDMMYYYY (from student's birth date)
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siswaData } = body;

    if (!Array.isArray(siswaData) || siswaData.length === 0) {
      return NextResponse.json({ error: 'Data siswa tidak valid' }, { status: 400 });
    }

    // Get active tahun ajaran
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { id: true, nama: true }
    });

    if (!activeTahunAjaran) {
      return NextResponse.json(
        { error: 'Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran terlebih dahulu.' },
        { status: 400 }
      );
    }

    const results = {
      success: [],
      failed: [],
      duplicate: []
    };

    // Process each student
    for (const data of siswaData) {
      try {
        // Extract and validate required fields
        const name = (data['Nama Lengkap Siswa'] || data['Nama Siswa'] || '').trim();
        const nisn = String(data['NISN'] || '').trim();
        const nis = String(data['NIS'] || '').trim();
        const tanggalLahir = data['Tanggal Lahir'] || '';
        const jenisKelamin = (data['Jenis Kelamin'] || '').trim().toUpperCase();
        const namaWali = (data['Nama Wali'] || '').trim();
        const jenisKelaminWali = (data['Jenis Kelamin Wali'] || '').trim().toUpperCase();

        // Validate required fields
        if (!name) {
          results.failed.push({
            data,
            error: 'Nama Lengkap Siswa tidak boleh kosong'
          });
          continue;
        }

        if (!nisn) {
          results.failed.push({
            data,
            error: 'NISN tidak boleh kosong'
          });
          continue;
        }

        if (!nis) {
          results.failed.push({
            data,
            error: 'NIS tidak boleh kosong'
          });
          continue;
        }

        if (!tanggalLahir) {
          results.failed.push({
            data,
            error: 'Tanggal Lahir tidak boleh kosong'
          });
          continue;
        }

        // Validate date format
        const dateObj = new Date(tanggalLahir);
        if (isNaN(dateObj.getTime())) {
          results.failed.push({
            data,
            error: 'Format Tanggal Lahir tidak valid. Gunakan format YYYY-MM-DD (contoh: 2010-05-15)'
          });
          continue;
        }

        // Validate gender
        if (jenisKelamin !== 'L' && jenisKelamin !== 'P') {
          results.failed.push({
            data,
            error: 'Jenis Kelamin harus L atau P'
          });
          continue;
        }

        if (!namaWali) {
          results.failed.push({
            data,
            error: 'Nama Wali tidak boleh kosong'
          });
          continue;
        }

        // Validate guardian gender
        if (jenisKelaminWali && jenisKelaminWali !== 'L' && jenisKelaminWali !== 'P') {
          results.failed.push({
            data,
            error: 'Jenis Kelamin Wali harus L atau P (opsional)'
          });
          continue;
        }

        // Check for duplicate NIS or NISN
        const existingSiswa = await prisma.siswa.findFirst({
          where: {
            OR: [
              { nis: nis },
              { nisn: nisn }
            ]
          },
          include: {
            user: { select: { name: true } }
          }
        });

        if (existingSiswa) {
          results.duplicate.push({
            data,
            error: `NIS ${nis} atau NISN ${nisn} sudah terdaftar (${existingSiswa.user.name})`
          });
          continue;
        }

        // Normalize gender for siswa
        const normalizedGender = jenisKelamin === 'L' ? 'LAKI_LAKI' : 'PEREMPUAN';

        // Generate emails
        const emailSiswa = generateSiswaEmail(name, nis);
        const emailWali = generateOrangTuaEmail(name, nis);

        // Check if emails already exist
        const existingEmail = await prisma.user.findFirst({
          where: {
            OR: [
              { email: emailSiswa },
              { email: emailWali }
            ]
          }
        });

        if (existingEmail) {
          results.failed.push({
            data,
            error: `Email ${existingEmail.email} sudah terdaftar`
          });
          continue;
        }

        // Generate passwords
        const passwordSiswa = nisn; // Student password = NISN
        
        // Parent password = DDMMYYYY
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const passwordWali = `${day}${month}${year}`;

        // Hash passwords
        const hashedPasswordSiswa = await bcrypt.hash(passwordSiswa, 10);
        const hashedPasswordWali = await bcrypt.hash(passwordWali, 10);

        // Normalize guardian gender
        let normalizedGenderWali = 'LAKI_LAKI'; // Default
        if (jenisKelaminWali === 'P') {
          normalizedGenderWali = 'PEREMPUAN';
        } else if (jenisKelaminWali === 'L') {
          normalizedGenderWali = 'LAKI_LAKI';
        }

        // Create parent first
        const orangTua = await prisma.orangTua.create({
          data: {
            noTelepon: null,
            jenisKelamin: normalizedGenderWali,
            status: 'approved',
            user: {
              create: {
                email: emailWali,
                password: hashedPasswordWali,
                name: namaWali,
                role: 'ORANG_TUA',
                isActive: true
              }
            }
          }
        });

        // Create student with relation to parent and active tahun ajaran
        const siswa = await prisma.siswa.create({
          data: {
            nisn,
            nis,
            jenisKelamin: normalizedGender,
            tanggalLahir: dateObj,
            alamat: '',
            noTelepon: null,
            kelasAngkatan: null,
            tahunAjaranMasukId: activeTahunAjaran.id,
            status: 'approved',
            statusSiswa: 'AKTIF',
            user: {
              create: {
                email: emailSiswa,
                password: hashedPasswordSiswa,
                name,
                role: 'SISWA',
                isActive: true
              }
            }
          },
          include: {
            user: { select: { name: true, email: true } },
            tahunAjaranMasuk: { select: { nama: true } }
          }
        });

        // Create relation between parent and student
        await prisma.orangTuaSiswa.create({
          data: {
            orangTuaId: orangTua.id,
            siswaId: siswa.id,
            hubungan: 'Wali' // Default relationship
          }
        });

        results.success.push({
          siswa: {
            name: siswa.user.name,
            nis: siswa.nis,
            nisn: siswa.nisn,
            email: siswa.user.email,
            password: passwordSiswa,
            tahunAjaran: siswa.tahunAjaranMasuk.nama
          },
          wali: {
            name: namaWali,
            email: emailWali,
            password: passwordWali
          }
        });

      } catch (error) {
        console.error('Error importing siswa:', error);
        results.failed.push({
          data,
          error: error.message || 'Gagal mengimport data'
        });
      }
    }

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'IMPORT',
      module: 'SISWA',
      description: `Import Simple - Berhasil: ${results.success.length}, Gagal: ${results.failed.length}, Duplikat: ${results.duplicate.length}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        totalData: siswaData.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        duplicateCount: results.duplicate.length,
        tahunAjaran: activeTahunAjaran.nama
      }
    });

    // Invalidate cache
    if (results.success.length > 0) {
      invalidateCache('siswa-list');
      invalidateCache('admin-siswa-list');
    }

    return NextResponse.json({
      message: `Import selesai. Berhasil: ${results.success.length}, Gagal: ${results.failed.length}, Duplikat: ${results.duplicate.length}`,
      tahunAjaran: activeTahunAjaran.nama,
      results
    });

  } catch (error) {
    console.error('Error importing siswa (simple):', error);
    return NextResponse.json(
      { error: 'Gagal mengimport data siswa', details: error.message },
      { status: 500 }
    );
  }
}
