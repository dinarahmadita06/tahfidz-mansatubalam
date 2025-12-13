import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear siswa cache
    invalidateCache('siswa-list');

    console.log('✅ Siswa cache cleared by admin:', session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully. Please refresh the page.'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
