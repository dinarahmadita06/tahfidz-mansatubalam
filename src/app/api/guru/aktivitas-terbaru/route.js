import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/guru/aktivitas-terbaru
 * 
 * Fetch activity log untuk guru yang sedang login
 * Hanya menampilkan aktivitas yang DILAKUKAN oleh guru sendiri (actorRole=GURU AND actorId=userId)
 * 
 * Response:
 * {
 *   "activities": [
 *     {
 *       "id": "...",
 *       "title": "Input penilaian hafalan",
 *       "description": "Menilai Lakita (Kelas X A3)",
 *       "type": "INPUT_PENILAIAN_HAFALAN",
 *       "createdAt": "2026-01-03T...",
 *       "actor": { "name": "..." }
 *     }
 *   ]
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get guru ID dari session
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!guru) {
      return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
    }

    // ✅ Fetch activity log yang DILAKUKAN guru (userId=guru userId)
    // Jangan ambil aktivitas TENTANG guru (targetUserId=guruId, misalnya admin mengelola guru)
    const activities = await prisma.guruActivity.findMany({
      where: {
        userId: session.user.id  // Aktivitas yang dilakukan guru sendiri
      },
      select: {
        id: true,
        type: true,
        title: true,
        subtitle: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8  // Limit 8 aktivitas terbaru
    });

    // ✅ Format response with human-friendly timestamps
    const formattedActivities = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.createdAt);
      return {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.subtitle || '',
        createdAt: activity.createdAt,
        timeAgo: timeAgo,
        actor: {
          name: activity.user?.name || 'Unknown',
          image: activity.user?.image
        }
      };
    });

    console.log(`[GURU AKTIVITAS] Fetched ${formattedActivities.length} activities for guru ${guru.id}`);

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching guru activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper: Convert DateTime to human-friendly format (e.g., "2 jam lalu")
 */
function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);

  const intervals = {
    tahun: 31536000,
    bulan: 2592000,
    minggu: 604800,
    hari: 86400,
    jam: 3600,
    menit: 60
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name} lalu`;
    }
  }

  return 'Baru saja';
}
