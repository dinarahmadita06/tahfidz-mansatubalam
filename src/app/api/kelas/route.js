import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API KELAS] REQUEST START ---');
  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API KELAS] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true'; 
    const noCache = searchParams.get('noCache') === 'true';

    // Caching logic
    const cacheKey = `kelas-list-${session.user.role}-${session.user.guruId}-${showAll}`;
    if (!noCache) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        console.log('[API KELAS] Returning cached data');
        const endTotal = performance.now();
        console.log(`[API KELAS] total (CACHED): ${(endTotal - startTotal).toFixed(2)} ms`);
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        });
      }
    }

    let whereClause = {};

    // Filter based on role
    if (session.user.role === 'GURU' && session.user.guruId && !showAll) {
      whereClause.guruKelas = {
        some: {
          guruId: session.user.guruId,
          isActive: true
        }
      };
      console.log('[API /kelas] Filtering for GURU:', session.user.guruId);
    } else if (session.user.role === 'ADMIN') {
      console.log('[API /kelas] ADMIN role - showing ALL classes');
    }

    const startQueries = performance.now();
    const kelas = await prisma.kelas.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        status: true,
        targetJuz: true,
        tahunAjaranId: true,
        guruKelas: {
          where: {
            isActive: true
          },
          select: {
            peran: true,
            guru: {
              select: {
                id: true,
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
          orderBy: {
            tanggalMulai: 'asc'
          }
        },
        tahunAjaran: {
          select: {
            id: true,
            nama: true,
            isActive: true,
            targetHafalan: true,
          },
        },
        _count: {
          select: {
            siswa: true,
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });
    const endQueries = performance.now();
    console.log(`[API KELAS] prisma.findMany: ${(endQueries - startQueries).toFixed(2)} ms`);

    setCachedData(cacheKey, kelas, 60);

    const endTotal = performance.now();
    console.log(`[API KELAS] total: ${(endTotal - startTotal).toFixed(2)} ms`);
    console.log('--- [API KELAS] REQUEST END ---');

    return NextResponse.json(kelas, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('[API /kelas] ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kelas', details: error.message },
      { status: 500 }
    );
  }
}
