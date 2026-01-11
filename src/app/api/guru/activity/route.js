export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentActivities } from '@/lib/activityLogger';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    const activities = await getRecentActivities(session.user.id, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching guru activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
