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
        // Validasi required fields
        const nama = row['Nama Lengkap'] || row['Nama'] || row['nama'];
        const email = row['Email'] || row['email'];
        const nip = row['NIP'] || row['nip'] || null;
        const jenisKelamin = row['Jenis Kelamin'] || row['jenisKelamin'] || row['L/P'];
        const tanggalLahirStr = row['Tanggal Lahir'] || row['tanggalLahir'];
        const noWhatsApp = row['Nomor WhatsApp'] || row['No. Telepon'] || row['noTelepon'];
        const alamat = row['Alamat'] || row['alamat'];
        const kelasBinaan = row['Kelas Binaan'] || row['kelasBinaan'];

        if (!nama || !email) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Nama Lengkap dan Email harus diisi`);
          continue;
        }

        if (!jenisKelamin) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin harus diisi (L/P)`);
          continue;
        }

        // Parse tanggal lahir
        let tanggalLahir = null;
        if (tanggalLahirStr) {
          try {
            const parsed = new Date(tanggalLahirStr);
            if (!isNaN(parsed.getTime())) {
              tanggalLahir = parsed;
            }
          } catch (e) {
            console.log(`Invalid date for row ${i + 2}:`, tanggalLahirStr);
          }
        }

        if (!tanggalLahir) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Tanggal lahir wajib diisi (format YYYY-MM-DD)`);
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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() }
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
              email: email.toLowerCase().trim(),
              name: nama.trim(),
              password: hashedPassword,
              role: 'GURU'
            }
          });

          userId = newUser.id;
        } else {
          failedCount++;
          errors.push(`Baris ${i + 2}: User dengan email ${email} tidak ditemukan`);
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
              noTelepon: noWhatsApp ? String(noWhatsApp) : null,
              alamat: alamat || '',
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
              noTelepon: noWhatsApp ? String(noWhatsApp) : null,
              alamat: alamat || '',
            }
          });

          // Handle Kelas Binaan for new guru
          if (kelasBinaan) {
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
