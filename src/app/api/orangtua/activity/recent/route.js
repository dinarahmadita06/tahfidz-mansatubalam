export const dynamic = 'force-dynamic';
export const revalidate = 0;
/**
 * API Route: GET /api/orangtua/activity/recent
 * Fetch recent activities for parent portal
 * Returns only ORANG_TUA role activities for the logged-in parent
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get limit from query (default: 5)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20);

    // Calculate 24 hours ago for backend filtering
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch recent activities for this parent from last 24 hours
    const rawActivities = await prisma.activityLog.findMany({
      where: {
        actorId: session.user.id,
        actorRole: 'ORANG_TUA',
        createdAt: {
          gte: twentyFourHoursAgo // Only fetch activities from last 24 hours
        }
      },
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        actorName: true,
        metadata: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Fetch more to allow filtering
    });

    // Filtering: Prioritize non-login/logout activities
    // Limit LOGIN/LOGOUT to max 1 item total
    const filteredActivities = [];
    let authCount = 0;

    for (const activity of rawActivities) {
      const isAuth = activity.action?.includes('LOGIN') || activity.action?.includes('LOGOUT');
      
      if (isAuth) {
        if (authCount < 1) {
          filteredActivities.push(activity);
          authCount++;
        }
      } else {
        filteredActivities.push(activity);
      }
      
      if (filteredActivities.length >= limit) break;
    }

    return NextResponse.json(
      {
        activities: filteredActivities || []
      },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching parent activities:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
