import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil semua statistik untuk dashboard
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('DASHBOARD STATS - Fetching statistics...');

    // 1. Total Siswa & Siswa Aktif
    const totalSiswa = await prisma.siswa.count();
    const siswaAktif = await prisma.siswa.count({
      where: { status: 'approved' }
    });

    console.log('DASHBOARD STATS - Siswa:', { totalSiswa, siswaAktif });

    // 2. Total Guru (users with role GURU)
    const totalGuru = await prisma.user.count({
      where: { role: 'GURU' }
    });

    console.log('DASHBOARD STATS - Guru:', { totalGuru });

    // 3. Total Hafalan (sum of juz from hafalan table)
    const hafalanData = await prisma.hafalan.aggregate({
      _count: true
    });
    const totalHafalan = hafalanData._count || 0;
    
    // For totalJuz, we need to sum from hafalan juz field
    const totalJuzData = await prisma.hafalan.aggregate({
      _sum: {
        juz: true
      }
    });
    const totalJuz = totalJuzData._sum?.juz || 0;

    console.log('DASHBOARD STATS - Hafalan:', { totalHafalan, totalJuz });

    // 4. Rata-rata Nilai (from all penilaian records)
    const nilaiData = await prisma.penilaian.aggregate({
      _avg: {
        nilai: true
      }
    });
    const rataRataNilai = nilaiData._avg?.nilai
      ? Math.round(nilaiData._avg.nilai * 10) / 10
      : 0;

    console.log('DASHBOARD STATS - Rata-rata Nilai:', { rataRataNilai });

    // 5. Rata-rata Kehadiran
    const totalPresensi = await prisma.presensi.count();
    const hadir = await prisma.presensi.count({
      where: {
        status: {
          in: ['HADIR', 'SAKIT', 'IZIN']
        }
      }
    });
    const rataRataKehadiran = totalPresensi > 0
      ? Math.round((hadir / totalPresensi) * 100)
      : 0;

    console.log('DASHBOARD STATS - Kehadiran:', {
      totalPresensi,
      hadir,
      rataRataKehadiran
    });

    // 6. **NEW** Siswa Mencapai Target (≥3 juz hafalan)
    const TARGET_HAFALAN = 3; // Target sekolah = 3 juz

    // Get siswa with their total hafalan
    const siswaDenganHafalan = await prisma.siswa.findMany({
      include: {
        hafalan: {
          select: { juz: true }
        }
      }
    });

    const siswaMencapaiTarget = siswaDenganHafalan.filter(siswa => {
      const totalJuzSiswa = siswa.hafalan?.reduce((sum, h) => sum + (h.juz || 0), 0) || 0;
      return totalJuzSiswa >= TARGET_HAFALAN;
    }).length;

    const persentaseSiswaMencapaiTarget = totalSiswa > 0
      ? Math.round((siswaMencapaiTarget / totalSiswa) * 100)
      : 0;

    console.log('DASHBOARD STATS - Siswa Mencapai Target:', {
      siswaMencapaiTarget,
      totalSiswa,
      persentase: persentaseSiswaMencapaiTarget
    });

    // 7. **NEW** Kelas Mencapai Target (≥50% siswa mencapai target)
    const allKelas = await prisma.kelas.findMany({
      where: {
        status: 'AKTIF'
      },
      include: {
        siswa: {
          include: {
            hafalan: {
              select: { juz: true }
            }
          }
        }
      }
    });

    const kelasMencapaiTarget = allKelas.filter(kelas => {
      if (kelas.siswa.length === 0) return false;

      const siswaMencapaiDiKelas = kelas.siswa.filter(siswa => {
        const totalJuzSiswa = siswa.hafalan?.reduce((sum, h) => sum + (h.juz || 0), 0) || 0;
        return totalJuzSiswa >= TARGET_HAFALAN;
      }).length;

      const persentaseMencapai = (siswaMencapaiDiKelas / kelas.siswa.length) * 100;
      return persentaseMencapai >= 50;
    }).length;

    const totalKelasAktif = allKelas.length;

    console.log('DASHBOARD STATS - Kelas Mencapai Target:', {
      kelasMencapaiTarget,
      totalKelasAktif
    });

    const stats = {
      totalSiswa,
      siswaAktif,
      totalGuru,
      totalHafalan,
      totalJuz,
      rataRataNilai,
      rataRataKehadiran,
      siswaMencapaiTarget,
      persentaseSiswaMencapaiTarget,
      kelasMencapaiTarget,
      totalKelas: totalKelasAktif
    };

    console.log('DASHBOARD STATS - Final stats:', stats);

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    return NextResponse.json(
      {
        error: 'Gagal mengambil statistik dashboard',
        details: error.message
      },
      { status: 500 }
    );
  }
}
