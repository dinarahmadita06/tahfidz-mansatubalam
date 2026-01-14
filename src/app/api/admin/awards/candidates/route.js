export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const kelasId = searchParams.get('kelasId');
    const periode = searchParams.get('periode');
    const jenisKelamin = searchParams.get('jenisKelamin');

    const where = {
      statusPendaftaran: 'SELESAI',
      isPassed: true,
      assessedAt: { not: null },
      // Siswa is NOT already in award recipients
      awardRecipient: { none: {} }
    };

    if (query) {
      where.siswa = {
        ...where.siswa,
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { nisn: { contains: query } },
          { nis: { contains: query } }
        ]
      };
    }

    if (kelasId) {
      where.siswa = { ...where.siswa, kelasId };
    }

    if (jenisKelamin) {
      where.siswa = { ...where.siswa, jenisKelamin };
    }

    if (periode) {
      const year = parseInt(periode);
      where.tanggalUjian = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    const candidates = await prisma.tasmi.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            nisn: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          }
        }
      },
      orderBy: { assessedAt: 'desc' },
      take: 100 // Optimization
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
