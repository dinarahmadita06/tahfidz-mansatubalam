import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil pengumuman untuk user berdasarkan role
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const now = new Date();

    // Build base where clause for valid announcements
    const baseWhere = {
      // Pengumuman harus dimulai sebelum atau hari ini
      tanggalMulai: {
        lte: now
      },
      // Pengumuman belum berakhir (tanggalSelesai null atau belum tercapai)
      OR: [
        {
          tanggalSelesai: null
        },
        {
          tanggalSelesai: {
            gte: now
          }
        }
      ]
    };

    // If unreadOnly is true, exclude announcements that user has already read/closed
    if (unreadOnly) {
      baseWhere.pengumumanRead = {
        none: {
          userId: session.user.id
        }
      };
    }

    // Ambil semua pengumuman yang masih aktif (belum expired)
    const pengumuman = await prisma.pengumuman.findMany({
      where: baseWhere,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ pengumuman });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumuman' },
      { status: 500 }
    );
  }
}
