import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hitung semua statistik dari database
    const [
      totalSiswa,
      siswaAktif,
      totalGuru,
      totalKelas,
      kelasAktif,
      allSiswa,
      allHafalan,
      allPenilaian,
      allPresensi
    ] = await Promise.all([
      // Total semua siswa
      prisma.siswa.count(),

      // Siswa dengan status approved (aktif)
      prisma.siswa.count({
        where: { status: 'approved' }
      }),

      // Total guru
      prisma.guru.count(),

      // Total kelas
      prisma.kelas.count(),

      // Kelas aktif
      prisma.kelas.count({
        where: { status: 'AKTIF' }
      }),

      // Semua siswa dengan hafalan untuk menghitung totalJuz
      prisma.siswa.findMany({
        where: { status: 'approved' },
        include: {
          hafalan: {
            select: {
              juz: true
            }
          }
        }
      }),

      // Semua hafalan untuk menghitung rata-rata nilai
      prisma.hafalan.findMany({
        include: {
          penilaian: {
            select: {
              nilaiAkhir: true
            }
          }
        }
      }),

      // Semua penilaian untuk backup rata-rata nilai
      prisma.penilaian.aggregate({
        _avg: {
          nilaiAkhir: true
        }
      }),

      // Semua presensi untuk menghitung kehadiran
      prisma.presensi.findMany({
        select: {
          status: true
        }
      })
    ]);

    // Hitung total juz dari semua siswa
    let totalJuz = 0;
    const juzPerSiswa = new Map();

    allSiswa.forEach(siswa => {
      const uniqueJuz = new Set();
      siswa.hafalan.forEach(h => {
        uniqueJuz.add(h.juz);
      });
      const siswaJuzCount = uniqueJuz.size;
      juzPerSiswa.set(siswa.id, siswaJuzCount);
      totalJuz += siswaJuzCount;
    });

    // Hitung rata-rata nilai dari hafalan yang memiliki penilaian
    let totalNilai = 0;
    let countNilai = 0;

    allHafalan.forEach(hafalan => {
      if (hafalan.penilaian && hafalan.penilaian.length > 0) {
        hafalan.penilaian.forEach(p => {
          if (p.nilaiAkhir !== null && p.nilaiAkhir !== undefined) {
            totalNilai += p.nilaiAkhir;
            countNilai++;
          }
        });
      }
    });

    const rataRataNilai = countNilai > 0
      ? Math.round((totalNilai / countNilai) * 10) / 10
      : (allPenilaian._avg.nilaiAkhir ? Math.round(allPenilaian._avg.nilaiAkhir * 10) / 10 : 0);

    // Hitung rata-rata kehadiran
    const totalPresensi = allPresensi.length;
    const hadirCount = allPresensi.filter(p => p.status === 'HADIR').length;
    const rataRataKehadiran = totalPresensi > 0
      ? Math.round((hadirCount / totalPresensi) * 100 * 10) / 10
      : 0;

    // Hitung siswa mencapai target (≥ 3 juz)
    let siswaMencapaiTarget = 0;
    juzPerSiswa.forEach(juzCount => {
      if (juzCount >= 3) {
        siswaMencapaiTarget++;
      }
    });

    const persentaseSiswaMencapaiTarget = siswaAktif > 0
      ? Math.round((siswaMencapaiTarget / siswaAktif) * 100)
      : 0;

    // Hitung kelas mencapai target (≥ 50% siswa mencapai target)
    const kelasData = await prisma.kelas.findMany({
      where: { status: 'AKTIF' },
      include: {
        siswa: {
          where: { status: 'approved' },
          include: {
            hafalan: {
              select: {
                juz: true
              }
            }
          }
        }
      }
    });

    let kelasMencapaiTarget = 0;

    kelasData.forEach(kelas => {
      if (kelas.siswa.length === 0) return;

      let siswaMencapaiDiKelas = 0;
      kelas.siswa.forEach(siswa => {
        const uniqueJuz = new Set(siswa.hafalan.map(h => h.juz));
        if (uniqueJuz.size >= 3) {
          siswaMencapaiDiKelas++;
        }
      });

      const persentaseMencapai = (siswaMencapaiDiKelas / kelas.siswa.length) * 100;
      if (persentaseMencapai >= 50) {
        kelasMencapaiTarget++;
      }
    });

    // Return data dalam format yang diharapkan dashboard
    return NextResponse.json({
      stats: {
        totalSiswa,
        siswaAktif,
        totalGuru,
        totalJuz,
        rataRataNilai,
        rataRataKehadiran,
        siswaMencapaiTarget,
        persentaseSiswaMencapaiTarget,
        kelasMencapaiTarget,
        totalKelas: kelasAktif,
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}
