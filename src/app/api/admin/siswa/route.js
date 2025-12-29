import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
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

    // Use simple cache key
    const cacheKey = 'siswa-list';

    // Check if we have cached data
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      console.log('Returning cached siswa data');
      return NextResponse.json(cachedData);
    }

    console.log('Fetching fresh siswa data from database');

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
            email: true
          }
        },
        kelas: {
          select: {
            id: true,
            nama: true,
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
    return NextResponse.json(
      { error: 'Failed to fetch siswa' },
      { status: 500 }
    );
  }
}

// POST - Create new siswa (Admin only)
// Optimized for fast response time
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
      noTelepon
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
      invalidFields.name = 'Email sudah terdaftar (NIS atau Nama mungkin duplikat)';
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

    // OPTIMIZED: Create user dan siswa dengan minimal select untuk response cepat
    const createStart = Date.now();
    const siswa = await prisma.siswa.create({
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
      // OPTIMIZED: Minimal select untuk response cepat
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
    console.log(`⏱️ Database insert: ${Date.now() - createStart}ms`);

    // Log activity (non-blocking - don't await)
    logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'SISWA',
      description: `Menambahkan siswa baru ${siswa.user.name} (NIS: ${siswa.nis})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId: siswa.id,
        kelasId: siswa.kelasId
      }
    }).catch(err => console.error('Log activity error:', err));

    // Invalidate cache (non-blocking)
    invalidateCache('siswa-list');

    const totalTime = Date.now() - startTime;
    console.log(`✅ Total request time: ${totalTime}ms`);

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Error creating siswa (${totalTime}ms):`, error);

    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Format JSON tidak valid' },
        { status: 400 }
      );
    }

    // Provide detailed error for debugging
    const errorMessage = error.meta?.cause || error.message || 'Unknown error';
    const statusCode = error.code === 'P2002' ? 400 : 500;
    
    return NextResponse.json(
      {
        error: statusCode === 400 ? 'Data duplikat atau tidak valid' : 'Gagal menambahkan siswa',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: statusCode }
    );
  }
}