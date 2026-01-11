export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API TAHUN AJARAN] REQUEST START ---');
  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API TAHUN AJARAN] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noCache = searchParams.get('noCache') === 'true';

    // Caching
    const cacheKey = 'tahun-ajaran-list';
    if (!noCache) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        const endTotal = performance.now();
        console.log(`[API TAHUN AJARAN] total (CACHED): ${(endTotal - startTotal).toFixed(2)} ms`);
        return NextResponse.json({ data: cached }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        });
      }
    }

    const startQueries = performance.now();
    const tahunAjaran = await prisma.tahunAjaran.findMany({
      select: {
        id: true,
        nama: true,
        semester: true,
        isActive: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        targetHafalan: true
      },
      orderBy: [
        { isActive: 'desc' },
        { tanggalMulai: 'desc' }
      ]
    });
    const endQueries = performance.now();
    console.log(`[API TAHUN AJARAN] prisma.findMany: ${(endQueries - startQueries).toFixed(2)} ms`);

    setCachedData(cacheKey, tahunAjaran, 60);

    const endTotal = performance.now();
    console.log(`[API TAHUN AJARAN] total: ${(endTotal - startTotal).toFixed(2)} ms`);
    console.log('--- [API TAHUN AJARAN] REQUEST END ---');

    return NextResponse.json({ data: tahunAjaran }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tahun ajaran' },
      { status: 500 }
    );
  }
}
