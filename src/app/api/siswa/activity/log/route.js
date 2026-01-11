export const dynamic = 'force-dynamic';
export const revalidate = 0;
/**
 * API Route: POST /api/siswa/activity/log
 * Log activity untuk siswa (view, action, atau system events)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logSiswaActivity, logSistemActivity } from '@/lib/helpers/siswaActivityLogger';
import { getActivityDisplay } from '@/lib/helpers/siswaActivityConstants';

export async function POST(request) {
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

    const body = await request.json();
    const { actionType, title, description, metadata } = body;

    if (!actionType || !title) {
      return NextResponse.json(
        { error: 'Missing actionType or title' },
        { status: 400 }
      );
    }

    // Log activity with anti-spam check
    const activity = await logSiswaActivity({
      siswaId: siswa.id,
      actionType,
      title: title || getActivityDisplay(actionType).title,
      description: description || getActivityDisplay(actionType).description,
      metadata,
      actorId: session.user.id,
      actorName: session.user.name
    });

    // Return null if activity was prevented by anti-spam
    if (!activity) {
      return NextResponse.json({
        success: true,
        prevented: true,
        message: 'Activity already logged today (anti-spam)'
      });
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        action: activity.action,
        createdAt: activity.createdAt
      }
    });

  } catch (error) {
    console.error('[/api/siswa/activity/log] Error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity', details: error.message },
      { status: 500 }
    );
  }
}
