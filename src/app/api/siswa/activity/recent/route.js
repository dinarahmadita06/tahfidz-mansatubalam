export const dynamic = 'force-dynamic';
export const revalidate = 0;
/**
 * API Route: GET /api/siswa/activity/recent
 * Fetch recent activities untuk siswa (untuk widget)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRelativeTime } from '@/lib/helpers/siswaActivityLogger';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get siswa ID from session
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    // Get limit from query (default: 5)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20); // Max 20 for dashboard

    // Calculate 24 hours ago for backend filtering
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch recent activities from last 24 hours
    const activities = await prisma.activityLog.findMany({
      where: {
        targetUserId: siswa.id,
        createdAt: {
          gte: twentyFourHoursAgo // Only fetch activities from last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        actorName: true,
        metadata: true,
        createdAt: true
      }
    });

    // Transform activities with relative time
    const transformedActivities = activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      title: activity.title,
      description: activity.description,
      actorName: activity.actorName,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      createdAt: activity.createdAt,
      relativeTime: getRelativeTime(activity.createdAt)
    }));

    return NextResponse.json({
      success: true,
      total: transformedActivities.length,
      activities: transformedActivities
    });

  } catch (error) {
    console.error('[/api/siswa/activity/recent] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}
