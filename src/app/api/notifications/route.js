import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Get notifications for current user
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Check if notification table exists by trying to query it
    try {
      let whereClause = {
        userId: session.user.id,
      };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      return NextResponse.json(notifications);
    } catch (dbError) {
      // Notification table doesn't exist or other DB error - return empty array
      console.error('[Notifications] Database error (likely model missing):', dbError.message);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('[Notifications] Error:', error);
    // Return empty array instead of error to prevent UI crash
    return NextResponse.json([]);
  }
}

// PATCH - Mark notification as read
export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
