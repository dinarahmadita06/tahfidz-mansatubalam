import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/siswa/aktivitas-terbaru
 * 
 * Fetch activity log untuk siswa yang sedang login
 * Hanya menampilkan aktivitas yang DILAKUKAN oleh siswa sendiri (actorRole=SISWA AND actorId=userId)
 * 
 * Response:
 * {
 *   "activities": [
 *     {
 *       "id": "...",
 *       "title": "Mendaftar Tasmi' Baru",
 *       "description": "...",
 *       "type": "DAFTAR_TASMI",
 *       "createdAt": "2026-01-03T...",
 *       "actor": { "name": "..." }
 *     }
 *   ]
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get siswa ID dari session
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    // ✅ Fetch activity log yang DILAKUKAN siswa (actorRole=SISWA, actorId=userId)
    // Jangan ambil aktivitas TENTANG siswa (targetUserId=siswaId, misalnya guru menilai siswa)
    const activities = await prisma.guruActivity.findMany({
      where: {
        userId: session.user.id  // Aktivitas yang dilakukan siswa sendiri
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

    console.log(`[SISWA AKTIVITAS] Fetched ${formattedActivities.length} activities for siswa ${siswa.id}`);

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching siswa activities:', error);
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
