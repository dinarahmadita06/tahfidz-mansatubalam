import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { invalidateCache } from '@/lib/cache';

// Helper untuk generate username
function generateUsername(nama, type = 'siswa') {
  const cleanName = nama
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(' ')[0]; // Ambil nama depan

  const timestamp = Date.now().toString().slice(-4);
  return `${cleanName}${timestamp}`;
}

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

        // Validasi required fields siswa (allow either nis or nisn)
        const nisValue = siswaData.nis || siswaData.nisn;
        if (!siswaData || !siswaData.nama || !nisValue) {
          console.log(`Row ${i + 2} validation failed:`, {
            hasSiswaData: !!siswaData,
            hasNama: !!siswaData?.nama,
            hasNIS: !!nisValue,
            siswaKeys: siswaData ? Object.keys(siswaData) : []
          });
          stats.failed++;
          errors.push(`Baris ${i + 2}: Nama dan NIS siswa harus diisi (kolom kosong atau tidak terdeteksi)`);
          continue;
        }

        // Check duplicate NIS with timeout
        const existingNIS = await Promise.race([
          prisma.siswa.findUnique({
            where: { nis: nisValue?.toString() }
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 5000)
          )
        ]).catch(err => {
          console.error('Error checking NIS:', err);
          return null;
        });

        if (existingNIS) {
          stats.duplicate++;
          errors.push(`Baris ${i + 2}: NIS ${nisValue} sudah terdaftar`);
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
                { nama: { contains: kelasInput, mode: 'insensitive' } },
                { nama: { equals: kelasInput, mode: 'insensitive' } }
              ]
            }
          });

          // If still not found, get first kelas as fallback
          if (!kelas) {
            kelas = await prisma.kelas.findFirst({
              orderBy: { createdAt: 'desc' }
            });
          }

          kelasId = kelas?.id;
        }

        // If still no kelasId, get any kelas (required field)
        if (!kelasId) {
          const defaultKelas = await prisma.kelas.findFirst({
            orderBy: { createdAt: 'desc' }
          });
          if (!defaultKelas) {
            throw new Error('Tidak ada kelas yang tersedia. Silakan buat kelas terlebih dahulu.');
          }
          kelasId = defaultKelas.id;
        }

        // Process Orang Tua (if data exists)
        let orangTuaId = null;
        let orangTuaAccount = null;

        if (orangtuaData?.nama && autoCreateAccount) {
          // Check if orang tua already exists by name
          const existingOrangTua = await prisma.orangTua.findFirst({
            where: {
              user: {
                name: { equals: orangtuaData.nama, mode: 'insensitive' }
              }
            },
            include: {
              user: true
            }
          });

          if (existingOrangTua) {
            orangTuaId = existingOrangTua.id;
          } else {
            // Create new orang tua account
            const orangTuaEmail = orangtuaData.email ||
              `${generateUsername(orangtuaData.nama, 'ortu')}@tahfidz.ortu`;
            const orangTuaPassword = generatePassword(8);
            const hashedPassword = await bcrypt.hash(orangTuaPassword, 10);

            // Check if email already exists
            const existingUserEmail = await prisma.user.findUnique({
              where: { email: orangTuaEmail }
            });

            if (!existingUserEmail) {
              const orangTua = await prisma.orangTua.create({
                data: {
                  noHP: orangtuaData.noHP ? orangtuaData.noHP.toString() : null,
                  user: {
                    create: {
                      email: orangTuaEmail,
                      password: hashedPassword,
                      name: orangtuaData.nama,
                      role: 'ORANG_TUA'
                    }
                  }
                }
              });

              orangTuaId = orangTua.id;

              // Save new account info
              orangTuaAccount = {
                nama: orangtuaData.nama,
                role: 'ORANG_TUA',
                email: orangTuaEmail,
                password: orangTuaPassword,
                keterangan: `Orang tua dari ${siswaData.nama}`
              };
            }
          }
        }

        // Create Siswa Account
        let siswaEmail, siswaPassword;

        if (autoCreateAccount) {
          // Use NIS as default username if available, otherwise generate
          const baseUsername = siswaData.nis || generateUsername(siswaData.nama, 'siswa');
          siswaEmail = siswaData.email || `${baseUsername}@tahfidz.siswa`;
          siswaPassword = siswaData.nis?.toString() || generatePassword(8);

          // Check if email already exists
          const existingUserEmail = await prisma.user.findUnique({
            where: { email: siswaEmail }
          });

          if (existingUserEmail) {
            // Generate alternative email
            siswaEmail = `${generateUsername(siswaData.nama, 'siswa')}@tahfidz.siswa`;
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
              nis: siswaData.nis?.toString() || siswaData.nisn?.toString() || '',
              jenisKelamin: normalizedJenisKelamin,
              tanggalLahir: tanggalLahir,
              alamat: siswaData.alamat || '',
              noTelepon: siswaData.noTelepon || siswaData.noHP || null,
              status: 'approved', // Auto-approve
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
                hubungan: 'Orang Tua' // Default hubungan
              }
            });
          }

          // Save new siswa account
          newAccounts.push({
            nama: siswaData.nama,
            role: 'SISWA',
            email: siswaEmail,
            password: siswaPassword,
            keterangan: kelasId ? `Kelas: ${siswaData.kelas}` : '-'
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
