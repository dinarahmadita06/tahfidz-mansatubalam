import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';
import { generateSiswaEmail, generateOrangTuaEmail } from '@/lib/siswaUtils';

// Force Node.js runtime untuk Prisma compatibility
export const runtime = 'nodejs';
// Prevent static optimization
export const dynamic = 'force-dynamic';

// GET - List all siswa (Admin only)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.time('GET /api/admin/siswa');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const kelasId = searchParams.get('kelasId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build cache key
    const cacheKey = kelasId 
      ? `siswa-list-kelasId-${kelasId}-page-${page}`
      : search
        ? `siswa-list-search-${search}-page-${page}`
        : `siswa-list-all-page-${page}`;
    
    // Check cache
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.timeEnd('GET /api/admin/siswa');
      return NextResponse.json(cachedData);
    }

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (kelasId) {
      whereClause.kelasId = kelasId;
    }

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nis: { contains: search } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Parallel: count + findMany
    console.time('siswa-count-query');
    const totalCount = await prisma.siswa.count({ where: whereClause });
    console.timeEnd('siswa-count-query');
    const totalPages = Math.ceil(totalCount / limit);

    console.time('siswa-findMany-query');
    const siswa = await prisma.siswa.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nisn: true,
        nis: true,
        jenisKelamin: true,
        tanggalLahir: true,
        alamat: true,
        noTelepon: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true
          }
        },
        kelas: {
          select: {
            id: true,
            nama: true,
          }
        },
        orangTuaSiswa: {
          select: {
            orangTua: {
              select: {
                id: true,
                noTelepon: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            hafalan: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.timeEnd('siswa-findMany-query');

    const responseData = {
      data: siswa,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };

    // Cache response
    setCachedData(cacheKey, responseData);

    console.timeEnd('GET /api/admin/siswa');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch siswa',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Create new siswa (Admin only)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      password,
      nisn,
      nis,
      kelasId,
      tahunAjaranMasukId,
      kelasAngkatan,
      jenisKelamin,
      tanggalLahir,
      alamat,
      noTelepon,
      parentData
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!nis || nis.trim() === '') missingFields.push('nis');
    if (!kelasId || kelasId.trim() === '') missingFields.push('kelasId');
    if (!jenisKelamin || jenisKelamin.trim() === '') missingFields.push('jenisKelamin');

    if (missingFields.length > 0) {
      return NextResponse.json({ error: 'Data tidak lengkap', missingFields }, { status: 400 });
    }

    // Auto-generate email based on name and NIS
    const email = generateSiswaEmail(name, nis);

    // Hash password
    let studentPassword = password;
    if (!studentPassword || studentPassword.trim() === '') {
      studentPassword = nisn && nisn.trim().length === 10 ? nisn.trim() : nis;
    }
    const hashedPassword = await bcrypt.hash(studentPassword, 10);

    // ============ ATOMIC TRANSACTION ============
    const siswa = await prisma.$transaction(async (tx) => {
      // 1. Create siswa
      const newSiswa = await tx.siswa.create({
        data: {
          nisn,
          nis,
          jenisKelamin,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          alamat,
          noTelepon,
          tahunAjaranMasuk: tahunAjaranMasukId ? { connect: { id: tahunAjaranMasukId } } : undefined,
          kelas: kelasId ? { connect: { id: kelasId } } : undefined,
          kelasAngkatan: kelasAngkatan || null,
          status: 'approved',
          user: {
            create: {
              email,
              password: hashedPassword,
              name,
              role: 'SISWA'
            }
          }
        },
        include: { user: true }
      });

      // 2. Handle Parent Data
      if (parentData && parentData.name && parentData.noHP) {
        // Auto-generate email based on student if not provided
        const finalEmailWali = parentData.email && parentData.email.trim() !== '' 
          ? parentData.email.toLowerCase() 
          : generateOrangTuaEmail(name, nis);

        // Password parent: NISN-YYYY
        let pPassword = parentData.password;
        if (!pPassword || pPassword.trim() === '') {
          const bYear = tanggalLahir ? new Date(tanggalLahir).getFullYear() : null;
          pPassword = bYear ? `${nisn || nis}-${bYear}` : (nisn || nis);
        }
        const parentHashedPassword = await bcrypt.hash(pPassword, 10);

        // Check duplicate
        const existingParent = await tx.user.findUnique({ where: { email: finalEmailWali } });
        if (existingParent && existingParent.name.toLowerCase() !== parentData.name.toLowerCase()) {
           throw new Error(`Email ${finalEmailWali} sudah digunakan oleh wali lain (${existingParent.name})`);
        }

        let orangTuaId;
        if (existingParent) {
          const ot = await tx.orangTua.findUnique({ where: { userId: existingParent.id } });
          orangTuaId = ot?.id;
        }

        if (!orangTuaId) {
          const parentUser = await tx.user.create({
            data: {
              email: finalEmailWali,
              password: parentHashedPassword,
              name: parentData.name,
              role: 'ORANG_TUA'
            }
          });

          const orangTua = await tx.orangTua.create({
            data: {
              noTelepon: parentData.noHP.replace(/[^0-9]/g, ''),
              userId: parentUser.id,
              jenisKelamin: parentData.jenisKelamin || 'LAKI_LAKI'
            }
          });
          orangTuaId = orangTua.id;
        }

        // Link
        await tx.orangTuaSiswa.create({
          data: {
            siswaId: newSiswa.id,
            orangTuaId: orangTuaId,
            hubungan: 'Orang Tua'
          }
        });
      }

      return newSiswa;
    });

    // Log activity
    await logActivity({
      actorId: session.user.id,
      actorRole: 'ADMIN',
      action: ACTIVITY_ACTIONS.ADMIN_TAMBAH_SISWA,
      title: 'Menambahkan siswa baru',
      description: `Siswa: ${siswa.user.name} (NIS: ${siswa.nis})`,
      targetUserId: siswa.userId,
      targetRole: 'SISWA',
      targetName: siswa.user.name
    });

    invalidateCache(`siswa-list-kelasId-${kelasId}`);
    invalidateCache('siswa-list-all');

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error('Error creating siswa:', error);
    return NextResponse.json({ error: error.message || 'Gagal menambahkan siswa' }, { status: 500 });
  }
}
