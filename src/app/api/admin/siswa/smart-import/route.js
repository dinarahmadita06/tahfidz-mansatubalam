import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { invalidateCache } from '@/lib/cache';
import { generateSiswaEmail, generateOrangTuaEmail } from '@/lib/siswaUtils';

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
      total: data.length
    };

    const newAccounts = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { siswa: siswaData, orangtua: orangtuaData } = row;

      try {
        // Debug logging
        console.log(`Processing row ${i + 2}:`, { siswaData, orangtuaData });

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
        if (!siswaData?.kelasAngkatan) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Diterima di Kelas / Angkatan harus diisi`);
          continue;
        }
        if (!siswaData?.kelas) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Kelas Saat Ini harus diisi`);
          continue;
        }
        if (!siswaData?.tahunAjaranMasuk) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tahun Ajaran Masuk harus diisi`);
          continue;
        }

        // Validasi required fields wali
        if (!orangtuaData?.jenisWali) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Jenis Wali harus diisi`);
          continue;
        }
        if (!orangtuaData?.nama) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Nama Wali harus diisi`);
          continue;
        }
        if (!orangtuaData?.jenisKelamin) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin Wali harus diisi`);
          continue;
        }
        if (!orangtuaData?.noHP) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: No HP Wali harus diisi`);
          continue;
        }

        // Check duplicate NIS
        const nisValue = siswaData.nis.toString();
        const nisnValue = siswaData.nisn.toString();

        // Check duplicate NIS
        const existingSiswa = await prisma.siswa.findFirst({
          where: {
            OR: [
              { nis: nisValue },
              { nisn: nisnValue }
            ]
          }
        });

        if (existingSiswa) {
          stats.duplicate++;
          errors.push(`Baris ${i + 2}: NIS ${nisValue} atau NISN ${nisnValue} sudah terdaftar`);
          continue;
        }

        // Find Tahun Ajaran Masuk
        let tahunAjaranMasukId = null;
        if (siswaData.tahunAjaranMasuk) {
          const taInput = siswaData.tahunAjaranMasuk.toString().trim();
          const ta = await prisma.tahunAjaran.findFirst({
            where: {
              nama: { contains: taInput, mode: 'insensitive' }
            }
          });
          tahunAjaranMasukId = ta?.id;
        }

        if (!tahunAjaranMasukId) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tahun Ajaran "${siswaData.tahunAjaranMasuk}" tidak ditemukan`);
          continue;
        }

        // Find or create Kelas - REQUIRED field
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

          kelasId = kelas?.id;
        }

        if (!kelasId) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Kelas "${siswaData.kelas}" tidak ditemukan`);
          continue;
        }

        // Process Orang Tua
        let orangTuaId = null;
        let orangTuaAccount = null;

        if (orangtuaData?.nama && autoCreateAccount) {
          // Normalize gender wali
          let normalizedGenderWali = 'LAKI_LAKI';
          if (orangtuaData.jenisKelamin) {
            const jkUpper = String(orangtuaData.jenisKelamin).toUpperCase().trim();
            if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE' || jkUpper === 'WANITA') {
              normalizedGenderWali = 'PEREMPUAN';
            }
          }

          // Generate email orang tua - SELALU auto-generate berdasarkan data siswa
          let finalEmail = generateOrangTuaEmail(siswaData.nama, nisValue);
          
          // New password format: NISN-YYYY
          const birthDate = siswaData.tanggalLahir ? new Date(siswaData.tanggalLahir) : null;
          const birthYear = birthDate && !isNaN(birthDate.getTime()) ? birthDate.getFullYear() : null;
          const orangTuaPassword = birthYear ? `${nisnValue}-${birthYear}` : nisnValue;
          
          const hashedPassword = await bcrypt.hash(orangTuaPassword, 10);

          // Check if email already exists
          const existingUserEmail = await prisma.user.findUnique({
            where: { email: finalEmail }
          });

          if (existingUserEmail) {
            // Jika email sudah ada, pastikan itu milik orang tua yang sama (by name)
            if (existingUserEmail.name.toLowerCase() !== orangtuaData.nama.toLowerCase()) {
              // Jika nama berbeda tapi email sama (kasus langka dengan NIS sama?), tambahkan suffix
              finalEmail = finalEmail.replace('@ortu.tahfidz.sch.id', `${Math.floor(Math.random() * 100)}@ortu.tahfidz.sch.id`);
            }
          }

          const existingOrangTua = await prisma.orangTua.findFirst({
            where: {
              user: {
                email: finalEmail
              }
            },
            include: { user: true }
          });

          if (existingOrangTua) {
            orangTuaId = existingOrangTua.id;
          } else {
            const orangTua = await prisma.orangTua.create({
              data: {
                noTelepon: orangtuaData.noHP ? orangtuaData.noHP.toString() : null,
                jenisKelamin: normalizedGenderWali,
                status: 'approved',
                user: {
                  create: {
                    email: finalEmail,
                    password: hashedPassword,
                    name: orangtuaData.nama,
                    role: 'ORANG_TUA'
                  }
                }
              }
            });

            orangTuaId = orangTua.id;

            orangTuaAccount = {
              nama: orangtuaData.nama,
              role: 'ORANG_TUA',
              email: finalEmail,
              password: orangTuaPassword,
              keterangan: `Orang tua dari ${siswaData.nama}`
            };
          }
        }

        // Create Siswa Account
        let siswaEmail, siswaPassword;

        if (autoCreateAccount) {
          // Auto-generate email using consistent format: firstname.nis@siswa.tahfidz.sch.id
          siswaEmail = generateSiswaEmail(siswaData.nama, siswaData.nis);
          
          // New password format: always NISN (SIMTAQ standard)
          const nisnValue = siswaData.nisn || siswaData.nis;
          siswaPassword = nisnValue.toString();

          // Check if email already exists
          const existingUserEmail = await prisma.user.findUnique({
            where: { email: siswaEmail }
          });

          if (existingUserEmail) {
            // Skip this student if email already exists (duplicate nama + NIS combination)
            stats.duplicate++;
            errors.push(`Baris ${i + 2}: Email ${siswaEmail} sudah terdaftar (kombinasi Nama + NIS sudah ada)`);
            continue;
          }

          const hashedPassword = await bcrypt.hash(siswaPassword, 10);

          // Parse tanggal lahir - REQUIRED field
          let tanggalLahir = new Date('2000-01-01'); // Default fallback
          if (siswaData.tanggalLahir) {
            try {
              const parsed = new Date(siswaData.tanggalLahir);
              // Check if date is valid
              if (!isNaN(parsed.getTime())) {
                tanggalLahir = parsed;
              } else {
                // Try parsing DD/MM/YYYY format
                const parts = siswaData.tanggalLahir.toString().split('/');
                if (parts.length === 3) {
                  const day = parseInt(parts[0]);
                  const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                  const year = parseInt(parts[2]);
                  const manualParsed = new Date(year, month, day);
                  if (!isNaN(manualParsed.getTime())) {
                    tanggalLahir = manualParsed;
                  }
                }
              }
            } catch (e) {
              console.log(`Invalid date for row ${i + 2}, using default:`, siswaData.tanggalLahir);
            }
          }

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

          // Create siswa
          const siswa = await prisma.siswa.create({
            data: {
              nisn: nisnValue,
              nis: nisValue,
              jenisKelamin: normalizedJenisKelamin,
              tanggalLahir: tanggalLahir,
              alamat: siswaData.alamat || '',
              noTelepon: siswaData.noWhatsApp || null,
              kelasAngkatan: siswaData.kelasAngkatan?.toString() || null,
              tahunAjaranMasukId: tahunAjaranMasukId,
              status: 'approved',
              statusSiswa: 'AKTIF',
              kelas: {
                connect: { id: kelasId }
              },
              user: {
                create: {
                  email: siswaEmail,
                  password: hashedPassword,
                  name: siswaData.nama,
                  role: 'SISWA'
                }
              }
            }
          });

          // Create OrangTuaSiswa relation if orangTuaId exists
          if (orangTuaId) {
            await prisma.orangTuaSiswa.create({
              data: {
                orangTuaId: orangTuaId,
                siswaId: siswa.id,
                hubungan: orangtuaData.jenisWali || 'Orang Tua'
              }
            });
          }

          // Save new siswa account
          newAccounts.push({
            nama: siswaData.nama,
            role: 'SISWA',
            email: siswaEmail,
            password: siswaPassword,
            keterangan: `Kelas: ${siswaData.kelas}, TA: ${siswaData.tahunAjaranMasuk}`
          });

          // Add orang tua account if created
          if (orangTuaAccount) {
            newAccounts.push(orangTuaAccount);
          }

          stats.success++;
        }

      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        stats.failed++;
        errors.push(`Baris ${i + 2}: ${error.message}`);
      }

      // Small delay to prevent connection pool overflow
      if (i < data.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Invalidate cache if any siswa was successfully imported
    if (stats.success > 0) {
      invalidateCache('siswa-list');
      console.log('✅ Cache invalidated for siswa-list');
    }

    return NextResponse.json({
      message: 'Import selesai',
      stats,
      newAccounts,
      errors: errors.slice(0, 20) // Return max 20 errors
    });

  } catch (error) {
    console.error('Smart import error:', error);
    return NextResponse.json(
      { error: 'Gagal import data: ' + error.message },
      { status: 500 }
    );
  }
}
