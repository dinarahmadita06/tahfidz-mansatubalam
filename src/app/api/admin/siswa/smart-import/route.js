export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

import bcrypt from 'bcryptjs';
import { invalidateCache } from '@/lib/cache';
import { generateSiswaEmail, generateOrangTuaEmail } from '@/lib/siswaUtils';
import { buildSiswaCredentials, buildOrtuCredentials } from '@/lib/passwordUtils';

// Helper untuk generate password random
function generatePassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, autoCreateAccount = true } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    const stats = {
      success: 0,
      failed: 0,
      duplicate: 0,
      total: data.length,
      // Detailed stats
      createdSiswa: 0,
      duplicateSiswa: 0,
      createdOrtu: 0,
      duplicateOrtu: 0,
      createdRelation: 0,
      duplicateRelation: 0
    };

    const newAccounts = [];
    const errors = [];
    const successDetails = [];
    
    // Helper untuk mark duplicate
    const markDuplicate = (rowIndex, reason) => {
      stats.duplicate++;
      errors.push(`Baris ${rowIndex + 2}: Duplikat - ${reason}`);
    };
    
    // Helper: Get or Create Siswa
    const getOrCreateSiswa = async ({ siswaData, nisValue, nisnValue, tahunAjaranMasukId, kelasId, tanggalLahir, normalizedJenisKelamin, siswaEmail, hashedPassword }) => {
      // Cek existing siswa
      const existingSiswa = await prisma.siswa.findFirst({
        where: {
          OR: [
            { nis: nisValue },
            { nisn: nisnValue }
          ]
        },
        include: { user: true }
      });

      if (existingSiswa) {
        stats.duplicateSiswa++;
        return { siswa: existingSiswa, isNew: false };
      }

      // Create new siswa
      try {
        const siswa = await prisma.siswa.create({
          data: {
            nisn: nisnValue,
            nis: nisValue,
            jenisKelamin: normalizedJenisKelamin,
            tanggalLahir: tanggalLahir,
            alamat: siswaData.alamat || '',
            kelasAngkatan: siswaData.kelasAngkatan?.toString() || null,
            tahunAjaranMasuk: { connect: { id: tahunAjaranMasukId } },
            status: 'approved',
            statusSiswa: 'AKTIF',
            kelas: kelasId ? { connect: { id: kelasId } } : undefined,
            user: {
              create: {
                email: siswaEmail,
                username: nisValue,
                password: hashedPassword,
                name: siswaData.nama,
                role: 'SISWA'
              }
            }
          }
        });
        stats.createdSiswa++;
        return { siswa, isNew: true };
      } catch (createError) {
        if (createError.code === 'P2002') {
          // Race condition - re-fetch
          const refetchedSiswa = await prisma.siswa.findFirst({
            where: { OR: [{ nis: nisValue }, { nisn: nisnValue }] },
            include: { user: true }
          });
          if (refetchedSiswa) {
            stats.duplicateSiswa++;
            return { siswa: refetchedSiswa, isNew: false };
          }
        }
        throw createError;
      }
    };

    // Helper: Get or Create Orang Tua
    const getOrCreateOrtu = async ({ orangtuaData, nisValue, nisnValue, normalizedGenderWali, finalEmail, ortuCredentials, siswaData }) => {
      console.log(`  🔍 getOrCreateOrtu: Checking username="${ortuCredentials.username}" (from NIS=${nisValue})`);
      
      // Cek existing orang tua by username
      const existingOrtuUser = await prisma.user.findFirst({
        where: {
          username: ortuCredentials.username,
          role: 'ORANG_TUA'
        },
        include: {
          orangTua: true
        }
      });

      if (existingOrtuUser && existingOrtuUser.orangTua) {
        console.log(`  ✅ Found existing orang tua: ${existingOrtuUser.name} (username=${existingOrtuUser.username})`);
        stats.duplicateOrtu++;
        return { orangTua: existingOrtuUser.orangTua, isNew: false, account: null };
      }

      // Create new orang tua
      console.log(`  ➕ Creating new orang tua: ${orangtuaData.nama} (username=${ortuCredentials.username})`);
      try {
        const orangTua = await prisma.orangTua.create({
          data: {
            jenisKelamin: normalizedGenderWali,
            status: 'approved',
            user: {
              create: {
                email: finalEmail,
                username: ortuCredentials.username,
                password: ortuCredentials.passwordHash,
                name: orangtuaData.nama,
                role: 'ORANG_TUA'
              }
            }
          }
        });

        stats.createdOrtu++;
        
        const account = {
          nama: orangtuaData.nama,
          username: ortuCredentials.username,
          role: 'ORANG_TUA',
          password: ortuCredentials.passwordPlain,
          keterangan: `Orang tua dari ${siswaData.nama}`
        };

        return { orangTua, isNew: true, account };
      } catch (createError) {
        if (createError.code === 'P2002') {
          // Race condition - re-fetch
          const refetchedUser = await prisma.user.findFirst({
            where: { username: ortuCredentials.username, role: 'ORANG_TUA' },
            include: { orangTua: true }
          });
          if (refetchedUser && refetchedUser.orangTua) {
            stats.duplicateOrtu++;
            return { orangTua: refetchedUser.orangTua, isNew: false, account: null };
          }
        }
        // Log error tapi jangan throw - orang tua optional
        console.error('Error creating orang tua:', createError);
        return { orangTua: null, isNew: false, account: null };
      }
    };

    // Helper: Ensure OrangTuaSiswa Relation
    const ensureRelation = async ({ orangTuaId, siswaId, jenisWali }) => {
      // Cek existing relation
      const existingRelation = await prisma.orangTuaSiswa.findFirst({
        where: {
          orangTuaId: orangTuaId,
          siswaId: siswaId
        }
      });

      if (existingRelation) {
        stats.duplicateRelation++;
        return { isNew: false };
      }

      // Create relation
      try {
        await prisma.orangTuaSiswa.create({
          data: {
            orangTuaId: orangTuaId,
            siswaId: siswaId,
            hubungan: jenisWali || 'Orang Tua'
          }
        });
        stats.createdRelation++;
        return { isNew: true };
      } catch (createError) {
        if (createError.code === 'P2002') {
          stats.duplicateRelation++;
          return { isNew: false };
        }
        throw createError;
      }
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { siswa: siswaData, namaAyah, namaIbu, namaWali, jenisKelaminWali } = row;

      try {
        // Debug logging for first row to check mapping
        if (i === 0) {
          console.log('First row siswaData:', JSON.stringify(siswaData, null, 2));
          console.log('First row namaAyah:', namaAyah);
          console.log('First row namaIbu:', namaIbu);
          console.log('First row namaWali:', namaWali);
          console.log('First row jenisKelaminWali:', jenisKelaminWali);
        }

        // Validasi required fields siswa sesuai form terbaru
        if (!siswaData?.nama) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Nama siswa harus diisi`);
          continue;
        }
        if (!siswaData?.nisn) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: NISN harus diisi`);
          continue;
        }
        if (!siswaData?.nis) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: NIS harus diisi`);
          continue;
        }
        if (!siswaData?.jenisKelamin) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin siswa harus diisi`);
          continue;
        }
        // Validate jenis kelamin value (only L or P accepted)
        const jkValue = siswaData.jenisKelamin.toString().trim().toUpperCase();
        if (!['L', 'P', 'LAKI_LAKI', 'LAKI-LAKI', 'PEREMPUAN', 'MALE', 'FEMALE'].includes(jkValue)) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin tidak valid "${siswaData.jenisKelamin}" (harus L atau P). Periksa mapping kolom Excel.`);
          continue;
        }
        if (!siswaData?.tanggalLahir) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tanggal Lahir siswa harus diisi`);
          continue;
        }

        // ========== AUTOMATIC WALI DETERMINATION ==========
        // Support 2 format input:
        // Format 1: namaAyah & namaIbu (kolom terpisah)
        // Format 2: namaWali & jenisKelaminWali (kolom generic)
        
        let jenisWali = null;
        let namaWaliResult = null;
        let jenisKelaminWaliResult = null;

        // Prioritas 1: Check format generic (namaWali + jenisKelaminWali)
        if (namaWali && namaWali.trim() && namaWali.trim() !== '-') {
          namaWaliResult = namaWali.trim();
          
          // Tentukan jenis kelamin dan jenis wali dari jenisKelaminWali
          if (jenisKelaminWali) {
            const jkWali = jenisKelaminWali.toString().trim().toUpperCase();
            
            if (['L', 'LAKI_LAKI', 'LAKI-LAKI', 'MALE', 'LAKI LAKI'].includes(jkWali)) {
              jenisKelaminWaliResult = 'LAKI_LAKI';
              jenisWali = 'AYAH';
            } else if (['P', 'PEREMPUAN', 'FEMALE'].includes(jkWali)) {
              jenisKelaminWaliResult = 'PEREMPUAN';
              jenisWali = 'IBU';
            } else {
              // Default ke AYAH jika tidak jelas
              jenisKelaminWaliResult = 'LAKI_LAKI';
              jenisWali = 'AYAH';
            }
          } else {
            // Jika tidak ada jenisKelaminWali, default ke AYAH
            jenisKelaminWaliResult = 'LAKI_LAKI';
            jenisWali = 'AYAH';
          }
        }
        // Prioritas 2: Check namaAyah
        else if (namaAyah && namaAyah.trim() && namaAyah.trim() !== '-') {
          jenisWali = 'AYAH';
          namaWaliResult = namaAyah.trim();
          jenisKelaminWaliResult = 'LAKI_LAKI';
        }
        // Prioritas 3: Check namaIbu
        else if (namaIbu && namaIbu.trim() && namaIbu.trim() !== '-') {
          jenisWali = 'IBU';
          namaWaliResult = namaIbu.trim();
          jenisKelaminWaliResult = 'PEREMPUAN';
        }
        // Jika tidak ada satupun yang valid, error
        else {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tidak ada data Wali yang valid. Silakan isi kolom "Nama Wali" atau "Nama Ayah"/"Nama Ibu".`);
          continue;
        }

        // Build orangtuaData from determined wali
        const orangtuaData = {
          nama: namaWaliResult,
          jenisKelamin: jenisKelaminWaliResult,
          jenisWali: jenisWali
        };

        const nisValue = siswaData.nis.toString();
        const nisnValue = siswaData.nisn.toString();
        
        // DEBUG: Log NIS untuk setiap row
        console.log(`📋 Baris ${i + 2}: NIS="${nisValue}", NISN="${nisnValue}", Nama="${siswaData.nama}", NamaWali="${orangtuaData?.nama}"`);

        // Find or default Tahun Ajaran Masuk
        let tahunAjaranMasukId = null;
        let tahunAjaranMasuk = null;
        
        if (siswaData.tahunAjaranMasuk) {
          const taInput = siswaData.tahunAjaranMasuk.toString().trim();
          tahunAjaranMasuk = await prisma.tahunAjaran.findFirst({
            where: {
              nama: { contains: taInput, mode: 'insensitive' }
            }
          });
          
          if (!tahunAjaranMasuk) {
            stats.failed++;
            errors.push(`Baris ${i + 2}: Tahun Ajaran "${siswaData.tahunAjaranMasuk}" tidak ditemukan`);
            continue;
          }
          tahunAjaranMasukId = tahunAjaranMasuk.id;
        } else {
          // Auto-fill with active Tahun Ajaran
          tahunAjaranMasuk = await prisma.tahunAjaran.findFirst({
            where: { isActive: true },
            orderBy: { tanggalMulai: 'desc' }
          });
          
          if (!tahunAjaranMasuk) {
            stats.failed++;
            errors.push(`Baris ${i + 2}: Tidak ada Tahun Ajaran aktif di sistem`);
            continue;
          }
          tahunAjaranMasukId = tahunAjaranMasuk.id;
        }

        // Find Kelas - OPTIONAL field
        let kelasId = null;
        if (siswaData.kelas) {
          const kelasInput = siswaData.kelas.toString().trim();

          // Try to find kelas by nama (string match)
          let kelas = await prisma.kelas.findFirst({
            where: {
              OR: [
                { nama: { equals: kelasInput, mode: 'insensitive' } },
                { nama: { contains: kelasInput, mode: 'insensitive' } }
              ]
            }
          });

          if (kelas) {
            kelasId = kelas.id;
          }
          // If kelas not found, just set to null (not an error)
        }

        // Create Siswa Account
        let siswaEmail, siswaPassword, tanggalLahirDate;

        if (autoCreateAccount) {
          // Auto-generate email using consistent format: firstname.nis@siswa.tahfidz.sch.id
          siswaEmail = generateSiswaEmail(siswaData.nama, siswaData.nis);
          
          // Parse tanggal lahir - convert to Date object first
          // Support formats: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, Excel serial
          tanggalLahirDate = null;
          if (siswaData.tanggalLahir) {
            const input = siswaData.tanggalLahir.toString().trim();
            
            try {
              // Try Excel serial number (numeric)
              if (!isNaN(input) && input.length < 8) {
                const excelEpoch = new Date(1899, 11, 30);
                tanggalLahirDate = new Date(excelEpoch.getTime() + parseFloat(input) * 86400000);
              }
              // Try DD-MM-YYYY or DD/MM/YYYY format
              else if (input.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/)) {
                const parts = input.split(/[-\/]/);
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // 0-indexed
                const year = parseInt(parts[2], 10);
                tanggalLahirDate = new Date(year, month, day);
              }
              // Try YYYY-MM-DD format
              else if (input.match(/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/)) {
                tanggalLahirDate = new Date(input);
              }
              // Default fallback
              else {
                tanggalLahirDate = new Date(input);
              }
              
              // Validate parsed date
              if (isNaN(tanggalLahirDate.getTime())) {
                tanggalLahirDate = null;
              }
            } catch (e) {
              tanggalLahirDate = null;
            }
            
            if (!tanggalLahirDate) {
              stats.failed++;
              errors.push(`Baris ${i + 2}: Tanggal lahir tidak valid "${siswaData.tanggalLahir}" (format: DD-MM-YYYY atau YYYY-MM-DD)`);
              continue;
            }
          } else {
            stats.failed++;
            errors.push(`Baris ${i + 2}: Tanggal lahir wajib diisi`);
            continue;
          }
          
          // Build credentials using helper (same logic as guru)
          let credentials;
          try {
            credentials = await buildSiswaCredentials({
              tanggalLahir: tanggalLahirDate,
              nis: nisValue,
              bcrypt
            });
          } catch (error) {
            stats.failed++;
            errors.push(`Baris ${i + 2}: ${error.message}`);
            continue;
          }
          
          siswaPassword = credentials.passwordPlain; // YYYY-MM-DD
          const hashedPassword = credentials.passwordHash;

          // Parse tanggal lahir - REQUIRED field
          const tanggalLahir = tanggalLahirDate;

          // Normalize jenisKelamin
          let normalizedJenisKelamin = 'LAKI_LAKI';
          if (siswaData.jenisKelamin) {
            const jkUpper = String(siswaData.jenisKelamin).toUpperCase().trim();
            if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE') {
              normalizedJenisKelamin = 'PEREMPUAN';
            } else if (jkUpper === 'LAKI_LAKI' || jkUpper === 'LAKI-LAKI' || jkUpper === 'L' || jkUpper === 'MALE') {
              normalizedJenisKelamin = 'LAKI_LAKI';
            }
          }

          // ========== NEW LOGIC: Get or Create Siswa ==========
          console.log(`🔍 Baris ${i + 2}: Processing siswa NIS=${nisValue}`);
          
          const siswaResult = await getOrCreateSiswa({
            siswaData,
            nisValue,
            nisnValue,
            tahunAjaranMasukId,
            kelasId,
            tanggalLahir,
            normalizedJenisKelamin,
            siswaEmail,
            hashedPassword
          });

          const siswa = siswaResult.siswa;
          const siswaIsNew = siswaResult.isNew;

          // Track siswa account if newly created
          if (siswaIsNew) {
            newAccounts.push({
              nama: siswaData.nama,
              username: nisValue,
              role: 'SISWA',
              password: siswaPassword,
              keterangan: `Kelas: ${siswaData.kelas || '-'}, TA: ${tahunAjaranMasuk?.nama || '-'}`
            });
          }

          // ========== NEW LOGIC: Get or Create Orang Tua ==========
          let orangTuaResult = { orangTua: null, isNew: false, account: null };
          
          if (orangtuaData?.nama && autoCreateAccount) {
            console.log(`🔍 Baris ${i + 2}: Processing orang tua "${orangtuaData.nama}" untuk siswa NIS=${nisValue}`);
            // Normalize gender wali
            let normalizedGenderWali = 'LAKI_LAKI';
            if (orangtuaData.jenisKelamin) {
              const jkUpper = String(orangtuaData.jenisKelamin).toUpperCase().trim();
              if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE' || jkUpper === 'WANITA') {
                normalizedGenderWali = 'PEREMPUAN';
              }
            }

            // Generate email orang tua
            let finalEmail = generateOrangTuaEmail(siswaData.nama, nisValue);

            // Build orang tua credentials
            let ortuCredentials;
            try {
              ortuCredentials = await buildOrtuCredentials({
                tanggalLahirSiswa: tanggalLahirDate,
                nisSiswa: nisValue,
                bcrypt
              });
            } catch (error) {
              console.error(`Failed to build ortu credentials for row ${i + 2}:`, error);
            }

            if (ortuCredentials) {
              orangTuaResult = await getOrCreateOrtu({
                orangtuaData,
                nisValue,
                nisnValue,
                normalizedGenderWali,
                finalEmail,
                ortuCredentials,
                siswaData
              });

              // Track orang tua account if newly created
              if (orangTuaResult.isNew && orangTuaResult.account) {
                newAccounts.push(orangTuaResult.account);
              }
            }
          }

          // ========== NEW LOGIC: Ensure Relation ==========
          let relationResult = { isNew: false };
          
          if (orangTuaResult.orangTua) {
            relationResult = await ensureRelation({
              orangTuaId: orangTuaResult.orangTua.id,
              siswaId: siswa.id,
              jenisWali: jenisWali
            });
          }

          // ========== Determine Success/Duplicate ==========
          const hasAnyNewAction = siswaIsNew || orangTuaResult.isNew || relationResult.isNew;
          
          if (hasAnyNewAction) {
            // Minimal ada 1 aksi (create siswa/ortu/relasi) → SUCCESS
            stats.success++;
            
            // Detail info untuk row ini
            const details = [];
            if (siswaIsNew) details.push('Siswa baru dibuat');
            else details.push('Siswa sudah ada');
            
            if (orangTuaResult.isNew) details.push('Wali baru dibuat');
            else if (orangTuaResult.orangTua) details.push('Wali sudah ada');
            
            if (relationResult.isNew) details.push('Relasi dibuat');
            else if (orangTuaResult.orangTua) details.push('Relasi sudah ada');
            
            successDetails.push(`Baris ${i + 2}: ✅ ${details.join(', ')}`);
          } else {
            // Semua sudah ada → DUPLICATE
            markDuplicate(i, 'Siswa, wali, dan relasi sudah ada sebelumnya');
          }
        }

      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        
        // Check if this is a Prisma unique constraint error (fallback)
        if (error.code === 'P2002') {
          markDuplicate(i, `Data unik sudah terdaftar (${error.meta?.target || 'unknown field'})`);
        } else {
          // Error validasi atau error lainnya
          stats.failed++;
          errors.push(`Baris ${i + 2}: ${error.message}`);
        }
      }

      // Small delay to prevent connection pool overflow
      if (i < data.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Invalidate cache if any siswa was successfully imported
    if (stats.success > 0 || stats.createdSiswa > 0) {
      invalidateCache('siswa-list');
      console.log('✅ Cache invalidated for siswa-list');
    }

    return NextResponse.json({
      message: 'Import selesai',
      stats,
      newAccounts,
      errors: errors.slice(0, 50), // Return max 50 errors
      successDetails: successDetails.slice(0, 50) // Return max 50 success details
    });

  } catch (error) {
    console.error('Smart import error:', error);
    return NextResponse.json(
      { error: 'Gagal import data: ' + error.message },
      { status: 500 }
    );
  }
}
