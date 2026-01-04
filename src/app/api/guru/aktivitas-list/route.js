import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ✅ Disable caching - always fetch fresh data from database
export const dynamic = 'force-dynamic';

/**
 * GET /api/guru/aktivitas-list
 * Fetch paginated activity logs for authenticated guru
 * Database queries only - no business logic or formatting
 * 
 * Query params:
 * - limit=10 (default)
 * - page=1 (default)
 * - afterDate=YYYY-MM-DD (optional - filter activities after date)
 * 
 * Response:
 * - data: Array of activities with createdAt (frontend calculates timeAgo)
 * - pagination: { total, page, limit, pages }
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const afterDate = searchParams.get('afterDate');

    const skip = (page - 1) * limit;

    // Build where clause - filter by actor (guru's own activities only)
    const whereClause = {
      actorId: session.user.id,
      actorRole: 'GURU',
    };

    // Optional date filter
    if (afterDate) {
      whereClause.createdAt = {
        gte: new Date(afterDate),
      };
    }

    // Fetch activities
    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Fetch total count
    const totalCount = await prisma.activityLog.count({
      where: whereClause,
    });

    // Format response
    const formattedActivities = activities.map((activity) => {
      let metadata = null;
      if (activity.metadata) {
        // Prisma's Json type returns already-parsed object
        // If it's a string, parse it; if it's an object, use as-is
        if (typeof activity.metadata === 'string') {
          try {
            metadata = JSON.parse(activity.metadata);
          } catch (e) {
            metadata = activity.metadata;
          }
        } else {
          metadata = activity.metadata;
        }
      }
      return {
        id: activity.id,
        action: activity.action,
        title: activity.title,
        description: activity.description,
        createdAt: activity.createdAt,
        metadata,
      };
    });

    console.log(
      `[GURU AKTIVITAS] Fetched ${formattedActivities.length} activities for guru ${session.user.id}`
    );

    const response = NextResponse.json({
      success: true,
      data: formattedActivities,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });

    // ✅ Set cache headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error('[GURU AKTIVITAS ERROR]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data aktivitas', details: error.message },
      { status: 500 }
    );
  }
}
