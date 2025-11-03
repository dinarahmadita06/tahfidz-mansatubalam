import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guruId: guru.id,
        isActive: true,
      },
      include: {
        kelas: {
          include: {
            tahunAjaran: true,
            _count: {
              select: { siswa: true },
            },
          },
        },
      },
      orderBy: {
        kelas: {
          nama: 'asc',
        },
      },
    });

    const kelas = guruKelas.map((gk) => gk.kelas);

    return NextResponse.json({ kelas });
  } catch (error) {
    console.error('Error fetching kelas guru:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
