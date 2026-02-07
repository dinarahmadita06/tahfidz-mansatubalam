export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData } from '@/lib/cache';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

// GET - List all guru with statistics (Admin only)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.time('GET /api/admin/guru');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active' or 'inactive'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    let whereClause = {};
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { nip: { contains: search } }
      ];
    }
    if (status === 'active') {
      whereClause.user = { ...whereClause.user, isActive: true };
    } else if (status === 'inactive') {
      whereClause.user = { ...whereClause.user, isActive: false };
    }

    // Parallel queries: count + findMany + statistics
    console.time('guru-queries');
    const [totalCount, activeCount, inactiveCount, guru] = await Promise.all([
      prisma.guru.count({ where: whereClause }),
      prisma.guru.count({ where: { ...whereClause, user: { isActive: true } } }),
      prisma.guru.count({ where: { ...whereClause, user: { isActive: false } } }),
      prisma.guru.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nip: true,
          tanggalLahir: true,
          jenisKelamin: true,
          jabatan: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              username: true,
              createdAt: true
            }
          },
          guruKelas: {
            select: {
              id: true,
              peran: true,
              isActive: true,
              kelas: {
                select: {
                  id: true,
                  nama: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: {
              guruKelas: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);
    console.timeEnd('guru-queries');

    const totalPages = Math.ceil(totalCount / limit);

    const responseData = {
      statistics: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount
      },
      data: guru,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages
      }
    };

    console.timeEnd('GET /api/admin/guru');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching guru:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch guru',
        details: error.message
      },
      { status: 500 }
    );
  }
}
