export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { invalidateCache } from '@/lib/cache';


export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const autoCreateAccount = formData.get('autoCreateAccount') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Read file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Flexible column mapping based on header names
        const headers = Object.keys(row);
        
        // Find the actual column names for required fields
        let namaCol = null;
        let nipCol = null;
        let jenisKelaminCol = null;
        let tanggalLahirCol = null;
        let kelasBinaanCol = null;
        
        for (const header of headers) {
          const normalizedHeader = header.toLowerCase().trim();
          
          if (['nama lengkap', 'nama', 'name', 'full name'].includes(normalizedHeader)) {
            namaCol = header;
          } else if (['nip', 'nomor induk pegawai', 'pegawai id'].includes(normalizedHeader)) {
            nipCol = header;
          } else if (['jenis kelamin', 'gender', 'jenis_kelamin', 'jk', 'l/p'].includes(normalizedHeader)) {
            jenisKelaminCol = header;
          } else if (['tanggal lahir', 'tgl lahir', 'birth date', 'dob', 'tanggal_lahir'].includes(normalizedHeader)) {
            tanggalLahirCol = header;
          } else if (['kelas binaan', 'kelas', 'pembina kelas', 'kelas_binaan', 'class assignment'].includes(normalizedHeader)) {
            kelasBinaanCol = header;
          }
        }
        
        // Extract values using found column names
        const nama = row[namaCol];
        const nip = row[nipCol];
        const jenisKelamin = row[jenisKelaminCol];
        const tanggalLahirStr = row[tanggalLahirCol];
        const kelasBinaan = row[kelasBinaanCol];
        
        // Check for required fields
        if (!nama) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'Nama Lengkap' tidak ditemukan atau kosong`);
          continue;
        }
        
        if (!nip) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'NIP' tidak ditemukan atau kosong`);
          continue;
        }
        
        if (!jenisKelamin) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'Jenis Kelamin' tidak ditemukan atau kosong`);
          continue;
        }
        
        if (!tanggalLahirStr) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'Tanggal Lahir' tidak ditemukan atau kosong`);
          continue;
        }

        // Parse tanggal lahir with multiple format support
        let tanggalLahir = null;
        if (tanggalLahirStr) {
          // Try different date formats
          const dateFormats = [
            () => new Date(tanggalLahirStr),
            () => {
              // MM/DD/YYYY format
              const parts = tanggalLahirStr.toString().split(/[\/-]/);
              if (parts.length === 3) {
                const [month, day, year] = parts;
                return new Date(year, month - 1, day);
              }
              return null;
            },
            () => {
              // DD/MM/YYYY format
              const parts = tanggalLahirStr.toString().split(/[\/-]/);
              if (parts.length === 3) {
                const [day, month, year] = parts;
                return new Date(year, month - 1, day);
              }
              return null;
            },
            () => {
              // YYYY-MM-DD format
              const parts = tanggalLahirStr.toString().split('-');
              if (parts.length === 3) {
                const [year, month, day] = parts;
                return new Date(year, month - 1, day);
              }
              return null;
            }
          ];
          
          for (const formatFunc of dateFormats) {
            try {
              const parsed = formatFunc();
              if (parsed && !isNaN(parsed.getTime())) {
                tanggalLahir = parsed;
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }

        if (!tanggalLahir) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Tanggal lahir tidak valid (format yang didukung: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY)`);
          continue;
        }

        // Normalize jenisKelamin
        let normalizedJenisKelamin = 'LAKI_LAKI';
        const jkUpper = String(jenisKelamin).toUpperCase().trim();
        if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE') {
          normalizedJenisKelamin = 'PEREMPUAN';
        } else if (jkUpper === 'LAKI_LAKI' || jkUpper === 'LAKI-LAKI' || jkUpper === 'L' || jkUpper === 'MALE') {
          normalizedJenisKelamin = 'LAKI_LAKI';
        } else {
          failedCount++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin harus L atau P (Anda menulis: ${jenisKelamin})`);
          continue;
        }

        // Generate internal email if not provided
        const internalEmail = `guru.${Date.now()}.${Math.random().toString(36).substring(2, 10)}@internal.tahfidz.edu.id`.toLowerCase();

        // Check if user already exists by name or NIP
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { name: nama.trim() },
              { email: internalEmail }
            ]
          }
        });

        let userId;

        if (existingUser) {
          userId = existingUser.id;
        } else if (autoCreateAccount) {
          // Generate password
          const defaultPassword = `guru${Math.random().toString(36).slice(-8)}`;
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);

          // Create user account
          const newUser = await prisma.user.create({
            data: {
              email: internalEmail,
              name: nama.trim(),
              password: hashedPassword,
              role: 'GURU'
            }
          });

          userId = newUser.id;
        } else {
          failedCount++;
          errors.push(`Baris ${i + 2}: Gagal membuat akun guru karena autoCreateAccount dinonaktifkan`);
          continue;
        }

        // Check if guru already exists
        const existingGuru = await prisma.guru.findFirst({
          where: { userId }
        });

        if (existingGuru) {
          // Update existing guru
          await prisma.guru.update({
            where: { id: existingGuru.id },
            data: {
              nip: nip ? String(nip) : null,
              jenisKelamin: normalizedJenisKelamin,
              tanggalLahir: tanggalLahir,
            }
          });
        } else {
          // Create new guru
          const newGuru = await prisma.guru.create({
            data: {
              userId,
              nip: nip ? String(nip) : null,
              jenisKelamin: normalizedJenisKelamin,
              tanggalLahir: tanggalLahir,
            }
          });

          // Handle Kelas Binaan for new guru
          if (kelasBinaan !== undefined && kelasBinaan !== null && kelasBinaan !== '') {
            const kelasNames = String(kelasBinaan).split(',').map(s => s.trim()).filter(Boolean);
            for (const name of kelasNames) {
              const kelas = await prisma.kelas.findFirst({
                where: { 
                  nama: { equals: name, mode: 'insensitive' },
                  status: 'AKTIF'
                }
              });
              if (kelas) {
                await prisma.guruKelas.create({
                  data: {
                    guruId: newGuru.id,
                    kelasId: kelas.id
                  }
                });
              }
            }
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        failedCount++;
        errors.push(`Baris ${i + 2}: ${error.message}`);
      }
    }

    // Invalidate guru cache if any import succeeded
    if (successCount > 0) {
      invalidateCache('guru-list');
    }

    return NextResponse.json({
      message: 'Import selesai',
      stats: {
        success: successCount,
        failed: failedCount,
        total: data.length
      },
      errors: errors.slice(0, 10) // Return max 10 errors
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Gagal import data: ' + error.message },
      { status: 500 }
    );
  }
}
