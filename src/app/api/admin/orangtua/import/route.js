export const dynamic = 'force-dynamic';
export const revalidate = 0;
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
        const namaSiswa = row['Nama Siswa'] || row['namaSiswa'];

        if (!nama || !email) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Nama dan Email harus diisi`);
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
          const defaultPassword = `ortu${Math.random().toString(36).slice(-8)}`;
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);

          // Create user account
          const newUser = await prisma.user.create({
            data: {
              email: email.toLowerCase().trim(),
              name: nama.trim(),
              password: hashedPassword,
              role: 'ORANG_TUA',
              isActive: true
            }
          });

          userId = newUser.id;
        } else {
          failedCount++;
          errors.push(`Baris ${i + 2}: User dengan email ${email} tidak ditemukan`);
          continue;
        }

        // Find siswa by name if provided
        let siswaId = null;
        if (namaSiswa) {
          const siswa = await prisma.siswa.findFirst({
            where: {
              user: {
                name: { contains: namaSiswa }
              }
            }
          });
          siswaId = siswa?.id;
        }

        // Check if orang tua already exists
        const existingOrangTua = await prisma.orangTua.findFirst({
          where: { userId }
        });

        if (existingOrangTua) {
          // Update existing orang tua
          await prisma.orangTua.update({
            where: { id: existingOrangTua.id },
            data: {
              siswaId: siswaId || existingOrangTua.siswaId,
              hubungan: row['Hubungan'] || row['hubungan'] || existingOrangTua.hubungan,
              noTelepon: row['No. Telepon'] || row['noTelepon'] || existingOrangTua.noTelepon,
            }
          });
        } else {
          // Create new orang tua
          await prisma.orangTua.create({
            data: {
              userId,
              siswaId,
              hubungan: row['Hubungan'] || row['hubungan'] || '',
              noTelepon: row['No. Telepon'] || row['noTelepon'] || '',
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
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Gagal import data: ' + error.message },
      { status: 500 }
    );
  }
}
