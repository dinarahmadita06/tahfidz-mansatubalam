export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/guru/dashboard/stats
 * 
 * Fetch dashboard statistics untuk guru berdasarkan kelas AKTIF yang diampu
 */
export async function GET(request) {
  console.time('[API /guru/dashboard/stats]');
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API /guru/dashboard/stats] Getting stats for user:', session.user.id);

    // Step 1: Get guru record from user ID
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      console.log('[API /guru/dashboard/stats] Guru not found');
      return NextResponse.json({
        kelasDiampu: 0,
        jumlahSiswa: 0,
        progressRataRata: 0
      });
    }

    console.log('[API /guru/dashboard/stats] Found guru:', guru.id);

    // Step 2: Get AKTIF classes that guru teaches
    const kelasAktif = await prisma.guruKelas.findMany({
      where: {
        guruId: guru.id,
        isActive: true,
        kelas: {
          status: 'AKTIF'
        }
      },
      include: {
        kelas: {
          include: {
            _count: {
              select: { siswa: true }
            }
          }
        }
      }
    });

    console.log('[API /guru/dashboard/stats] AKTIF classes:', kelasAktif.length);

    const kelasDiampu = kelasAktif.length;
    const jumlahSiswa = kelasAktif.reduce((sum, gk) => sum + gk.kelas._count.siswa, 0);

    console.log('[API /guru/dashboard/stats] Total siswa:', jumlahSiswa);

    // Step 3: Calculate progress rata-rata
    let progressRataRata = 0;
    if (jumlahSiswa > 0) {
      const kelasIds = kelasAktif.map(gk => gk.kelasId);
      
      // Get all siswa in active classes
      const siswaList = await prisma.siswa.findMany({
        where: {
          kelasId: { in: kelasIds },
          status: 'approved'
        },
        include: {
          _count: {
            select: { hafalan: true }
          }
        }
      });

      if (siswaList.length > 0) {
        const totalHafalan = siswaList.reduce((sum, s) => sum + s._count.hafalan, 0);
        progressRataRata = Math.round((totalHafalan / siswaList.length) * 10) / 10;
      }
    }

    console.log('[API /guru/dashboard/stats] Progress rata-rata:', progressRataRata);

    console.timeEnd('[API /guru/dashboard/stats]');
    return NextResponse.json({
      kelasDiampu,
      jumlahSiswa,
      progressRataRata
    });
  } catch (error) {
    console.error('[API /guru/dashboard/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    );
  }
}
