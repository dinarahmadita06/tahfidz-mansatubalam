export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List parents for teachers to select
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '1000');

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { noTelepon: { contains: search } }
      ];
    }

    const parents = await prisma.orangTua.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error fetching parents for teacher:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data orang tua' },
      { status: 500 }
    );
  }
}
