export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { kelasId } = params;

    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        tahunAjaran: true,
        siswa: {
          where: {
            status: 'approved', // Only get approved/active students
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            user: {
              name: 'asc',
            },
          },
        },
        _count: {
          select: { siswa: true },
        },
      },
    });

    if (!kelas) {
      return NextResponse.json(
        { message: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ kelas });
  } catch (error) {
    console.error('Error fetching kelas detail:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
