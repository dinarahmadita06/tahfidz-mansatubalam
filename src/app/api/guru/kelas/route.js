export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function GET() {
  console.time('[API /guru/kelas]');
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    console.log('[API /guru/kelas] User session:', { id: session.user.id, email: session.user.email });
    
    // Combined query to avoid multiple round-trips
    const guruKelas = await prisma.guruKelas.findMany({
      where: {
        guru: { userId: session.user.id },
        isActive: true
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

    console.log('[API /guru/kelas] GuruKelas found:', guruKelas.length);

    const kelas = guruKelas.map((gk) => gk.kelas);

    console.timeEnd('[API /guru/kelas]');
    return NextResponse.json({ kelas });
  } catch (error) {
    console.error('Error fetching kelas guru:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
