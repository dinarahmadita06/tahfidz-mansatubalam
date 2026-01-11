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
    const tahunAjaranId = searchParams.get('tahunAjaranId');

    // Build where clause
    const whereClause = {};
    if (kelasId) {
      whereClause.kelasId = kelasId;
    }

    // Get all siswa with hafalan
    const siswaList = await prisma.siswa.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true }
        },
        kelas: {
          select: { nama: true }
        },
        hafalan: {
          select: {
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        }
      }
    });

    // Calculate total juz dan stats
    const siswaWithJuz = siswaList.map(siswa => {
      const totalJuz = siswa.hafalan.reduce((sum, h) => {
        const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
        return sum + (ayatCount / 200);
      }, 0);

      return {
        id: siswa.id,
        nama: siswa.user.name,
        kelas: siswa.kelas.nama,
        totalJuz: parseFloat(totalJuz.toFixed(1)),
        jumlahSetoran: siswa.hafalan.length
      };
    });

    const totalSiswa = siswaWithJuz.length;
    const totalJuzAll = siswaWithJuz.reduce((sum, s) => sum + s.totalJuz, 0);
    const rataHafalan = totalSiswa > 0 ? (totalJuzAll / totalSiswa).toFixed(1) : 0;

    // Top 10 siswa
    const top10Siswa = [...siswaWithJuz]
      .sort((a, b) => b.totalJuz - a.totalJuz)
      .slice(0, 10)
      .map(s => ({
        nama: s.nama,
        juz: s.totalJuz
      }));

    // Tren hafalan per bulan (12 bulan terakhir)
    const trendHafalan = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const hafalanMonth = await prisma.hafalan.findMany({
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
        bulan: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        juz: parseFloat(juzMonth.toFixed(1))
      });
    }

    // Perbandingan antar kelas
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

    const kelasComparison = kelasList.map(kelas => {
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
        jumlahSiswa: kelas.siswa.length,
        rataHafalan: parseFloat(rataJuz),
        siswaTerbaik: kelas.siswa.length > 0
          ? kelas.siswa
              .map(s => {
                const juz = s.hafalan.reduce((sum, h) => {
                  const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
                  return sum + (ayatCount / 200);
                }, 0);
                return { id: s.id, juz };
              })
              .sort((a, b) => b.juz - a.juz)[0].juz.toFixed(1)
          : 0
      };
    });

    // Distribusi level hafalan
    const distribusiLevel = [
      { level: '0-5 juz', count: siswaWithJuz.filter(s => s.totalJuz >= 0 && s.totalJuz <= 5).length },
      { level: '6-10 juz', count: siswaWithJuz.filter(s => s.totalJuz > 5 && s.totalJuz <= 10).length },
      { level: '11-20 juz', count: siswaWithJuz.filter(s => s.totalJuz > 10 && s.totalJuz <= 20).length },
      { level: '21-30 juz', count: siswaWithJuz.filter(s => s.totalJuz > 20 && s.totalJuz <= 30).length }
    ];

    return NextResponse.json({
      summary: {
        totalSiswa,
        totalJuz: parseFloat(totalJuzAll.toFixed(1)),
        rataHafalan: parseFloat(rataHafalan),
        targetSemester: 3, // hardcoded, bisa diambil dari config
        realisasi: parseFloat(rataHafalan),
        statusTarget: parseFloat(rataHafalan) >= 3 ? 'Tercapai' : 'Belum Tercapai'
      },
      trendHafalan,
      top10Siswa,
      kelasComparison,
      distribusiLevel
    });
  } catch (error) {
    console.error('Error fetching hafalan statistics:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data statistik hafalan' },
      { status: 500 }
    );
  }
}
