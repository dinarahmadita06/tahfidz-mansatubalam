import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { clearAllCache, invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear specific caches
    invalidateCache('guru-list');
    invalidateCache('kelas-list');

    // Alternatively, clear all cache
    // clearAllCache();

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      clearedKeys: ['guru-list', 'kelas-list']
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache', details: error.message },
      { status: 500 }
    );
  }
}
