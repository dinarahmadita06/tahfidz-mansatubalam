import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatTimeAgo } from '@/lib/helpers/activityLoggerV2';

/**
 * GET /api/siswa/aktivitas-list
 * Fetch paginated activity logs for authenticated siswa
 * 
 * Query params:
 * - limit=10 (default)
 * - page=1 (default)
 * - afterDate=YYYY-MM-DD (optional - filter activities after date)
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const afterDate = searchParams.get('afterDate');

    const skip = (page - 1) * limit;

    // Build where clause - filter by actor (siswa's own activities only)
    const whereClause = {
      actorId: session.user.id,
      actorRole: 'SISWA',
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
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      title: activity.title,
      description: activity.description,
      timeAgo: formatTimeAgo(activity.createdAt),
      createdAt: activity.createdAt,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }));

    console.log(
      `[SISWA AKTIVITAS] Fetched ${formattedActivities.length} activities for siswa ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      data: formattedActivities,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[SISWA AKTIVITAS ERROR]', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data aktivitas', details: error.message },
      { status: 500 }
    );
  }
}
