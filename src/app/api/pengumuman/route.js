export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil pengumuman untuk user berdasarkan role
export async function GET(request) {
  console.time('PENGUMUMAN_GET_Total');
  try {
    console.time('PENGUMUMAN_GET_Auth');
    const session = await auth();
    console.timeEnd('PENGUMUMAN_GET_Auth');

    if (!session) {
      console.timeEnd('PENGUMUMAN_GET_Total');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '10'); // Default 10 as per business rule
    const limit = Math.min(limitParam, 100); 
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const now = new Date();
    
    // Set today at 00:00:00 for start comparisons
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Set today at 23:59:59 for end comparisons (timezone-safe)
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    console.log('GET PENGUMUMAN - Request params:', {
      limit,
      unreadOnly,
      userId: session.user.id,
      role: session.user.role,
      today: now.toISOString()
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
        // Pengumuman belum berakhir (tanggalSelesai null atau >= hari ini)
        {
          OR: [
            {
              tanggalSelesai: null
            },
            {
              tanggalSelesai: {
                gte: todayStart // Using todayStart to ensure it's still visible today
              }
            }
          ]
        },
        // Soft delete filter
        {
          deletedAt: null
        }
      ]
    };

    // Rule: isPublished=true for non-admin
    if (session.user.role !== 'ADMIN') {
      baseWhere.AND.push({
        isPublished: true
      });
      
      // Rule: audience filter
      baseWhere.AND.push({
        OR: [
          { audience: 'ALL' },
          { audience: session.user.role }
        ]
      });
    }

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

    console.time('PENGUMUMAN_GET_Query');
    // Ambil semua pengumuman yang masih aktif (belum expired)
    const pengumuman = await prisma.pengumuman.findMany({
      where: baseWhere,
      select: {
        id: true,
        judul: true,
        isi: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        createdAt: true,
        lampiran: true,
        attachmentUrl: true,
        attachmentName: true,
        attachmentSize: true,
        user: {
          select: {
            name: true,
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
    console.timeEnd('PENGUMUMAN_GET_Query');

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

    console.time('PENGUMUMAN_GET_Response');
    const response = NextResponse.json({ pengumuman });
    console.timeEnd('PENGUMUMAN_GET_Response');
    console.timeEnd('PENGUMUMAN_GET_Total');
    
    return response;
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
