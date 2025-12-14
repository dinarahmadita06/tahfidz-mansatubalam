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

    console.log('GET PENGUMUMAN - Request params:', {
      limit,
      unreadOnly,
      userId: session.user.id,
      role: session.user.role
    });

    // Build base where clause for valid announcements
    const baseWhere = {
      AND: [
        // Pengumuman harus dimulai sebelum atau hari ini
        {
          tanggalMulai: {
            lte: now
          }
        },
        // Pengumuman belum berakhir (tanggalSelesai null atau belum tercapai)
        {
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
        }
      ]
    };

    // If unreadOnly is true, exclude announcements that user has already read/closed
    if (unreadOnly) {
      baseWhere.AND.push({
        pengumumanRead: {
          none: {
            userId: session.user.id
          }
        }
      });
    }

    console.log('GET PENGUMUMAN - Where clause:', JSON.stringify(baseWhere, null, 2));

    // Ambil semua pengumuman yang masih aktif (belum expired)
    const pengumuman = await prisma.pengumuman.findMany({
      where: baseWhere,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            pengumumanRead: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    console.log('GET PENGUMUMAN - Found pengumuman:', {
      count: pengumuman.length,
      items: pengumuman.map(p => ({
        id: p.id,
        judul: p.judul,
        createdAt: p.createdAt,
        tanggalMulai: p.tanggalMulai,
        tanggalSelesai: p.tanggalSelesai,
        readCount: p._count.pengumumanRead
      }))
    });

    return NextResponse.json({ pengumuman });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumuman', details: error.message },
      { status: 500 }
    );
  }
}
