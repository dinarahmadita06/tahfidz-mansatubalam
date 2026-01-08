import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';
import { generateSiswaEmail } from '@/lib/siswaUtils';

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const kelasId = searchParams.get('kelasId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Use cache key that includes kelasId to avoid mixing data between classes
    const cacheKey = kelasId ? `siswa-list-kelasId-${kelasId}` : 'siswa-list-all';
    console.log('🔑 Cache key:', cacheKey, 'kelasId:', kelasId);

    // Check if we have cached data
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log('✅ Returning cached siswa data for kelas:', kelasId, 'count:', cachedData.data?.length || 0);
      return NextResponse.json(cachedData);
    }

    console.log('🔄 Fetching fresh siswa data from database for kelas:', kelasId);

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

    // Get total count for pagination
    const totalCount = await prisma.siswa.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / limit);

    const siswa = await prisma.siswa.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
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
        hafalan: {
          select: {
            id: true,
            juz: true,
            surah: true
          }
        },
        orangTuaSiswa: {
          include: {
            orangTua: {
              include: {
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

    console.log('📊 Siswa fetched from database:', siswa.length, 'total:', totalCount);
    console.log('🔍 Sample siswa:', siswa.slice(0, 2).map(s => ({ id: s.id, nis: s.nis, nama: s.user.name, status: s.status })));

    const responseData = {
      data: siswa,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };

    // Cache the response
    setCachedData(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    console.error('Error details:', error.message, error.stack);
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
// Optimized for fast response time
// WITH TRANSACTION: Siswa + Orang Tua creation is atomic
export async function POST(request) {
  const startTime = Date.now();

  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parseStart = Date.now();
    const body = await request.json();
    const {
      name,
      password,
      nisn,
      nis,
      kelasId,
      jenisKelamin,
      tanggalLahir,
      alamat,
      noTelepon,
      // Parent data (optional - for atomic creation)
      parentData
    } = body;
    console.log(`⏱️ Parse body: ${Date.now() - parseStart}ms`);

    // Validate required fields
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!password || password.trim() === '') missingFields.push('password');
    if (!nis || nis.trim() === '') missingFields.push('nis');
    if (!kelasId || kelasId.trim() === '') missingFields.push('kelasId');
    if (!jenisKelamin || jenisKelamin.trim() === '') missingFields.push('jenisKelamin');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Data tidak lengkap',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate field formats
    const invalidFields = {};

    // Validate NIS format (should be numeric)
    if (nis && isNaN(nis)) {
      invalidFields.nis = 'NIS harus berupa angka';
    }

    // Validate NISN format if provided (should be numeric)
    if (nisn && nisn.trim() !== '' && isNaN(nisn)) {
      invalidFields.nisn = 'NISN harus berupa angka';
    }

    if (Object.keys(invalidFields).length > 0) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          invalidFields,
        },
        { status: 422 }
      );
    }

    // Auto-generate email based on name and NIS
    const email = generateSiswaEmail(name, nis);

    // OPTIMIZED: Check all duplicates in parallel (single query instead of 3)
    const validationStart = Date.now();
    const [existingUser, existingSiswaByNisn, existingSiswaByNis] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      nisn ? prisma.siswa.findUnique({ where: { nisn }, select: { id: true } }) : null,
      prisma.siswa.findUnique({ where: { nis }, select: { id: true } })
    ]);
    console.log(`⏱️ Validation queries: ${Date.now() - validationStart}ms`);

    // Check for duplicate fields
    if (existingUser) {
      invalidFields.email = 'Email sudah terdaftar';
    }

    if (existingSiswaByNisn) {
      invalidFields.nisn = 'NISN sudah terdaftar';
    }

    if (existingSiswaByNis) {
      invalidFields.nis = 'NIS sudah terdaftar';
    }

    if (Object.keys(invalidFields).length > 0) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          invalidFields,
        },
        { status: 422 }
      );
    }

    // OPTIMIZED: Hash password dengan saltRounds explicit (10 untuk balance security vs speed)
    const hashStart = Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`⏱️ Password hashing: ${Date.now() - hashStart}ms`);

    // ============ ATOMIC TRANSACTION: Siswa + Orang Tua ============
    console.log('🔄 Starting transaction for siswa + parent creation...');
    console.log('📋 Parent data provided:', !!parentData, parentData ? { name: parentData.name, email: parentData.email } : null);
    const createStart = Date.now();

    const siswa = await prisma.$transaction(async (tx) => {
      // Step 1: Create siswa with user
      console.log('📝 Step 1: Creating siswa...');
      const newSiswa = await tx.siswa.create({
        data: {
          nisn,
          nis,
          jenisKelamin,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          alamat,
          noTelepon,
          status: 'approved', // Admin-created students are auto-approved
          kelas: {
            connect: {
              id: kelasId
            }
          },
          user: {
            create: {
              email,
              password: hashedPassword,
              name,
              role: 'SISWA'
            }
          }
        },
        select: {
          id: true,
          nisn: true,
          nis: true,
          kelasId: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      console.log('✅ Siswa created:', newSiswa.id);

      // Step 2: Create parent if parentData is provided
      if (parentData && parentData.name && parentData.noHP && parentData.email && parentData.password) {
        console.log('📝 Step 2: Creating orang tua...');

        // Validate parent data
        if (parentData.password.length < 8) {
          throw new Error('Password orang tua minimal 8 karakter');
        }

        // Hash parent password
        const parentHashedPassword = await bcrypt.hash(parentData.password, 10);

        // Check if parent email exists
        const existingParentEmail = await tx.user.findUnique({
          where: { email: parentData.email.toLowerCase() }
        });

        if (existingParentEmail) {
          throw new Error('Email orang tua sudah terdaftar');
        }

        // Create parent user and orangTua
        const parentUser = await tx.user.create({
          data: {
            email: parentData.email.toLowerCase(),
            password: parentHashedPassword,
            name: parentData.name,
            role: 'ORANG_TUA'  // ← FIX: Changed from 'ORANGTUA' to 'ORANG_TUA'
          }
        });

        const orangTua = await tx.orangTua.create({
          data: {
            noTelepon: parentData.noHP.replace(/[^0-9]/g, ''),
            userId: parentUser.id,
            jenisKelamin: 'LAKI_LAKI' // Default value
          }
        });

        console.log('✅ Orang tua created:', orangTua.id);

        // Step 3: Link siswa to orang tua
        console.log('📝 Step 3: Linking siswa to orang tua...');
        await tx.orangTuaSiswa.create({
          data: {
            siswaId: newSiswa.id,
            orangTuaId: orangTua.id,
            hubungan: 'Orang Tua'
          }
        });
        console.log('✅ Siswa linked to orang tua');
      }

      return newSiswa;
    });

    console.log(`⏱️ Database transaction: ${Date.now() - createStart}ms`);

    // ✅ Log activity - Create Siswa
    try {
      await logActivity({
        actorId: session.user.id,
        actorRole: 'ADMIN',
        actorName: session.user.name,
        action: ACTIVITY_ACTIONS.ADMIN_TAMBAH_SISWA,
        title: 'Menambahkan siswa baru',
        description: `Siswa: ${siswa.user.name} (NIS: ${siswa.nis}) di kelas ${siswa.kelasId}${parentData ? ' + orang tua' : ''}`,
        targetUserId: siswa.userId,
        targetRole: 'SISWA',
        targetName: siswa.user.name,
        metadata: {
          siswaId: siswa.id,
          nis: siswa.nis,
          kelasId: siswa.kelasId,
          withParent: !!parentData
        }
      });
      console.log('✅ Activity logged for ADMIN_TAMBAH_SISWA');
    } catch (logErr) {
      console.error('❌ Log activity error:', logErr.message);
    }

    // Invalidate cache for this kelas (and generic cache)
    if (siswa.kelasId) {
      invalidateCache(`siswa-list-kelasId-${siswa.kelasId}`);
      console.log('🗑️ Cache invalidated for kelas:', siswa.kelasId);
    }
    invalidateCache('siswa-list-all');  // Also invalidate generic cache

    const totalTime = Date.now() - startTime;
    console.log(`✅ Total request time: ${totalTime}ms`);

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Error creating siswa (${totalTime}ms):`, error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    console.error('Full error:', JSON.stringify(error, null, 2));

    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Format JSON tidak valid' },
        { status: 400 }
      );
    }

    // Handle transaction errors (from custom validation)
    if (error.message && error.message.includes('Password orang tua')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message && error.message.includes('sudah terdaftar')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    // Provide detailed error for debugging
    const errorMessage = error.meta?.cause || error.message || 'Unknown error';
    const statusCode = error.code === 'P2002' ? 400 : 500;
    
    return NextResponse.json(
      {
        error: 'Gagal menambahkan siswa',
        details: errorMessage,
        code: error.code || 'UNKNOWN',
        ...(process.env.NODE_ENV === 'development' && { fullError: error })
      },
      { status: statusCode }
    );
  }
}