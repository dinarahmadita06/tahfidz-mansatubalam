import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';

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
        let {
          name,
          nisn,
          nis,
          kelasId,
          jenisKelamin,
          tempatLahir,
          tanggalLahir,
          namaOrtu,
          emailOrtu,
          noHPOrtu
        } = data;

        // Convert NISN and NIS to string (in case Excel reads as number)
        nisn = String(nisn || '').trim();
        nis = String(nis || '').trim();
        let kelasInput = String(kelasId || '').trim();
        noHPOrtu = noHPOrtu ? String(noHPOrtu).trim() : null;

        // Validate required fields - NISN and NIS are both required now
        if (!name || !nisn || !nis || !kelasInput || !jenisKelamin || !tanggalLahir) {
          results.failed.push({
            data,
            error: 'Data siswa tidak lengkap (NISN, NIS, Nama, Jenis Kelamin, Tanggal Lahir wajib diisi)'
          });
          continue;
        }

        // Check if nisn or nis already exists
        const existingNisn = await prisma.siswa.findUnique({ where: { nisn } });
        if (existingNisn) {
          results.failed.push({
            data,
            error: `NISN ${nisn} sudah terdaftar`
          });
          continue;
        }

        const existingNis = await prisma.siswa.findUnique({ where: { nis } });
        if (existingNis) {
          results.failed.push({
            data,
            error: `NIS ${nis} sudah terdaftar`
          });
          continue;
        }

        // Check if kelas exists - try to find by ID first, then by name
        let kelas = await prisma.kelas.findUnique({ where: { id: kelasInput } });

        // If not found by ID, try to find by name
        if (!kelas) {
          kelas = await prisma.kelas.findFirst({
            where: {
              nama: {
                equals: kelasInput,
                mode: 'insensitive'
              }
            }
          });
        }

        if (!kelas) {
          results.failed.push({
            data,
            error: `Kelas "${kelasInput}" tidak ditemukan`
          });
          continue;
        }

        // Use the found kelas ID
        kelasId = kelas.id;

        // Handle orang tua - check if exists or create new
        let orangTuaId = null;

        if (emailOrtu && namaOrtu) {
          // Try to find existing orang tua by email
          let orangTua = await prisma.orangTua.findFirst({
            where: {
              user: {
                email: emailOrtu
              }
            }
          });

          // If not found, create new orang tua
          if (!orangTua) {
            // Check if email is already used by other role
            const existingUser = await prisma.user.findUnique({ where: { email: emailOrtu } });

            if (!existingUser) {
              // Create new orang tua
              const hashedPasswordOrtu = await bcrypt.hash('password123', 10); // Default password

              orangTua = await prisma.orangTua.create({
                data: {
                  noTelepon: noHPOrtu || null,
                  nik: `NIK${Date.now()}${Math.random().toString(36).substr(2, 9)}`, // Generate unique NIK
                  jenisKelamin: 'LAKI_LAKI', // Default, bisa diubah nanti
                  status: 'approved', // Auto-approve
                  user: {
                    create: {
                      email: emailOrtu,
                      password: hashedPasswordOrtu,
                      name: namaOrtu,
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

        // Generate email for siswa based on NIS
        const emailSiswa = `${nis}@siswa.tahfidz.com`;

        // Check if email already exists
        const existingUserEmail = await prisma.user.findUnique({ where: { email: emailSiswa } });
        if (existingUserEmail) {
          results.failed.push({
            data,
            error: `Email ${emailSiswa} sudah terdaftar`
          });
          continue;
        }

        // Default password is NIS
        const hashedPassword = await bcrypt.hash(nis, 10);

        // Create siswa
        const siswa = await prisma.siswa.create({
          data: {
            nisn,
            nis,
            jenisKelamin,
            tanggalLahir: new Date(tanggalLahir),
            status: 'approved', // Auto-approve admin imports
            user: {
              create: {
                email: emailSiswa,
                password: hashedPassword,
                name,
                role: 'SISWA'
              }
            },
            kelas: {
              connect: {
                id: kelasId
              }
            }
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            kelas: {
              select: {
                nama: true
              }
            }
          }
        });

        // Create OrangTuaSiswa relation if orangTua exists
        if (orangTuaId) {
          await prisma.orangTuaSiswa.create({
            data: {
              orangTuaId: orangTuaId,
              siswaId: siswa.id,
              hubungan: 'Orang Tua'
            }
          });
        }

        results.success.push(siswa);
      } catch (error) {
        console.error('Error importing siswa:', error);
        results.failed.push({
          data,
          error: error.message || 'Gagal mengimport data'
        });
      }
    }

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
      message: `Import selesai. Berhasil: ${results.success.length}, Gagal: ${results.failed.length}`,
      results
    });
  } catch (error) {
    console.error('Error importing siswa:', error);
    return NextResponse.json(
      { error: 'Gagal mengimport data siswa' },
      { status: 500 }
    );
  }
}
