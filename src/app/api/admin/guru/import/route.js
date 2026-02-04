export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { invalidateCache, invalidateCacheByPrefix } from '@/lib/cache';
import { buildGuruCredentials } from '@/lib/passwordUtils';

/**
 * Helper: Generate next guru usernames (G###)
 * @param {number} lastNumber - Last number from database (e.g., 3 for G003)
 * @param {number} count - Number of usernames to generate
 * @returns {string[]} Array of usernames (e.g., ['G004', 'G005'])
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return trimmed;
      }
    }

    // Try parsing DD/MM/YYYY, MM/DD/YYYY, D/M/YYYY formats
    const parts = trimmed.split(/[\/\-]/);
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
        // Format: YYYY/?/?
        year = p1;
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
    const createdGurus = [];

    // Get last username number (G###) - ONCE per import batch
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
      // Extract number from G### format
      const match = lastUser.username.match(/^G(\d+)$/);
      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    // Process each row with transaction for safety
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Flexible column mapping based on header names
        const headers = Object.keys(row);
        
        // Find the actual column names for required fields
        let kodeGuruCol = null;
        let namaCol = null;
        let nipCol = null;
        let jenisKelaminCol = null;
        let tanggalLahirCol = null;
        let kelasBinaanCol = null;
        
        for (const header of headers) {
          const normalizedHeader = header.toLowerCase().trim();
          
          if (['kode guru', 'kode guru / username', 'username', 'kode', 'user'].includes(normalizedHeader)) {
            kodeGuruCol = header;
          } else if (['nama lengkap', 'nama', 'name', 'full name'].includes(normalizedHeader)) {
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
        const kodeGuru = row[kodeGuruCol];
        const nama = row[namaCol];
        const nip = row[nipCol];
        const jenisKelamin = row[jenisKelaminCol];
        const tanggalLahirStr = row[tanggalLahirCol];
        const kelasBinaan = row[kelasBinaanCol];
        
        // Check for required fields
        if (!kodeGuru) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'Kode Guru / Username' tidak ditemukan atau kosong`);
          continue;
        }
        
        if (!nama) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'Nama Lengkap' tidak ditemukan atau kosong`);
          continue;
        }
        
        if (!jenisKelamin) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kolom 'Jenis Kelamin' tidak ditemukan atau kosong`);
          continue;
        }
        
        // Validate username (kode guru) harus angka
        const username = String(kodeGuru).trim();
        if (!/^[0-9]+$/.test(username)) {
          failedCount++;
          errors.push(`Baris ${i + 2}: Kode Guru/Username harus berupa angka (Anda menulis: ${kodeGuru})`);
          continue;
        }

        // Parse tanggal lahir (OPTIONAL)
        let tanggalLahir = null;
        let tanggalLahirString = null;
        
        if (tanggalLahirStr && tanggalLahirStr.toString().trim() !== '') {
          tanggalLahirString = parseExcelDate(tanggalLahirStr);
          
          if (!tanggalLahirString) {
            failedCount++;
            errors.push(`Baris ${i + 2}: Tanggal lahir tidak valid (input: ${tanggalLahirStr})`);
            continue;
          }
          
          // Convert YYYY-MM-DD string to Date object at UTC midnight
          const [year, month, day] = tanggalLahirString.split('-').map(Number);
          tanggalLahir = new Date(Date.UTC(year, month - 1, day));
          
          // Validate Date object is valid
          if (isNaN(tanggalLahir.getTime())) {
            failedCount++;
            errors.push(`Baris ${i + 2}: Tanggal lahir tidak dapat diproses (input: ${tanggalLahirStr}, parsed: ${tanggalLahirString})`);
            continue;
          }
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

        let userId;
        const rawPassword = 'MAN1'; // Password default untuk semua guru

        // Hash password MAN1
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        console.log(`📋 [IMPORT GURU Baris ${i + 2}] Username: ${username}, Password: MAN1`);

        // Generate internal email with username
        const internalEmail = `guru.${username}@internal.tahfidz.edu.id`;

        // Check if user already exists by username (case-insensitive)
        const existingUser = await prisma.user.findFirst({
          where: { 
            username: { 
              equals: username, 
              mode: 'insensitive' 
            } 
          }
        });

        if (existingUser) {
          // Skip if user already exists
          failedCount++;
          errors.push(`Baris ${i + 2}: Username ${username} sudah digunakan`);
          continue;
        }

        if (autoCreateAccount) {
          const newUser = await prisma.user.create({
            data: {
              email: internalEmail,
              name: nama.trim(),
              username: username, // Kode guru sebagai username
              password: passwordHash, // MAN1 hash
              role: 'GURU',
              isActive: true
            }
          });

          userId = newUser.id;
        } else {
          failedCount++;
          errors.push(`Baris ${i + 2}: Gagal membuat akun guru karena autoCreateAccount dinonaktifkan`);
          continue;
        }

        // Create new guru (no update for existing)
        const newGuru = await prisma.guru.create({
          data: {
            userId,
            nip: nip ? String(nip) : null,
            jenisKelamin: normalizedJenisKelamin,
            tanggalLahir: tanggalLahir, // Could be null if not provided
          }
        });

        // Handle Kelas Binaan assignment
        const assignedKelas = [];
        const failedKelas = [];
        
        if (kelasBinaan !== undefined && kelasBinaan !== null && kelasBinaan !== '') {
          const kelasNames = String(kelasBinaan).split(',').map(s => s.trim()).filter(Boolean);
          
          for (const kelasName of kelasNames) {
            try {
              const kelas = await prisma.kelas.findFirst({
                where: { 
                  nama: { equals: kelasName, mode: 'insensitive' },
                  status: 'AKTIF'
                },
                select: { id: true, nama: true }
              });
              
              if (kelas) {
                // Check if already assigned
                const existing = await prisma.guruKelas.findFirst({
                  where: {
                    guruId: newGuru.id,
                    kelasId: kelas.id
                  }
                });
                
                if (!existing) {
                  await prisma.guruKelas.create({
                    data: {
                      guruId: newGuru.id,
                      kelasId: kelas.id,
                      peran: 'utama'  // Set as pembina utama
                    }
                  });
                  assignedKelas.push(kelas.nama);
                }
              } else {
                failedKelas.push(kelasName);
              }
            } catch (kelasError) {
              console.error(`Error assigning kelas ${kelasName}:`, kelasError);
              failedKelas.push(kelasName);
            }
          }
        }

        // Track created guru info
        const guruInfo = {
          nama: nama,
          username: username,
          nip: nip,
          kelasBinaan: assignedKelas.length > 0 ? assignedKelas.join(', ') : '-'
        };
        
        if (rawPassword) {
          guruInfo.password = rawPassword;
        }
        
        if (failedKelas.length > 0) {
          guruInfo.warning = `Kelas tidak ditemukan: ${failedKelas.join(', ')}`;
        }
        
        createdGurus.push(guruInfo);
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
      invalidateCacheByPrefix('kelas-list');  // Invalidate all kelas cache variants for pembina sync
    }

    return NextResponse.json({
      message: 'Import selesai',
      stats: {
        success: successCount,
        failed: failedCount,
        total: data.length
      },
      createdGurus: createdGurus,
      errors: errors.slice(0, 20) // Return max 20 errors
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Gagal import data: ' + error.message },
      { status: 500 }
    );
  }
}
