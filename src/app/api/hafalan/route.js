import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
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
function generateCacheKey(session, siswaId, guruId) {
  const role = session.user.role;
  const userId = role === 'SISWA' ? session.user.siswaId : 
                 role === 'GURU' ? session.user.guruId : 'admin';
  return `hafalan-${role}-${userId}-${siswaId || 'all'}-${guruId || 'all'}`;
}

// GET - List hafalan
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const guruId = searchParams.get('guruId');

    // Generate cache key
    const cacheKey = generateCacheKey(session, siswaId, guruId);
    
    // Check if we have cached data
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log(`Returning cached hafalan data for key: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    console.log(`Fetching fresh hafalan data for key: ${cacheKey}`);

    let whereClause = {};

    // Filter based on role
    if (session.user.role === 'SISWA' && session.user.siswaId) {
      whereClause.siswaId = session.user.siswaId;
    } else if (session.user.role === 'GURU' && session.user.guruId) {
      // Guru hanya bisa lihat hafalan yang mereka nilai sendiri
      whereClause.guruId = session.user.guruId;

      // Jika ada parameter siswaId, tambahkan filter siswa juga
      if (siswaId) {
        whereClause.siswaId = siswaId;
      }
    } else if (session.user.role === 'ADMIN') {
      // Admin bisa lihat semua, bisa filter berdasarkan siswaId atau guruId
      if (siswaId) {
        whereClause.siswaId = siswaId;
      }
      if (guruId) {
        whereClause.guruId = guruId;
      }
    }

    const hafalan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true },
            },
            kelas: {
              select: { nama: true },
            },
          },
        },
        guru: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        // Removed surah relation since it's a string field, not a relation
      },
      orderBy: {
        tanggalSetor: 'desc',
      },
    });

    // Cache the response
    setCachedData(cacheKey, hafalan);

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan' },
      { status: 500 }
    );
  }
}

// POST - Create new hafalan
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      siswaId,
      surahId,
      ayatMulai,
      ayatSelesai,
      juz,
      halaman,
      status,
      nilaiTartil,
      nilaiTajwid,
      nilaiMakhraj,
      nilaiKelancaran,
      catatan,
    } = body;

    // Validate required fields
    if (!siswaId || !surahId || !ayatMulai || !ayatSelesai || !juz) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate nilai akhir (average of all nilai)
    const nilaiAkhir = (
      (nilaiTartil || 0) +
      (nilaiTajwid || 0) +
      (nilaiMakhraj || 0) +
      (nilaiKelancaran || 0)
    ) / 4;

    // Determine predikat
    let predikat = 'D';
    if (nilaiAkhir >= 90) predikat = 'A';
    else if (nilaiAkhir >= 80) predikat = 'B';
    else if (nilaiAkhir >= 70) predikat = 'C';

    const hafalan = await prisma.hafalan.create({
      data: {
        siswaId,
        guruId: session.user.guruId,
        surahId,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        juz: parseInt(juz),
        halaman: halaman ? parseInt(halaman) : null,
        status: status || 'LANCAR',
        nilaiTartil: nilaiTartil ? parseInt(nilaiTartil) : null,
        nilaiTajwid: nilaiTajwid ? parseInt(nilaiTajwid) : null,
        nilaiMakhraj: nilaiMakhraj ? parseInt(nilaiMakhraj) : null,
        nilaiKelancaran: nilaiKelancaran ? parseInt(nilaiKelancaran) : null,
        nilaiAkhir,
        predikat,
        catatan,
      },
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        // Removed surah relation since it's a string field, not a relation
      },
    });

    console.log('🔵 Hafalan created successfully, now logging activity...');

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'HAFALAN',
      description: `Menambahkan hafalan ${hafalan.surahId} ayat ${ayatMulai}-${ayatSelesai} untuk siswa ${hafalan.siswa.user.name}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        hafalanId: hafalan.id,
        siswaId: hafalan.siswaId,
        surahId: hafalan.surahId,
        juz: hafalan.juz
      }
    });

    console.log('🔵 Activity logging completed, returning response...');

    // Invalidate cache for this user/siswa
    const invalidateKeys = [
      `hafalan-SISWA-${siswaId}-all-all`,
      `hafalan-GURU-${session.user.guruId}-all-all`,
      `hafalan-GURU-${session.user.guruId}-${siswaId}-all`,
      `hafalan-ADMIN-all-all-all`
    ];
    
    invalidateKeys.forEach(key => {
      cache.delete(key);
      console.log(`Invalidated cache key: ${key}`);
    });

    return NextResponse.json(hafalan, { status: 201 });
  } catch (error) {
    console.error('Error creating hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to create hafalan' },
      { status: 500 }
    );
  }
}