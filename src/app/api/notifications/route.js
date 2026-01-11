import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Get notifications for current user
export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API NOTIFICATIONS] REQUEST START ---');

  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API NOTIFICATIONS] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const countOnly = searchParams.get('countOnly') === 'true';

    try {
      let whereClause = {
        userId: session.user.id,
      };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const startQueries = performance.now();
      
      if (countOnly) {
        const count = await prisma.notification.count({ where: whereClause });
        const endQueries = performance.now();
        console.log(`[API NOTIFICATIONS] prisma.count: ${(endQueries - startQueries).toFixed(2)} ms`);
        
        const endTotal = performance.now();
        console.log(`[API NOTIFICATIONS] total (count): ${(endTotal - startTotal).toFixed(2)} ms`);
        return NextResponse.json({ count });
      }

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true,
          data: true
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
      const endQueries = performance.now();
      console.log(`[API NOTIFICATIONS] prisma.findMany: ${(endQueries - startQueries).toFixed(2)} ms`);

      const endTotal = performance.now();
      console.log(`[API NOTIFICATIONS] total: ${(endTotal - startTotal).toFixed(2)} ms`);
      console.log('--- [API NOTIFICATIONS] REQUEST END ---');

      return NextResponse.json(notifications, {
        headers: { 'Cache-Control': 'private, s-maxage=10, stale-while-revalidate=30' }
      });
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
