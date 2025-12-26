import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siswaId } = params;

    // Verify that this siswa is actually the child of this orang tua
    const orangTuaSiswa = await prisma.orangTuaSiswa.findUnique({
      where: {
        orangTuaId_siswaId: {
          orangTuaId: session.user.id,
          siswaId: siswaId
        }
      }
    });

    if (!orangTuaSiswa) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetHafalan = await prisma.targetHafalan.findMany({
      where: {
        siswaId: siswaId
      },
      include: {
        // Removed surah: true since surah is a string field, not a relation
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(targetHafalan);
  } catch (error) {
    console.error('Error fetching target hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target hafalan' },
      { status: 500 }
    );
  }
}
