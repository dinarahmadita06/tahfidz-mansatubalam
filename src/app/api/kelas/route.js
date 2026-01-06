import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();
    console.log('[API /kelas] Session:', { role: session?.user?.role, userId: session?.user?.id });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true'; // Show all kelas, not just guru's classes
    console.log('[API /kelas] Params:', { showAll });

    let whereClause = {};

    // Filter based on role
    if (session.user.role === 'GURU' && session.user.guruId && !showAll) {
      whereClause.guruKelas = {
        some: {
          guruId: session.user.guruId,
          isActive: true
        }
      };
      console.log('[API /kelas] Filtering for GURU:', session.user.guruId);
    } else if (session.user.role === 'ADMIN') {
      console.log('[API /kelas] ADMIN role - showing ALL classes');
    }

    console.log('[API /kelas] Where clause:', JSON.stringify(whereClause));

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

    console.log('[API /kelas] RESULT: Total kelas found:', kelas.length);
    console.log('[API /kelas] Classes:', kelas.map(k => ({ id: k.id, nama: k.nama, status: k.status })));

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('[API /kelas] ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kelas', details: error.message },
      { status: 500 }
    );
  }
}
