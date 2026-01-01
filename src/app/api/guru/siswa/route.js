import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Step 1: Get guru record from user ID
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      console.log('[API /guru/siswa] Guru record not found for userId:', session.user.id);
      return NextResponse.json({
        data: [],
        pagination: { page, limit, totalCount: 0, totalPages: 0 }
      });
    }

    console.log('[API /guru/siswa] Found guru:', { guruId: guru.id, userId: session.user.id });

    // Step 2: Get guru's assigned classes that are AKTIF
    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guruId: guru.id,
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
    console.log('[API /guru/siswa] Guru aktif kelas:', aktivKelasIds);

    // If guru has no active classes, return empty
    if (aktivKelasIds.length === 0) {
      console.log('[API /guru/siswa] Guru has no active kelas');
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

    // Step 3: Parse kelasIds parameter properly
    // Handle both comma-separated and array formats
    let targetKelasIds = aktivKelasIds;
    
    if (kelasIdsParam) {
      let requestedIds = [];
      
      // Parse comma-separated string: "id1,id2,id3"
      if (typeof kelasIdsParam === 'string') {
        requestedIds = kelasIdsParam
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length > 0);
      } 
      // Handle array format (if passed as array)
      else if (Array.isArray(kelasIdsParam)) {
        requestedIds = kelasIdsParam
          .map(id => String(id).trim())
          .filter(id => id.length > 0);
      }
      
      console.log('[API /guru/siswa] Requested kelasIds:', requestedIds);
      
      // Filter to only allow kelas that guru actually teaches AND that are AKTIF
      targetKelasIds = aktivKelasIds.filter(id => requestedIds.includes(id));
      
      console.log('[API /guru/siswa] After filtering with kelasIds param:', targetKelasIds);
      
      // If requested IDs don't match guru's classes, return 400
      if (requestedIds.length > 0 && targetKelasIds.length === 0) {
        console.warn('[API /guru/siswa] Requested kelas IDs do not match guru active classes');
        return NextResponse.json({
          error: 'Kelas yang diminta tidak valid atau tidak diampu',
          data: [],
          pagination: { page, limit, totalCount: 0, totalPages: 0 }
        }, { status: 400 });
      }
    }

    // Step 4: Build where clause for siswa
    let whereClause = {
      kelasId: {
        in: targetKelasIds
      }
    };

    // Add search filter if provided
    if (search) {
      whereClause.AND = [
        {
          kelasId: {
            in: targetKelasIds
          }
        },
        {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { nis: { contains: search } },
            { user: { email: { contains: search, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    console.log('[API /guru/siswa] Query whereClause:', JSON.stringify(whereClause, null, 2));

    // Step 5: Get siswa count and list
    const totalCount = await prisma.siswa.count({ where: whereClause });
    console.log('[API /guru/siswa] Total count:', totalCount);

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

    console.log('[API /guru/siswa] Siswa returned:', siswa.length);
    
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
