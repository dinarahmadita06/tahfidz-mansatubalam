export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { invalidateCache } from '@/lib/cache';
import { generateGuruEmail, generateGuruPassword } from '@/lib/passwordUtils';


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
      const { guru: guruData } = row;

      try {
        if (!guruData?.nama) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Nama guru harus diisi`);
          continue;
        }

        if (!guruData?.email) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Email guru harus diisi`);
          continue;
        }

        const emailLower = guruData.email.toLowerCase().trim();

        // Check duplicate email
        const existingUser = await prisma.user.findUnique({
          where: { email: emailLower }
        });

        if (existingUser) {
          stats.duplicate++;
          errors.push(`Baris ${i + 2}: Email ${emailLower} sudah terdaftar`);
          continue;
        }

        // Normalize gender
        let normalizedJK = 'LAKI_LAKI';
        if (guruData.jenisKelamin) {
          const jkUpper = String(guruData.jenisKelamin).toUpperCase().trim();
          if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE' || jkUpper === 'WANITA') {
            normalizedJK = 'PEREMPUAN';
          }
        }

        // Parse tanggal lahir
        let tanggalLahir = null;
        if (guruData.tanggalLahir) {
          try {
            const parsed = new Date(guruData.tanggalLahir);
            if (!isNaN(parsed.getTime())) {
              tanggalLahir = parsed;
            }
          } catch (e) {
            console.log(`Invalid date for row ${i + 2}:`, guruData.tanggalLahir);
          }
        }

        if (!tanggalLahir) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tanggal lahir wajib diisi (format YYYY-MM-DD)`);
          continue;
        }

        // Generate password if needed
        const rawPassword = generateGuruPassword(guruData.nama, tanggalLahir);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Process Kelas Binaan
        const kelasIds = [];
        if (guruData.kelasBinaan) {
          const kelasNames = guruData.kelasBinaan.split(',').map(s => s.trim()).filter(Boolean);
          for (const name of kelasNames) {
            const kelas = await prisma.kelas.findFirst({
              where: { 
                nama: { equals: name, mode: 'insensitive' },
                status: 'AKTIF'
              }
            });
            if (kelas) {
              kelasIds.push(kelas.id);
            }
          }
        }

        // Create Guru in transaction
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: emailLower,
              name: guruData.nama,
              password: hashedPassword,
              role: 'GURU',
              isActive: true
            }
          });

          const guru = await tx.guru.create({
            data: {
              userId: user.id,
              nip: guruData.nip ? String(guruData.nip) : null,
              jenisKelamin: normalizedJK,
              tanggalLahir: tanggalLahir,
              noTelepon: guruData.noWhatsApp ? String(guruData.noWhatsApp) : null,
              alamat: guruData.alamat || '',
              // Remove bidangKeahlian and other deprecated fields if schema allows
            }
          });

          // Connect Kelas Binaan
          if (kelasIds.length > 0) {
            await Promise.all(kelasIds.map(kelasId => 
              tx.guruKelas.create({
                data: {
                  guruId: guru.id,
                  kelasId: kelasId
                }
              })
            ));
          }
        });

        newAccounts.push({
          nama: guruData.nama,
          role: 'GURU',
          email: emailLower,
          password: rawPassword,
          keterangan: `NIP: ${guruData.nip || '-'}`
        });

        stats.success++;

      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        stats.failed++;
        errors.push(`Baris ${i + 2}: ${error.message}`);
      }

      // Small delay
      if (i < data.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    if (stats.success > 0) {
      invalidateCache('guru-list');
    }

    return NextResponse.json({
      message: 'Import selesai',
      stats,
      newAccounts,
      errors: errors.slice(0, 20)
    });

  } catch (error) {
    console.error('Guru smart import error:', error);
    return NextResponse.json(
      { error: 'Gagal import data: ' + error.message },
      { status: 500 }
    );
  }
}
