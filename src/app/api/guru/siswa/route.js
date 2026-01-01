import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/guru/siswa
 * 
 * Fetch siswa hanya dari kelas AKTIF yang diampu guru
 * 
 * Query params:
 *   - kelasIds: comma-separated kelas IDs (optional - untuk filtering lebih lanjut)
 *   - search: search by name, nis, email (optional)
 *   - status: filter by siswa status (optional)
 *   - page: pagination (default: 1)
 *   - limit: items per page (default: 100)
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasIds = searchParams.get('kelasIds');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Step 1: Get guru's assigned classes that are AKTIF
    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guruId: session.user.id,
        isActive: true,
        kelas: {
          status: 'AKTIF'  // Only AKTIF classes
        }
      },
      select: {
        kelasId: true
      }
    });

    const aktivKelasIds = guruKelas.map(gk => gk.kelasId);

    // If guru has no active classes, return empty
    if (aktivKelasIds.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0
        }
      });
    }

    // Step 2: If kelasIds param is provided, further filter from those available to guru
    let targetKelasIds = aktivKelasIds;
    if (kelasIds) {
      const requestedIds = kelasIds.split(',').filter(Boolean);
      targetKelasIds = aktivKelasIds.filter(id => requestedIds.includes(id));
    }

    // Step 3: Build where clause for siswa
    let whereClause = {
      kelasId: {
        in: targetKelasIds
      }
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nis: { contains: search } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Step 4: Get siswa count and list
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
            status: true
          }
        },
        hafalanSiswa: {
          select: {
            id: true,
            juz: true,
            status: true
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching guru siswa:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch siswa',
        details: error.message
      },
      { status: 500 }
    );
  }
}
