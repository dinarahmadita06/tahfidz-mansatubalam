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

    // 3. Total Hafalan (sum of all totalHafalan in juz)
    const hafalanData = await prisma.siswa.aggregate({
      _sum: {
        totalHafalan: true
      }
    });
    const totalJuz = hafalanData._sum?.totalHafalan || 0;

    console.log('DASHBOARD STATS - Total Juz:', { totalJuz });

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
    // Hitung total presensi dan yang hadir
    const totalPresensi = await prisma.presensi.count();
    const hadir = await prisma.presensi.count({
      where: {
        status: {
          in: ['HADIR', 'SAKIT', 'IZIN'] // Count semua kecuali ALPA
        }
      }
    });
    const rataRataKehadiran = totalPresensi > 0
      ? Math.round((hadir / totalPresensi) * 1000) / 10
      : 0;

    console.log('DASHBOARD STATS - Kehadiran:', {
      totalPresensi,
      hadir,
      rataRataKehadiran
    });

    // 6. **NEW** Siswa Mencapai Target (≥3 juz)
    const TARGET_HAFALAN = 3; // Target sekolah = 3 juz

    const siswaMencapaiTarget = await prisma.siswa.count({
      where: {
        totalHafalan: {
          gte: TARGET_HAFALAN
        }
      }
    });

    const persentaseSiswaMencapaiTarget = totalSiswa > 0
      ? Math.round((siswaMencapaiTarget / totalSiswa) * 100)
      : 0;

    console.log('DASHBOARD STATS - Siswa Mencapai Target:', {
      siswaMencapaiTarget,
      totalSiswa,
      persentase: persentaseSiswaMencapaiTarget
    });

    // 7. **NEW** Kelas Mencapai Target (rata-rata hafalan kelas ≥3 juz)
    // Get all kelas with their students' average hafalan
    const allKelas = await prisma.kelas.findMany({
      where: {
        status: 'AKTIF'
      },
      include: {
        siswa: {
          select: {
            totalHafalan: true
          }
        }
      }
    });

    const totalKelas = allKelas.length;

    const kelasMencapaiTarget = allKelas.filter(kelas => {
      if (kelas.siswa.length === 0) return false;

      const totalHafalanKelas = kelas.siswa.reduce(
        (sum, siswa) => sum + (siswa.totalHafalan || 0),
        0
      );
      const rataRataKelas = totalHafalanKelas / kelas.siswa.length;

      return rataRataKelas >= TARGET_HAFALAN;
    }).length;

    console.log('DASHBOARD STATS - Kelas Mencapai Target:', {
      kelasMencapaiTarget,
      totalKelas
    });

    const stats = {
      totalSiswa,
      siswaAktif,
      totalGuru,
      totalJuz,
      rataRataNilai,
      rataRataKehadiran,
      // New statistics
      siswaMencapaiTarget,
      persentaseSiswaMencapaiTarget,
      kelasMencapaiTarget,
      totalKelas
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
