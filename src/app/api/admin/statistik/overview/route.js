export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';


export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get('tahunAjaranId');

    // Get total siswa aktif
    const totalSiswa = await prisma.siswa.count({
      where: { status: 'approved' }
    });

    // Get total guru
    const totalGuru = await prisma.guru.count();

    // Get rata-rata hafalan (dalam juz)
    const allHafalan = await prisma.hafalan.findMany({
      select: {
        ayatMulai: true,
        ayatSelesai: true
      }
    }).catch(() => []);

    const totalJuz = allHafalan.reduce((sum, h) => {
      const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
      const juzFraction = ayatCount / 200;
      return sum + juzFraction;
    }, 0);

    const rataHafalan = totalSiswa > 0 ? (totalJuz / totalSiswa).toFixed(1) : '0';

    // Get rata-rata kehadiran
    const presensi = await prisma.presensi.findMany().catch(() => []);
    const totalHadir = presensi.filter(k => k.status === 'HADIR').length;
    const rataKehadiran = presensi.length > 0
      ? Math.round((totalHadir / presensi.length) * 100)
      : 0;

    // Tren hafalan 6 bulan terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendHafalan = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const hafalanMonth = await prisma.hafalan.findMany({
        where: {
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          ayatMulai: true,
          ayatSelesai: true
        }
      });

      const juzMonth = hafalanMonth.reduce((sum, h) => {
        const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
        return sum + (ayatCount / 200);
      }, 0);

      trendHafalan.push({
        bulan: date.toLocaleDateString('id-ID', { month: 'short' }),
        juz: parseFloat(juzMonth.toFixed(1))
      });
    }

    // Perbandingan hafalan antar kelas
    const kelasList = await prisma.kelas.findMany({
      include: {
        siswa: {
          include: {
            hafalan: {
              select: {
                ayatMulai: true,
                ayatSelesai: true
              }
            }
          }
        }
      }
    });

    const kelasStats = kelasList.map(kelas => {
      const totalJuzKelas = kelas.siswa.reduce((sum, siswa) => {
        const siswaJuz = siswa.hafalan.reduce((s, h) => {
          const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
          return s + (ayatCount / 200);
        }, 0);
        return sum + siswaJuz;
      }, 0);

      const rataJuz = kelas.siswa.length > 0
        ? (totalJuzKelas / kelas.siswa.length).toFixed(1)
        : 0;

      return {
        nama: kelas.nama,
        rataJuz: parseFloat(rataJuz)
      };
    });

    // Distribusi kehadiran
    const distribusiKehadiran = [
      { name: 'Hadir', value: presensi.filter(k => k.status === 'HADIR').length },
      { name: 'Izin', value: presensi.filter(k => k.status === 'IZIN').length },
      { name: 'Sakit', value: presensi.filter(k => k.status === 'SAKIT').length },
      { name: 'Alpa', value: presensi.filter(k => k.status === 'ALPA').length }
    ];

    // Recent achievements (5 siswa dengan hafalan terbanyak bulan ini)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const siswaHafalanBulanIni = await prisma.siswa.findMany({
      include: {
        user: {
          select: { name: true }
        },
        hafalan: {
          where: {
            tanggal: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          select: {
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        }
      }
    });

    const recentAchievements = siswaHafalanBulanIni
      .map(siswa => {
        const juzBulanIni = siswa.hafalan.reduce((sum, h) => {
          const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
          return sum + (ayatCount / 200);
        }, 0);

        return {
          nama: siswa.user.name,
          juz: parseFloat(juzBulanIni.toFixed(1)),
          tanggal: siswa.hafalan.length > 0
            ? siswa.hafalan[siswa.hafalan.length - 1].tanggal
            : null
        };
      })
      .filter(s => s.juz > 0)
      .sort((a, b) => b.juz - a.juz)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalSiswa,
        totalGuru,
        rataHafalan: parseFloat(rataHafalan),
        rataKehadiran
      },
      trendHafalan,
      kelasStats,
      distribusiKehadiran,
      recentAchievements
    });
  } catch (error) {
    console.error('Error fetching overview statistics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data statistik' },
      { status: 500 }
    );
  }
}
