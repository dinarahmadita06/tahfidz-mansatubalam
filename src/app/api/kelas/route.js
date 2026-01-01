import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true'; // Show all kelas, not just guru's classes

    let whereClause = {};

    // Filter based on role
    if (session.user.role === 'GURU' && session.user.guruId && !showAll) {
      whereClause.guruKelas = {
        some: {
          guruId: session.user.guruId,
          isActive: true
        }
      };
    }

    const kelas = await prisma.kelas.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        status: true,
        targetJuz: true,
        tahunAjaranId: true,
        guruKelas: {
          where: {
            isActive: true
          },
          include: {
            guru: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
          orderBy: {
            tanggalMulai: 'asc'
          }
        },
        tahunAjaran: {
          select: {
            id: true,
            nama: true,
            isActive: true,
            targetHafalan: true,
          },
        },
        _count: {
          select: {
            siswa: true,
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('Error fetching kelas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kelas' },
      { status: 500 }
    );
  }
}
