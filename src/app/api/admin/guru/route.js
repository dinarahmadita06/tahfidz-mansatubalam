import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData } from '@/lib/cache';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List all guru with statistics (Admin only)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.time('GET /api/admin/guru');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build cache key
    const cacheKey = search ? `guru-list-search-${search}` : 'guru-list-all';

    // Check cache
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.timeEnd('GET /api/admin/guru');
      return NextResponse.json(cachedData);
    }

    // Build where clause
    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { nip: { contains: search } }
        ]
      };
    }

    // Parallel queries: count + findMany
    console.time('guru-count-query');
    const totalCount = await prisma.guru.count({ where: whereClause });
    console.timeEnd('guru-count-query');

    console.time('guru-findMany-query');
    const guru = await prisma.guru.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nip: true,
        tanggalLahir: true,
        jenisKelamin: true,
        jabatan: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        },
        _count: {
          select: {
            guruKelas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.timeEnd('guru-findMany-query');

    const totalPages = Math.ceil(totalCount / limit);

    const responseData = {
      data: guru,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };

    // Cache response
    setCachedData(cacheKey, responseData);

    console.timeEnd('GET /api/admin/guru');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching guru:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch guru',
        details: error.message
      },
      { status: 500 }
    );
  }
}
