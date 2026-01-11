import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count all siswa
    const totalSiswa = await prisma.siswa.count();

    // Get sample data
    const sampleSiswa = await prisma.siswa.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        kelas: {
          select: {
            nama: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      total: totalSiswa,
      sample: sampleSiswa,
      message: `Found ${totalSiswa} siswa in database`
    });
  } catch (error) {
    console.error('Error counting siswa:', error);
    return NextResponse.json(
      {
        error: 'Failed to count siswa',
        details: error.message
      },
      { status: 500 }
    );
  }
}
