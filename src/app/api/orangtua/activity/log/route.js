export const dynamic = 'force-dynamic';
export const revalidate = 0;
/**
 * API Route: POST /api/orangtua/activity/log
 * Log activities for parent portal (ORANG_TUA role only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/helpers/activityLoggerV2';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, title, description, metadata } = body;

    if (!action || !title) {
      return NextResponse.json(
        { error: 'Missing action or title' },
        { status: 400 }
      );
    }

    // Log activity
    const activity = await logActivity({
      actorId: session.user.id,
      actorRole: 'ORANG_TUA',
      actorName: session.user.name,
      action,
      title,
      description: description || null,
      metadata
    });

    return NextResponse.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Error logging parent activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
