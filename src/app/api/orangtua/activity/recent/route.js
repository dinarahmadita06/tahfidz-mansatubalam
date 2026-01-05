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

    // Fetch recent activities for this parent
    const activities = await prisma.activityLog.findMany({
      where: {
        actorId: session.user.id,
        actorRole: 'ORANG_TUA'
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
      take: 7
    });

    return NextResponse.json(
      {
        activities: activities || []
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
