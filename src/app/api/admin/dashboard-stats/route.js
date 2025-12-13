import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real data from database
    const [
      totalSiswa,
      siswaAktif,
      totalGuru,
      totalHafalan,
      totalPenilaian,
      totalKelas,
      totalPresensi,
      totalTahunAjaran
    ] = await Promise.all([
      prisma.siswa.count(),
      prisma.siswa.count({ where: { status: 'approved' } }),
      prisma.guru.count(),
      prisma.hafalan.count(),
      prisma.penilaian.count(),
      prisma.kelas.count(),
      prisma.presensi.count(),
      prisma.tahunAjaran.count(),
    ]);

    // Calculate rata-rata nilai if there are penilaian
    let rataRataNilai = 0;
    if (totalPenilaian > 0) {
      const penilaianData = await prisma.penilaian.findMany({
        select: { nilai: true }
      });
      const totalNilai = penilaianData.reduce((sum, p) => sum + (p.nilai || 0), 0);
      rataRataNilai = totalNilai / totalPenilaian;
    }

    // Calculate rata-rata kehadiran
    let rataRataKehadiran = 0;
    if (totalPresensi > 0) {
      const presensiHadir = await prisma.presensi.count({
        where: { status: 'HADIR' }
      });
      rataRataKehadiran = (presensiHadir / totalPresensi) * 100;
    }

    // Get today's setoran count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const setoranHariIni = await prisma.hafalan.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        }
      }
    });

    const stats = {
      totalSiswa,
      siswaAktif,
      totalGuru,
      totalJuz: 0, // Will be calculated from hafalan
      rataRataNilai: Math.round(rataRataNilai * 10) / 10,
      setoranHariIni,
      totalKelas,
      rataRataKehadiran: Math.round(rataRataKehadiran * 10) / 10,
      totalHafalan,
      totalPenilaian,
      totalPresensi,
      totalTahunAjaran,
    };

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}
