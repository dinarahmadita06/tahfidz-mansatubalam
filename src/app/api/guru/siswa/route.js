export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/guru/siswa
 * 
 * Fetch siswa hanya dari kelas AKTIF yang diampu guru
 * 
 * Query params:
 *   - kelasIds: comma-separated kelas IDs (optional - untuk filtering lebih lanjut)
 *     Contoh: ?kelasIds=id1,id2,id3
 *   - search: search by name, nis, email (optional)
 *   - page: pagination (default: 1)
 *   - limit: items per page (default: 100)
 */
export async function GET(request) {
  console.time('[API /guru/siswa]');
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const kelasIdsParam = searchParams.get('kelasIds');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('[API /guru/siswa] Request params:', { 
      kelasIds: kelasIdsParam, 
      search, 
      page, 
      limit, 
      userId: session.user.id 
    });

    // Combined where clause to find students from guru's active classes
    const baseWhere = {
      kelas: {
        guruKelas: {
          some: {
            guru: { userId: session.user.id },
            isActive: true
          }
        }
      }
    };

    // If specific kelasIds are requested, add them to the filter
    if (kelasIdsParam) {
      const requestedIds = kelasIdsParam.split(',').map(id => id.trim()).filter(Boolean);
      if (requestedIds.length > 0) {
        baseWhere.kelasId = { in: requestedIds };
      }
    }

    // Add search filter if provided
    let whereClause = { ...baseWhere };
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nis: { contains: search } },
        { nisn: { contains: search } }
      ];
    }

    console.log('[API /guru/siswa] Query whereClause:', JSON.stringify(whereClause, null, 2));

    // Step 5: Get siswa count and list in parallel
    const [totalCount, siswa] = await Promise.all([
      prisma.siswa.count({ where: whereClause }),
      prisma.siswa.findMany({
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
          _count: {
            select: {
              hafalan: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    console.log('[API /guru/siswa] Total count:', totalCount, 'Siswa returned:', siswa.length);
    
    // Include hafalan count in response
    const transformedSiswa = siswa.map(s => ({
      ...s,
      hafalanCount: s._count.hafalan
    }));

    const responseData = {
      data: transformedSiswa,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };

    console.timeEnd('[API /guru/siswa]');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[API /guru/siswa] Error:', error.message);
    console.error('[API /guru/siswa] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Gagal fetch siswa',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
