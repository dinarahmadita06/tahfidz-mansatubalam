import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    console.log('[API /guru/kelas] User session:', { id: session.user.id, email: session.user.email, name: session.user.name });
    
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    console.log('[API /guru/kelas] Guru lookup result:', guru ? { id: guru.id } : 'NOT_FOUND');
    
    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan', userId: session.user.id },
        { status: 404 }
      );
    }

    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guruId: guru.id,
        isActive: true,
        kelas: {
          status: 'AKTIF'  // FILTER: Only show AKTIF classes
        }
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

    console.log('[API /guru/kelas] GuruKelas found (AKTIF only):', guruKelas.length, guruKelas.map(gk => ({ kelasNama: gk.kelas.nama, siswaCount: gk.kelas._count.siswa })));

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
