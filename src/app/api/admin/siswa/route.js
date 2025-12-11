import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 180000; // 3 minutes in milliseconds

// Function to get cached data
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Function to set cached data
function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Function to generate cache key based on parameters
function generateCacheKey(params) {
  const { status, kelasId, search, page, limit } = params;
  return `siswa-list-${status || 'all'}-${kelasId || 'all'}-${search || 'all'}-${page}-${limit}`;
}

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

    // Generate cache key
    const cacheKey = generateCacheKey({ status, kelasId, search, page, limit });
    
    // Check if we have cached data
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log(`Returning cached siswa data for key: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    console.log(`Fetching fresh siswa data for key: ${cacheKey}`);

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
        { nisn: { contains: search } },
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
            isActive: true
          }
        },
        kelas: {
          select: {
            id: true,
            nama: true,
          }
        },
        orangTua: {
          include: {
            user: {
              select: {
                name: true,
                email: true
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
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      nisn,
      nis,
      kelasId,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      alamat,
      noHP,
      orangTuaId
    } = body;

    // Validate required fields
    if (!name || !email || !password || !nisn || !nis || !kelasId || !jenisKelamin || !tempatLahir || !tanggalLahir) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Check if email, nisn, or nis already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const existingNisn = await prisma.siswa.findUnique({ where: { nisn } });
    if (existingNisn) {
      return NextResponse.json({ error: 'NISN sudah terdaftar' }, { status: 400 });
    }

    const existingNis = await prisma.siswa.findUnique({ where: { nis } });
    if (existingNis) {
      return NextResponse.json({ error: 'NIS sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and siswa
    const siswa = await prisma.siswa.create({
      data: {
        nisn,
        nis,
        jenisKelamin,
        tempatLahir,
        tanggalLahir: new Date(tanggalLahir),
        alamat,
        noHP,
        orangTuaId: orangTuaId || null,
        status: 'approved', // Admin-created students are auto-approved
        approvedBy: session.user.id,
        approvedAt: new Date(),
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
            role: 'SISWA',
            isActive: true
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        },
        kelas: {
          select: {
            nama: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'SISWA',
      description: `Menambahkan siswa baru ${siswa.user.name} (NISN: ${siswa.nisn})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId: siswa.id,
        kelasId: siswa.kelasId
      }
    });

    // Invalidate cache for siswa list
    // Clear all siswa cache entries
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.startsWith('siswa-list-')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => {
      cache.delete(key);
      console.log(`Invalidated cache key: ${key}`);
    });

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error('Error creating siswa:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan siswa' },
      { status: 500 }
    );
  }
}