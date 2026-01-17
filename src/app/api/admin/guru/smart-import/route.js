export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { invalidateCache, invalidateCacheByPrefix } from '@/lib/cache';
import { generateGuruPassword } from '@/lib/passwordUtils';

/**
 * Helper: Generate next guru usernames (G###)
 */
function generateNextGuruUsernames(lastNumber, count) {
  const usernames = [];
  for (let i = 1; i <= count; i++) {
    const nextNumber = lastNumber + i;
    const username = `G${String(nextNumber).padStart(3, '0')}`;
    usernames.push(username);
  }
  return usernames;
}

/**
 * Helper: Parse Excel date to YYYY-MM-DD format
 * Handles Excel serial numbers and various string formats
 * @param {any} value - Excel cell value (number or string)
 * @returns {string|null} - Date in YYYY-MM-DD format or null if invalid
 */
function parseExcelDate(value) {
  if (!value) return null;

  // Handle Excel serial number (numeric)
  if (typeof value === 'number') {
    // Excel date serial: days since 1900-01-01 (with 1900 leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  // Handle string formats
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Already YYYY-MM-DD format
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return trimmed;
      }
    }

    // Try parsing DD/MM/YYYY, MM/DD/YYYY, D/M/YYYY formats
    const parts = trimmed.split(/[/\-]/);
    if (parts.length === 3) {
      const [p1, p2, p3] = parts.map(s => parseInt(s, 10));
      
      // Determine year position (always the 4-digit or largest number)
      let year, month, day;
      
      if (p3 > 1000 || p3.toString().length === 4) {
        // Format: ?/?/YYYY
        year = p3;
        
        // Determine month vs day
        if (p1 > 12) {
          // p1 must be day (> 12)
          day = p1;
          month = p2;
        } else if (p2 > 12) {
          // p2 must be day (> 12)
          day = p2;
          month = p1;
        } else {
          // Ambiguous: both <= 12
          // Default to DD-MM-YYYY (Indonesian format)
          day = p1;
          month = p2;
        }
      } else if (p1 > 1000 || p1.toString().length === 4) {
        // Format: YYYY/?/?\n        year = p1;
        month = p2;
        day = p3;
      } else {
        return null; // Invalid format
      }

      // Validate
      if (year < 1900 || year > 2100) return null;
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;

      // Format to YYYY-MM-DD
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
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

    // Get last username number (G###)
    const lastUser = await prisma.user.findFirst({
      where: {
        username: {
          startsWith: 'G',
          not: null
        }
      },
      orderBy: {
        username: 'desc'
      },
      select: {
        username: true
      }
    });

    let lastNumber = 0;
    if (lastUser && lastUser.username) {
      const match = lastUser.username.match(/^G(\d+)$/);
      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    // Generate usernames for all rows
    const generatedUsernames = generateNextGuruUsernames(lastNumber, data.length);

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { guru: guruData } = row;
      const username = generatedUsernames[i];

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

        // Generate internal email with username
        const internalEmail = `${username.toLowerCase()}@internal.tahfidz.edu.id`;

        // Check duplicate by username
        const existingUser = await prisma.user.findUnique({
          where: { username: username }
        });

        if (existingUser) {
          stats.duplicate++;
          errors.push(`Baris ${i + 2}: Username ${username} sudah digunakan`);
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

        // Parse tanggal lahir using parseExcelDate helper
        const tanggalLahirString = parseExcelDate(guruData.tanggalLahir);
        
        if (!tanggalLahirString) {
          stats.failed++;
          errors.push(`Baris ${i + 2}: Tanggal lahir tidak valid (input: ${guruData.tanggalLahir})`);
          continue;
        }

        // Convert YYYY-MM-DD string to Date object at UTC midnight (no timezone shift)
        const [year, month, day] = tanggalLahirString.split('-').map(Number);
        const tanggalLahir = new Date(Date.UTC(year, month - 1, day));

        // Generate password: YYYY-MM-DD format dari tanggal lahir
        const rawPassword = tanggalLahirString; // Format: YYYY-MM-DD
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
              username: username,
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
                  kelasId: kelasId,
                  peran: 'utama'  // Set as pembina utama
                }
              })
            ));
          }
        });

        newAccounts.push({
          nama: guruData.nama,
          username: username,
          role: 'GURU',
          email: internalEmail,
          password: rawPassword,
          keterangan: `NIP: ${guruData.nip || '-'}`,
          kelasBinaan: kelasIds.length > 0 ? `${kelasIds.length} kelas` : '-'
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
      invalidateCacheByPrefix('kelas-list');  // Invalidate all kelas cache variants for pembina sync
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
