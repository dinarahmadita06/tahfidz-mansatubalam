import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const role = searchParams.get('role');
    const action = searchParams.get('action');
    const module = searchParams.get('module');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const whereClause = {};

    if (role && role !== 'all') {
      whereClause.userRole = role;
    }

    if (action && action !== 'all') {
      whereClause.action = action;
    }

    if (module && module !== 'all') {
      whereClause.module = module;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (tanggalMulai && tanggalSelesai) {
      whereClause.createdAt = {
        gte: new Date(tanggalMulai),
        lte: new Date(tanggalSelesai)
      };
    }

    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.activityLog.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / limit);

    // Get activity logs with pagination
    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Parse metadata and userAgent for better readability
    const logsWithParsedData = logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      deviceInfo: log.userAgent ? parseUserAgent(log.userAgent) : 'Unknown'
    }));

    return NextResponse.json({
      logs: logsWithParsedData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data log aktivitas' },
      { status: 500 }
    );
  }
}

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  if (!userAgent) return 'Unknown';

  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  return `${browser} on ${os}`;
}
