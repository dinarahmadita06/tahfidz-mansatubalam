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

        if (!guruData?.nip) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: NIP guru harus diisi`);
          continue;
        }

        if (!guruData?.jenisKelamin) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Jenis Kelamin guru harus diisi`);
          continue;
        }

        if (!guruData?.tanggalLahir) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tanggal Lahir guru harus diisi`);
          continue;
        }

        // Generate internal email if not provided
        const internalEmail = `guru.${Date.now()}.${Math.random().toString(36).substring(2, 10)}@internal.tahfidz.edu.id`.toLowerCase();

        // Check duplicate by name
        const existingUser = await prisma.user.findFirst({
          where: { name: guruData.nama }
        });

        if (existingUser) {
          stats.duplicate++;
          errors.push(`Baris ${i + 2}: Guru dengan nama ${guruData.nama} sudah terdaftar`);
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

        // Parse tanggal lahir with multiple format support
        let tanggalLahir = null;
        if (guruData.tanggalLahir) {
          // Try different date formats
          const dateFormats = [
            () => new Date(guruData.tanggalLahir),
            () => {
              // MM/DD/YYYY format
              const parts = guruData.tanggalLahir.toString().split(/[\/-]/);
              if (parts.length === 3) {
                const [month, day, year] = parts;
                return new Date(year, month - 1, day);
              }
              return null;
            },
            () => {
              // DD/MM/YYYY format
              const parts = guruData.tanggalLahir.toString().split(/[\/-]/);
              if (parts.length === 3) {
                const [day, month, year] = parts;
                return new Date(year, month - 1, day);
              }
              return null;
            },
            () => {
              // YYYY-MM-DD format
              const parts = guruData.tanggalLahir.toString().split('-');
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
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tanggal lahir tidak valid (format yang didukung: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY)`);
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
              email: internalEmail,
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
          email: internalEmail,
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
