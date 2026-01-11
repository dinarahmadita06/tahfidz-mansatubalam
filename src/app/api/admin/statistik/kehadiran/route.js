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

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const status = searchParams.get('status');

    // Build where clause
    const whereClause = {};
    if (kelasId) {
      whereClause.siswa = { kelasId };
    }
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    // Get all kehadiran
    const kehadiran = await prisma.presensi.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            },
            kelas: {
              select: { nama: true }
            }
          }
        }
      }
    });

    // Get unique dates for total pertemuan
    const uniqueDates = [...new Set(kehadiran.map(k => k.tanggal.toISOString().split('T')[0]))];
    const totalPertemuan = uniqueDates.length;

    // Calculate summary
    const totalHadir = kehadiran.filter(k => k.status === 'HADIR').length;
    const totalIzin = kehadiran.filter(k => k.status === 'IZIN').length;
    const totalSakit = kehadiran.filter(k => k.status === 'SAKIT').length;
    const totalAlpa = kehadiran.filter(k => k.status === 'ALPA').length;
    const totalKehadiran = kehadiran.length;

    const rataKehadiran = totalKehadiran > 0
      ? Math.round((totalHadir / totalKehadiran) * 100)
      : 0;

    // Tren kehadiran per bulan (12 bulan terakhir)
    const trendKehadiran = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const kehadiranMonth = await prisma.presensi.findMany({
        where: {
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          ...(kelasId && {
            siswa: {
              kelasId: kelasId
            }
          })
        }
      });

      const hadirMonth = kehadiranMonth.filter(k => k.status === 'HADIR').length;
      const persenHadir = kehadiranMonth.length > 0
        ? Math.round((hadirMonth / kehadiranMonth.length) * 100)
        : 0;

      trendKehadiran.push({
        bulan: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        persen: persenHadir
      });
    }

    // Distribusi status kehadiran
    const distribusiStatus = [
      { name: 'Hadir', value: totalHadir },
      { name: 'Izin', value: totalIzin },
      { name: 'Sakit', value: totalSakit },
      { name: 'Alpa', value: totalAlpa }
    ];

    // Get siswa stats for ranking
    const siswaList = await prisma.siswa.findMany({
      where: kelasId ? { kelasId } : {},
      include: {
        user: {
          select: { name: true }
        },
        presensi: true
      }
    });

    const siswaStats = siswaList.map(siswa => {
      const hadir = siswa.presensi.filter(k => k.status === 'HADIR').length;
      const total = siswa.presensi.length;
      const persenKehadiran = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        nama: siswa.user.name,
        persenKehadiran,
        hadir,
        total
      };
    });

    // Top 10 & Bottom 10
    const sortedStats = [...siswaStats].sort((a, b) => b.persenKehadiran - a.persenKehadiran);
    const top10 = sortedStats.slice(0, 10);
    const bottom10 = sortedStats.slice(-10).reverse();

    // Perbandingan antar kelas
    const kelasList = await prisma.kelas.findMany({
      include: {
        siswa: {
          include: {
            presensi: true
          }
        }
      }
    });

    const kelasComparison = kelasList.map(kelas => {
      const kehadiranKelas = kelas.siswa.flatMap(s => s.presensi);
      const hadir = kehadiranKelas.filter(k => k.status === 'HADIR').length;
      const izin = kehadiranKelas.filter(k => k.status === 'IZIN').length;
      const sakit = kehadiranKelas.filter(k => k.status === 'SAKIT').length;
      const alpa = kehadiranKelas.filter(k => k.status === 'ALPA').length;
      const total = kehadiranKelas.length;

      return {
        nama: kelas.nama,
        totalSiswa: kelas.siswa.length,
        persenHadir: total > 0 ? Math.round((hadir / total) * 100) : 0,
        persenIzin: total > 0 ? Math.round((izin / total) * 100) : 0,
        persenSakit: total > 0 ? Math.round((sakit / total) * 100) : 0,
        persenAlpa: total > 0 ? Math.round((alpa / total) * 100) : 0,
        avgKehadiran: total > 0 ? Math.round((hadir / total) * 100) : 0
      };
    });

    return NextResponse.json({
      summary: {
        totalPertemuan,
        rataKehadiran,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlpa
      },
      trendKehadiran,
      distribusiStatus,
      top10,
      bottom10,
      kelasComparison
    });
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data statistik kehadiran' },
      { status: 500 }
    );
  }
}
