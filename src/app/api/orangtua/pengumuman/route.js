import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kategori = searchParams.get('kategori') || 'semua';
    const periode = searchParams.get('periode') || 'semua';

    // Build filter conditions
    const whereConditions = {
      isPublished: true,
    };

    // Search filter
    if (search) {
      whereConditions.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { konten: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (kategori !== 'semua') {
      whereConditions.kategori = kategori;
    }

    // Period filter
    if (periode !== 'semua') {
      const now = new Date();
      let startDate;

      if (periode === 'bulan_ini') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (periode === 'semester_ini') {
        // Semester 1: Jul-Dec, Semester 2: Jan-Jun
        const currentMonth = now.getMonth();
        if (currentMonth >= 6) {
          startDate = new Date(now.getFullYear(), 6, 1); // July
        } else {
          startDate = new Date(now.getFullYear(), 0, 1); // January
        }
      }

      if (startDate) {
        whereConditions.createdAt = {
          gte: startDate,
        };
      }
    }

    const pengumuman = await prisma.pengumuman.findMany({
      where: whereConditions,
      include: {
        pengirim: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add "baru" flag for announcements less than 3 days old
    const pengumumanWithFlags = pengumuman.map(item => {
      const daysDiff = Math.floor(
        (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)
      );

      return {
        ...item,
        isBaru: daysDiff < 3,
      };
    });

    return NextResponse.json(pengumumanWithFlags);
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pengumuman' },
      { status: 500 }
    );
  }
}
