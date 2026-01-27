export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';
import { generateSiswaEmail, generateOrangTuaEmail } from '@/lib/siswaUtils';


export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siswaData } = body; // Array of siswa objects

    if (!Array.isArray(siswaData) || siswaData.length === 0) {
      return NextResponse.json({ error: 'Data siswa tidak valid' }, { status: 400 });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each siswa
    for (const data of siswaData) {
      try {
        // Map Excel headers to internal fields
        const name = data['Nama Siswa'] || data.name;
        const nisn = String(data['NISN'] || data.nisn || '').trim();
        const nis = String(data['NIS'] || data.nis || '').trim();
        const kelasInput = String(data['Kelas Saat Ini'] || data.kelasId || '').trim();
        const jenisKelamin = data['Jenis Kelamin'] || data.jenisKelamin;
        const tanggalLahir = data['Tanggal Lahir'] || data.tanggalLahir;
        const alamat = data['Alamat'] || data.alamat;
        const noWhatsApp = data['Nomor WhatsApp Siswa'] || data.noWhatsApp;
        const kelasAngkatan = data['Diterima di Kelas / Angkatan'] || data.kelasAngkatan;
        const tahunAjaranMasuk = data['Tahun Ajaran Masuk'] || data.tahunAjaranMasuk;

        const jenisWali = data['Jenis Wali'] || data.hubungan || 'Orang Tua';
        const namaWali = data['Nama Wali'] || data.namaOrtu;
        const jkWali = data['Jenis Kelamin Wali'] || 'LAKI_LAKI';
        const noHPWali = data['No HP Wali'] || data.noHPOrtu || '';

        // Log each row untuk debugging
        console.log(`📋 [IMPORT ROW] ${name} | NIS: ${nis} | NISN: ${nisn} | TahunAjaran: ${tahunAjaranMasuk} | Wali: ${namaWali}`);

        // Validate required fields (noHPWali bisa kosong)
        if (!name || !nisn || !nis || !kelasInput || !jenisKelamin || !tanggalLahir || !tahunAjaranMasuk || !namaWali) {
          const missingFields = [];
          if (!name) missingFields.push('Nama Siswa');
          if (!nisn) missingFields.push('NISN');
          if (!nis) missingFields.push('NIS');
          if (!kelasInput) missingFields.push('Kelas');
          if (!jenisKelamin) missingFields.push('JK');
          if (!tanggalLahir) missingFields.push('Tgl Lahir');
          if (!tahunAjaranMasuk) missingFields.push('Tahun Ajaran');
          if (!namaWali) missingFields.push('Nama Wali');
          
          console.error(`❌ [IMPORT ERROR] Missing fields: ${missingFields.join(', ')}`);
          
          results.failed.push({
            data,
            error: `Data tidak lengkap: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Check if nisn or nis already exists
        const existingSiswa = await prisma.siswa.findFirst({
          where: {
            OR: [
              { nis: nis },
              { nisn: nisn }
            ]
          }
        });

        if (existingSiswa) {
          results.failed.push({
            data,
            error: `NIS ${nis} atau NISN ${nisn} sudah terdaftar`
          });
          continue;
        }

        // Find Tahun Ajaran
        const ta = await prisma.tahunAjaran.findFirst({
          where: {
            nama: { contains: String(tahunAjaranMasuk), mode: 'insensitive' }
          }
        });

        if (!ta) {
          results.failed.push({
            data,
            error: `Tahun Ajaran "${tahunAjaranMasuk}" tidak ditemukan`
          });
          continue;
        }

        // Check if kelas exists
        let kelas = await prisma.kelas.findFirst({
          where: {
            OR: [
              { id: { equals: kelasInput } },
              { nama: { equals: kelasInput, mode: 'insensitive' } }
            ]
          }
        });

        if (!kelas) {
          results.failed.push({
            data,
            error: `Kelas "${kelasInput}" tidak ditemukan`
          });
          continue;
        }

        // Handle orang tua
        let orangTuaId = null;
        let finalEmailWali = generateOrangTuaEmail(name, nis);

        if (namaWali) {
          // Default password according to SIMTAQ standard: NISN-YYYY
          // Parse tanggalLahir safely to avoid timezone shift
          let bYear = null;
          try {
            const dateStr = String(tanggalLahir).trim();
            let parsedDate = null;
            
            // Try different date formats
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              // YYYY-MM-DD format
              const [y, m, d] = dateStr.split('-').map(Number);
              parsedDate = new Date(Date.UTC(y, m - 1, d));
            } else {
              // Let JavaScript try to parse it
              parsedDate = new Date(tanggalLahir);
            }
            
            if (!isNaN(parsedDate.getTime())) {
              bYear = parsedDate.getUTCFullYear();
            }
          } catch (e) {
            console.error('Error parsing tanggalLahir for password:', e);
          }
          
          const passwordOrtu = bYear ? `${nisn}-${bYear}` : nisn;
          const hashedPasswordOrtu = await bcrypt.hash(passwordOrtu, 10);

          let orangTua = await prisma.orangTua.findFirst({
            where: {
              user: { email: finalEmailWali }
            }
          });

          if (!orangTua) {
            const existingUser = await prisma.user.findUnique({ where: { email: finalEmailWali } });
            if (!existingUser) {
              // Normalize gender wali
              let normGkWali = 'LAKI_LAKI';
              const jkW = String(jkWali).toUpperCase();
              if (jkW === 'P' || jkW === 'PEREMPUAN' || jkW === 'WANITA' || jkW === 'FEMALE') {
                normGkWali = 'PEREMPUAN';
              }

              orangTua = await prisma.orangTua.create({
                data: {
                  jenisKelamin: normGkWali,
                  status: 'approved',
                  user: {
                    create: {
                      email: finalEmailWali,
                      password: hashedPasswordOrtu,
                      name: namaWali,
                      role: 'ORANG_TUA'
                    }
                  }
                }
              });
            }
          }

          if (orangTua) {
            orangTuaId = orangTua.id;
          }
        }

        // Normalize gender siswa
        let normGkSiswa = 'LAKI_LAKI';
        const jkS = String(jenisKelamin).toUpperCase();
        if (jkS === 'P' || jkS === 'PEREMPUAN' || jkS === 'WANITA' || jkS === 'FEMALE') {
          normGkSiswa = 'PEREMPUAN';
        }

        // Auto-generate email using consistent format
        const emailSiswa = generateSiswaEmail(name, nis);

        // Check if email already exists
        const existingUserEmail = await prisma.user.findUnique({ where: { email: emailSiswa } });
        if (existingUserEmail) {
          results.failed.push({
            data,
            error: `Email ${emailSiswa} sudah terdaftar`
          });
          continue;
        }

        // Default password is NISN
        const hashedPasswordSiswa = await bcrypt.hash(nisn, 10);

        // Parse tanggalLahir to Date object at UTC midnight (no timezone shift)
        let tanggalLahirDate = null;
        try {
          const dateStr = String(tanggalLahir).trim();
          
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            // YYYY-MM-DD format - create at UTC midnight
            const [y, m, d] = dateStr.split('-').map(Number);
            tanggalLahirDate = new Date(Date.UTC(y, m - 1, d));
          } else {
            // Other formats - try to parse then convert to UTC midnight
            const tempDate = new Date(tanggalLahir);
            if (!isNaN(tempDate.getTime())) {
              const y = tempDate.getFullYear();
              const m = tempDate.getMonth();
              const d = tempDate.getDate();
              tanggalLahirDate = new Date(Date.UTC(y, m, d));
            }
          }
        } catch (e) {
          console.error('Error parsing tanggalLahir:', e);
        }

        if (!tanggalLahirDate) {
          results.failed.push({
            data,
            error: `Tanggal lahir tidak valid: ${tanggalLahir}`
          });
          continue;
        }

        // Create siswa
        const siswa = await prisma.siswa.create({
          data: {
            nisn,
            nis,
            jenisKelamin: normGkSiswa,
            tanggalLahir: tanggalLahirDate,
            alamat: alamat || '',
            kelasAngkatan: kelasAngkatan ? String(kelasAngkatan) : null,
            tahunAjaranMasuk: { connect: { id: ta.id } },
            status: 'approved',
            statusSiswa: 'AKTIF',
            user: {
              create: {
                email: emailSiswa,
                password: hashedPasswordSiswa,
                name,
                role: 'SISWA'
              }
            },
            kelas: {
              connect: { id: kelas.id }
            }
          },
          include: {
            user: { select: { name: true, email: true } },
            kelas: { select: { nama: true } }
          }
        });

        // Create relation
        if (orangTuaId) {
          await prisma.orangTuaSiswa.create({
            data: {
              orangTuaId,
              siswaId: siswa.id,
              hubungan: jenisWali
            }
          });
        }

        console.log(`✅ [IMPORT SUCCESS] ${name} (NIS: ${nis}) created with ID: ${siswa.id}`);
        results.success.push(siswa);
      } catch (error) {
        console.error(`❌ [IMPORT CATCH ERROR] ${data['Nama Siswa']}: ${error.message}`);
        results.failed.push({
          data,
          error: error.message || 'Gagal mengimport data'
        });
      }
    }

    console.log(`📊 [IMPORT FINAL] Success: ${results.success.length} | Failed: ${results.failed.length}`);
    
    // Return results
    return NextResponse.json({
      success: results.success.length,
      failed: results.failed.length,
      errors: results.failed.map(f => `${f.data?.['Nama Siswa'] || 'Unknown'}: ${f.error}`),
      details: results
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'IMPORT',
      module: 'SISWA',
      description: `Import data siswa - Berhasil: ${results.success.length}, Gagal: ${results.failed.length}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        totalData: siswaData.length,
        successCount: results.success.length,
        failedCount: results.failed.length
      }
    });

    // Invalidate cache if any siswa was successfully imported
    if (results.success.length > 0) {
      invalidateCache('siswa-list');
    }

    return NextResponse.json({
      success: results.success.length,
      failed: results.failed.length,
      errors: results.failed.map(f => `${f.data?.['Nama Siswa'] || 'Unknown'}: ${f.error}`),
      details: results
    });
  } catch (error) {
    console.error('❌ [IMPORT FATAL ERROR]:', error);
    return NextResponse.json(
      { 
        error: 'Gagal mengimport data siswa',
        message: error.message,
        success: 0,
        failed: 0,
        errors: [error.message]
      },
      { status: 500 }
    );
  }
}

