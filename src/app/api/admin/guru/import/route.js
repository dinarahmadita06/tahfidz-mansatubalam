import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

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
        let nip = row['NIP'] || row['nip'];
        const jenisKelamin = row['Jenis Kelamin'] || row['jenisKelamin'] || row['L/P'];

        if (!nama || !email) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Nama dan Email harus diisi`);
          continue;
        }

        if (!jenisKelamin) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin harus diisi (LAKI_LAKI atau PEREMPUAN)`);
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
          errors.push(`Baris ${i + 2}: Jenis Kelamin harus LAKI_LAKI atau PEREMPUAN (Anda menulis: ${jenisKelamin})`);
          continue;
        }

        // Generate unique NIP if not provided
        if (!nip) {
          nip = `GURU${Date.now()}${i}`;
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
              role: 'GURU',
              isActive: true
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
              nip: nip || existingGuru.nip,
              jenisKelamin: normalizedJenisKelamin,
              bidangKeahlian: row['Bidang Keahlian'] || row['bidangKeahlian'] || row['Mata Pelajaran'] || existingGuru.bidangKeahlian,
              jabatan: row['Jabatan'] || row['jabatan'] || existingGuru.jabatan,
              noTelepon: row['No. Telepon'] || row['noTelepon'] || existingGuru.noTelepon,
              alamat: row['Alamat'] || row['alamat'] || existingGuru.alamat,
            }
          });
        } else {
          // Create new guru
          await prisma.guru.create({
            data: {
              userId,
              nip: nip,
              jenisKelamin: normalizedJenisKelamin,
              bidangKeahlian: row['Bidang Keahlian'] || row['bidangKeahlian'] || row['Mata Pelajaran'] || null,
              jabatan: row['Jabatan'] || row['jabatan'] || null,
              noTelepon: row['No. Telepon'] || row['noTelepon'] || null,
              alamat: row['Alamat'] || row['alamat'] || null,
            }
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        failedCount++;
        errors.push(`Baris ${i + 2}: ${error.message}`);
      }
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
